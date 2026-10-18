// The production server: serves the built site and runs phone-remote rooms over Socket.IO.
//   npm run dev:server   (port 3001; Vite proxies /socket.io to it)
//   node dist-server/index.mjs   (port 3000, what the Docker image runs)
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { Server, type Socket } from 'socket.io';
import { CODE_PATTERN, type ClientToServer, type Role, type ServerToClient } from '../src/net/protocol';
import { createRooms } from './rooms';

const PORT = Number(process.env.PORT ?? (process.env.NODE_ENV === 'production' ? 3000 : 3001));
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');

interface SocketData {
  code?: string;
  role?: Role;
}
type Client = Socket<ClientToServer, ServerToClient, Record<string, never>, SocketData>;

// Fingerprinted build output never changes; everything else (index.html, sounds, icons) revalidates.
const site = existsSync(DIST)
  ? sirv(DIST, {
      single: true,
      etag: true,
      setHeaders: (res, pathname) =>
        res.setHeader('Cache-Control', pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache'),
    })
  : null;

const http = createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }
  if (site) site(req, res, () => void res.writeHead(404).end());
  else res.writeHead(404).end('Run `npm run build` first, or use the Vite dev server.');
});

const io = new Server<ClientToServer, ServerToClient, Record<string, never>, SocketData>(http, {
  // Game states are a few KB; this is plenty and stops abuse.
  maxHttpBufferSize: 256 * 1024,
});
const rooms = createRooms();

const remotesIn = (code: string) => {
  let n = 0;
  for (const s of io.sockets.adapter.rooms.get(code) ?? []) if (io.sockets.sockets.get(s)?.data.role === 'remote') n++;
  return n;
};
const announcePresence = (code: string) => io.to(code).emit('presence', { remotes: remotesIn(code) });

const leave = (socket: Client) => {
  const { code } = socket.data;
  if (!code) return;
  socket.leave(code);
  socket.data = {};
  announcePresence(code);
};

io.on('connection', (socket: Client) => {
  socket.on('join', (req, ack) => {
    if (typeof ack !== 'function') return;
    if (!req || (req.role !== 'screen' && req.role !== 'remote')) return ack({ ok: false, error: 'bad-request' });
    leave(socket);

    const code = typeof req.code === 'string' ? req.code.toUpperCase() : undefined;
    if (code !== undefined && !CODE_PATTERN.test(code)) return ack({ ok: false, error: 'not-found' });
    let room = code ? rooms.get(code) : undefined;

    if (req.role === 'remote') {
      if (!room) return ack({ ok: false, error: 'not-found' });
    } else if (!room) {
      // A new room, or one this server forgot (restart): rebuild it from the screen's game.
      room = rooms.open(req.snapshot, code) ?? undefined;
      if (!room) return ack({ ok: false, error: 'bad-request' });
    } else if (req.force && !rooms.replace(room, req.snapshot)) {
      return ack({ ok: false, error: 'bad-request' });
    }

    socket.data = { code: room.code, role: req.role };
    socket.join(room.code);
    ack({ ok: true, code: room.code, state: room.state, serverNow: Date.now(), remotes: remotesIn(room.code) });
    announcePresence(room.code);
    // A forced screen state is news to anyone else already in the room.
    if (req.force) socket.to(room.code).emit('state', { state: room.state, serverNow: Date.now() });
  });

  socket.on('action', (msg) => {
    const { code, role } = socket.data;
    const room = code ? rooms.get(code) : undefined;
    if (!room || !role || !msg || typeof msg.id !== 'string') return;
    const res = rooms.apply(room, msg.id, msg.action, role);
    if (!res.ok) return;
    if (res.duplicate) socket.emit('state', { state: room.state, serverNow: Date.now(), applied: msg.id });
    else io.to(room.code).emit('state', { state: room.state, serverNow: Date.now(), applied: msg.id });
  });

  socket.on('cue', (cue) => {
    const { code } = socket.data;
    if (code && cue?.type === 'go') socket.to(code).emit('cue', { type: 'go' });
  });

  socket.on('leave', () => leave(socket));
  socket.on('disconnect', () => {
    if (socket.data.code) announcePresence(socket.data.code);
  });
});

setInterval(() => rooms.sweep(), 10 * 60 * 1000).unref();

http.listen(PORT, () => console.log(`speechless listening on :${PORT}${site ? '' : ' (no build found; API only)'}`));
