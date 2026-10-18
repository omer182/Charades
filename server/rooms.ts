import { hydrate, reducer, type Action } from '../src/game/reducer';
import type { GameState } from '../src/game/types';
import { ACTION_TYPES, CODE_ALPHABET, CODE_PATTERN, REMOTE_ACTIONS, type Role } from '../src/net/protocol';

export interface Room {
  code: string;
  state: GameState;
  /** Ids of recently applied actions, so a client resending after a reconnect doesn't double up. */
  recent: string[];
  touchedAt: number;
}

const RECENT_LIMIT = 200;
/** Rooms nobody touched for this long are dropped. */
export const ROOM_TTL_MS = 8 * 60 * 60 * 1000;

const KNOWN = new Set<string>(ACTION_TYPES);
const FROM_REMOTE = new Set<string>(REMOTE_ACTIONS);

export type ApplyResult = { ok: true; state: GameState; duplicate: boolean } | { ok: false; reason: string };

/** In-memory rooms. Pure apart from the injected clock and dice, so it's easy to test. */
export function createRooms({ now = Date.now, random = Math.random } = {}) {
  const rooms = new Map<string, Room>();

  const newCode = () => {
    for (;;) {
      const code = Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)]).join('');
      if (!rooms.has(code)) return code;
    }
  };

  const restore = (snapshot: unknown) => hydrate(snapshot, now());

  return {
    get: (code: string) => rooms.get(code),
    size: () => rooms.size,

    /** Opens a room from a screen's game, under the given code when rebuilding one after a restart. */
    open(snapshot: unknown, code?: string): Room | null {
      const state = restore(snapshot);
      if (!state) return null;
      const reuse = code !== undefined && CODE_PATTERN.test(code) && !rooms.has(code);
      const room: Room = { code: reuse ? code : newCode(), state, recent: [], touchedAt: now() };
      rooms.set(room.code, room);
      return room;
    },

    /** A screen that played on while offline: its game wins. */
    replace(room: Room, snapshot: unknown): boolean {
      const state = restore(snapshot);
      if (!state) return false;
      room.state = state;
      room.touchedAt = now();
      return true;
    },

    apply(room: Room, id: string, raw: unknown, role: Role): ApplyResult {
      const action = raw as Action;
      if (!action || typeof action !== 'object' || !KNOWN.has(action.type)) return { ok: false, reason: 'unknown action' };
      if (role === 'remote' && !FROM_REMOTE.has(action.type)) return { ok: false, reason: 'not allowed from a remote' };
      room.touchedAt = now();
      if (room.recent.includes(id)) return { ok: true, state: room.state, duplicate: true };
      // Timestamps come from the server clock, so every device agrees when the turn ends.
      const stamped = 'now' in action ? { ...action, now: now() } : action;
      try {
        room.state = reducer(room.state, stamped);
      } catch {
        return { ok: false, reason: 'malformed action' };
      }
      room.recent.push(id);
      if (room.recent.length > RECENT_LIMIT) room.recent.splice(0, room.recent.length - RECENT_LIMIT);
      return { ok: true, state: room.state, duplicate: false };
    },

    /** Drops rooms idle past the TTL; returns how many went. */
    sweep(): number {
      let dropped = 0;
      for (const [code, room] of rooms) {
        if (now() - room.touchedAt > ROOM_TTL_MS) {
          rooms.delete(code);
          dropped++;
        }
      }
      return dropped;
    },
  };
}

export type Rooms = ReturnType<typeof createRooms>;
