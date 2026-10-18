import type { GameState } from '../game/types';
import { resetClock, serverNow } from './clock';
import type { Cue } from './protocol';
import { RoomClient, type RoomSnapshot } from './roomClient';

/**
 * The big screen's (optional) room. Closed, the game runs offline exactly as before; open, the
 * game lives on the server and phones that scan the QR can run turns.
 */
const KEY = 'charades:room';

export interface ScreenRoom extends RoomSnapshot {
  open: boolean;
}

const CLOSED: ScreenRoom = { open: false, status: 'offline', code: null, state: null, remotes: 0 };

let client: RoomClient | null = null;
let snapshot: ScreenRoom = CLOSED;
let localState: () => GameState | null = () => null;
const listeners = new Set<() => void>();
const cueListeners = new Set<(cue: Cue) => void>();

const emit = () => listeners.forEach((fn) => fn());

const savedCode = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const saveCode = (code: string | null) => {
  try {
    if (code) localStorage.setItem(KEY, code);
    else localStorage.removeItem(KEY);
  } catch {
    // the room just won't survive a reload
  }
};

function connect(code: string | null) {
  client = new RoomClient('screen', code, () => localState(), (cue) => cueListeners.forEach((fn) => fn(cue)));
  client.subscribe(() => {
    const s = client!.getSnapshot();
    snapshot = { ...s, open: true };
    if (s.code) saveCode(s.code);
    emit();
  });
  snapshot = { ...client.getSnapshot(), open: true };
  emit();
}

export const screenRoom = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getSnapshot: () => snapshot,

  /** Where the room gets the screen's offline game from when it opens or needs rebuilding. */
  setLocalState(get: () => GameState | null) {
    localState = get;
  },

  /** Reconnects to the room this screen had open before a reload. */
  resume() {
    const code = savedCode();
    if (code && !client) connect(code);
  },

  open() {
    if (!client) connect(null);
  },

  /**
   * Back to offline play. Returns the room's game converted to this device's clock, so a turn
   * that was running keeps the right time left.
   */
  close(): GameState | null {
    if (!client) return null;
    const last = client.close();
    client = null;
    saveCode(null);
    const state =
      last && last.timer.endsAt !== null
        ? { ...last, timer: { ...last.timer, endsAt: last.timer.endsAt - (serverNow() - Date.now()) } }
        : last;
    resetClock();
    snapshot = CLOSED;
    emit();
    return state;
  },

  dispatch: (...args: Parameters<RoomClient['dispatch']>) => client?.dispatch(...args),

  onCue(fn: (cue: Cue) => void) {
    cueListeners.add(fn);
    return () => cueListeners.delete(fn);
  },
};
