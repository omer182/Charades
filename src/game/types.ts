export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
}

export type CardResult = 'got' | 'skip';

export interface TurnEntry {
  card: string;
  result: CardResult;
  /** Points this entry added to the team, so undo/toggle can revert exactly. */
  delta: number;
}

export interface Settings {
  rounds: number;
  turnSeconds: number;
  skipPenalty: boolean;
  sound: boolean;
}

/**
 * lobby    → setting up teams and options
 * ready    → hand the device to the next actor
 * playing  → clock running (or paused, when timer.endsAt is null)
 * turnEnd  → review the turn's cards, see standings
 * gameOver → podium
 */
export type Phase = 'lobby' | 'ready' | 'playing' | 'turnEnd' | 'gameOver';

export interface TimerState {
  /** Epoch ms when the turn ends; null while paused. */
  endsAt: number | null;
  /** Remaining ms, authoritative while paused. */
  remainingMs: number;
}

export interface GameState {
  version: 2;
  phase: Phase;
  teams: Team[];
  settings: Settings;
  /** Card names in play order; a cursor walks it so cards don't repeat within a game. */
  deck: string[];
  cursor: number;
  round: number;
  teamIndex: number;
  turn: TurnEntry[];
  timer: TimerState;
}
