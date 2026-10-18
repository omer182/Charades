import { io, type Socket } from 'socket.io-client';
import { reducer, type Action } from '../game/reducer';
import type { GameState } from '../game/types';
import { syncClock, serverNow } from './clock';
import type { ClientToServer, Cue, JoinResult, Role, ServerToClient } from './protocol';

export type RoomStatus = 'connecting' | 'live' | 'offline' | 'not-found';

export interface RoomSnapshot {
  status: RoomStatus;
  code: string | null;
  /** The game as this device sees it: the server's state with its own unconfirmed taps on top. */
  state: GameState | null;
  remotes: number;
}

interface Pending {
  id: string;
  action: Action;
  sent: boolean;
}

const deviceId = Math.random().toString(36).slice(2, 8);
const REJOIN_TRIES = 30;
const REJOIN_DELAY_MS = 2000;
let seq = 0;

/**
 * One device's link to a room. Taps apply instantly (optimistically) and are sent to the server;
 * each state the server broadcasts replaces the local copy, with still-unconfirmed taps replayed
 * on top, so a slow network never makes a card jump back.
 */
export class RoomClient {
  private socket: Socket<ServerToClient, ClientToServer>;
  private base: GameState | null = null;
  private pending: Pending[] = [];
  private listeners = new Set<() => void>();
  private snapshot: RoomSnapshot;
  private closed = false;
  private retries = 0;

  constructor(
    private readonly role: Role,
    code: string | null,
    /** A screen's own game, for opening a room or rebuilding one the server lost. */
    private readonly localState: () => GameState | null,
    private readonly onCue?: (cue: Cue) => void,
  ) {
    this.snapshot = { status: 'connecting', code, state: null, remotes: 0 };
    this.socket = io({ transports: ['websocket', 'polling'], reconnectionDelayMax: 4000 });
    this.socket.on('connect', () => this.join());
    const lost = () => {
      if (this.snapshot.status !== 'not-found') this.update({ status: 'offline' });
    };
    this.socket.on('connect_error', lost);
    this.socket.on('disconnect', lost);
    this.socket.on('state', (msg) => {
      syncClock(msg.serverNow);
      if (msg.applied) this.pending = this.pending.filter((p) => p.id !== msg.applied);
      this.base = msg.state;
      this.recompute();
    });
    this.socket.on('presence', ({ remotes }) => this.update({ remotes }));
    this.socket.on('cue', (cue) => this.onCue?.(cue));
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getSnapshot = () => this.snapshot;

  dispatch(action: Action) {
    // Timed actions use the room's clock, the same one the server stamps with.
    const stamped = 'now' in action ? { ...action, now: serverNow() } : action;
    const item: Pending = { id: `${deviceId}-${++seq}`, action: stamped, sent: false };
    this.pending.push(item);
    this.recompute();
    this.flush();
  }

  cue(cue: Cue) {
    if (this.snapshot.status === 'live') this.socket.emit('cue', cue);
  }

  /** Leaves the room; returns this device's last view of the game. */
  close(): GameState | null {
    this.closed = true;
    if (this.socket.connected) this.socket.emit('leave');
    this.socket.disconnect();
    this.listeners.clear();
    return this.snapshot.state;
  }

  private join() {
    // Taps made while offline mean the screen played on: its game should win over the room's.
    const offlineTaps = this.role === 'screen' && this.pending.length > 0;
    const snapshot = this.role === 'screen' ? (this.snapshot.state ?? this.localState() ?? undefined) : undefined;
    this.socket.emit(
      'join',
      { role: this.role, code: this.snapshot.code ?? undefined, snapshot, force: offlineTaps },
      (res: JoinResult) => {
        if (this.closed) return;
        if (!res.ok) {
          // A remote that was already in the room is probably just faster back than the screen after a
          // server restart (the screen rebuilds the room): keep trying for a while before giving up.
          const wasIn = this.snapshot.state !== null;
          if (res.error === 'not-found' && wasIn && this.retries < REJOIN_TRIES) {
            this.retries++;
            this.update({ status: 'offline' });
            setTimeout(() => !this.closed && this.socket.connected && this.join(), REJOIN_DELAY_MS);
            return;
          }
          this.update({ status: res.error === 'not-found' ? 'not-found' : 'offline' });
          if (res.error === 'not-found') this.socket.disconnect();
          return;
        }
        this.retries = 0;
        syncClock(res.serverNow);
        this.base = res.state;
        // The forced snapshot already contains the offline taps.
        if (offlineTaps) this.pending = [];
        this.snapshot = { ...this.snapshot, status: 'live', code: res.code, remotes: res.remotes };
        this.recompute();
        for (const p of this.pending) p.sent = false;
        this.flush();
      },
    );
  }

  private flush() {
    if (this.snapshot.status !== 'live') return;
    for (const p of this.pending) {
      if (p.sent) continue;
      this.socket.emit('action', { id: p.id, action: p.action });
      p.sent = true;
    }
  }

  private recompute() {
    const base = this.base ?? (this.role === 'screen' ? this.localState() : null);
    this.update({ state: base ? this.pending.reduce((s, p) => reducer(s, p.action), base) : null });
  }

  private update(patch: Partial<RoomSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    for (const fn of this.listeners) fn();
  }
}
