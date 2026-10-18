import type { Action } from '../game/reducer';
import type { GameState } from '../game/types';

/**
 * Messages between the big screen, phone remotes and the room server (Socket.IO).
 * The server owns a room's game state: clients send actions, it runs the same reducer the
 * offline game uses and broadcasts the result.
 */

export type Role = 'screen' | 'remote';

export const ACTION_TYPES = [
  'addTeam', 'removeTeam', 'renameTeam', 'cycleColor', 'adjustScore', 'updateSettings', 'startGame',
  'beginTurn', 'mark', 'undo', 'pause', 'resume', 'timeUp', 'toggleEntry', 'nextTurn', 'endGame',
  'playAgain', 'reset',
] as const satisfies readonly Action['type'][];

/** What a phone may do: run a turn and its review. Setting up teams and decks stays on the screen. */
export const REMOTE_ACTIONS: readonly Action['type'][] = ['mark', 'undo', 'pause', 'resume', 'timeUp', 'toggleEntry', 'nextTurn'];

/** A phone asking the screen to start something only the screen animates, like the 3-2-1. */
export type Cue = { type: 'go' };

export interface JoinRequest {
  role: Role;
  /** Room to join. A screen without one opens a new room. */
  code?: string;
  /** The screen's own copy of the game: seeds a new room, or rebuilds one the server lost. */
  snapshot?: GameState;
  /** The screen kept playing while disconnected: its snapshot replaces the room's state. */
  force?: boolean;
}

export type JoinResult =
  | { ok: true; code: string; state: GameState; serverNow: number; remotes: number }
  | { ok: false; error: 'not-found' | 'bad-request' };

export interface ActionMessage {
  /** Client-made id, so a resend after a reconnect is applied once. */
  id: string;
  action: Action;
}

export interface StateMessage {
  state: GameState;
  serverNow: number;
  /** Id of the action that produced this state, so its sender can drop it from its pending list. */
  applied?: string;
}

export interface ServerToClient {
  state: (msg: StateMessage) => void;
  presence: (msg: { remotes: number }) => void;
  cue: (cue: Cue) => void;
}

export interface ClientToServer {
  join: (req: JoinRequest, ack: (res: JoinResult) => void) => void;
  action: (msg: ActionMessage) => void;
  cue: (cue: Cue) => void;
  leave: () => void;
}

/** Room codes: four letters, skipping ones easily confused when read off a TV. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const CODE_PATTERN = /^[A-Z]{4}$/;
