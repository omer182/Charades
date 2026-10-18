import type { CardResult, CategoryId, GameState, Settings, Team, TurnEntry } from './types';

export const ALL_CATEGORIES: CategoryId[] = ['animals', 'food', 'objects', 'people', 'actions', 'movies', 'tv', 'books', 'phrases'];

export const MAX_TEAMS = 8;

export const TEAM_COLORS = [
  '#ff5d73', // coral
  '#4cc9f0', // sky
  '#ffd23f', // sun
  '#3ddc97', // mint
  '#a78bfa', // violet
  '#ff8c42', // tangerine
  '#f472b6', // pink
  '#a3e635', // lime
];

export const DEFAULT_SETTINGS: Settings = {
  rounds: 3,
  turnSeconds: 60,
  skipPenalty: true,
  sound: true,
  categories: ALL_CATEGORIES,
};

export const initialState = (settings: Settings = DEFAULT_SETTINGS): GameState => ({
  version: 2,
  phase: 'lobby',
  teams: [],
  settings,
  deck: [],
  golden: [],
  cursor: 0,
  round: 1,
  teamIndex: 0,
  turn: [],
  timer: { endsAt: null, remainingMs: settings.turnSeconds * 1000 },
});

export type Action =
  | { type: 'addTeam'; name: string }
  | { type: 'removeTeam'; id: string }
  | { type: 'renameTeam'; id: string; name: string }
  | { type: 'cycleColor'; id: string }
  | { type: 'adjustScore'; id: string; delta: number }
  | { type: 'updateSettings'; patch: Partial<Settings> }
  | { type: 'startGame'; deck: string[]; golden?: string[] }
  | { type: 'beginTurn'; now: number }
  | { type: 'mark'; result: CardResult }
  | { type: 'undo' }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'timeUp' }
  | { type: 'toggleEntry'; index: number }
  | { type: 'nextTurn' }
  | { type: 'endGame' }
  | { type: 'playAgain' }
  | { type: 'reset' };

const uid = () => Math.random().toString(36).slice(2, 10);

/** A guessed card is worth 1 (2 if golden); a skip costs 1 when the penalty is on. */
const entryDelta = (result: CardResult, settings: Settings, golden = false) =>
  result === 'got' ? (golden ? 2 : 1) : settings.skipPenalty ? -1 : 0;

export const isGolden = (s: GameState, card: string) => s.golden.includes(card);

const withScore = (teams: Team[], index: number, delta: number) =>
  teams.map((t, i) => (i === index ? { ...t, score: t.score + delta } : t));

const fullTimer = (s: Settings) => ({ endsAt: null, remainingMs: s.turnSeconds * 1000 });

export const currentCard = (s: GameState) => (s.deck.length ? s.deck[s.cursor % s.deck.length] : undefined);

export const isFinalTurn = (s: GameState) =>
  s.round >= s.settings.rounds && s.teamIndex >= s.teams.length - 1;

export const turnPoints = (turn: TurnEntry[]) => turn.reduce((sum, e) => sum + e.delta, 0);

/** Teams sorted by score with competition ranking (ties share a place). */
export function standings(teams: Team[]) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  return sorted.map((team) => ({
    team,
    rank: sorted.findIndex((t) => t.score === team.score) + 1,
    isLeader: team.score === sorted[0].score,
  }));
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'addTeam': {
      const name = action.name.trim();
      if (!name || state.teams.length >= MAX_TEAMS) return state;
      const used = new Set(state.teams.map((t) => t.color));
      const color = TEAM_COLORS.find((c) => !used.has(c)) ?? TEAM_COLORS[state.teams.length % TEAM_COLORS.length];
      return { ...state, teams: [...state.teams, { id: uid(), name, color, score: 0 }] };
    }

    case 'removeTeam':
      if (state.phase !== 'lobby') return state;
      return { ...state, teams: state.teams.filter((t) => t.id !== action.id) };

    case 'renameTeam': {
      const name = action.name.trim();
      if (!name) return state;
      return { ...state, teams: state.teams.map((t) => (t.id === action.id ? { ...t, name } : t)) };
    }

    case 'cycleColor': {
      const used = new Set(state.teams.filter((t) => t.id !== action.id).map((t) => t.color));
      return {
        ...state,
        teams: state.teams.map((t) => {
          if (t.id !== action.id) return t;
          const start = TEAM_COLORS.indexOf(t.color);
          for (let step = 1; step <= TEAM_COLORS.length; step++) {
            const next = TEAM_COLORS[(start + step) % TEAM_COLORS.length];
            if (!used.has(next)) return { ...t, color: next };
          }
          return t;
        }),
      };
    }

    case 'adjustScore':
      return {
        ...state,
        teams: state.teams.map((t) => (t.id === action.id ? { ...t, score: t.score + action.delta } : t)),
      };

    case 'updateSettings': {
      const settings = { ...state.settings, ...action.patch };
      const timer = state.phase === 'lobby' ? fullTimer(settings) : state.timer;
      return { ...state, settings, timer };
    }

    case 'startGame':
      if (state.teams.length === 0 || action.deck.length === 0) return state;
      return {
        ...state,
        phase: 'ready',
        teams: state.teams.map((t) => ({ ...t, score: 0 })),
        deck: action.deck,
        golden: action.golden ?? [],
        cursor: 0,
        round: 1,
        teamIndex: 0,
        turn: [],
        timer: fullTimer(state.settings),
      };

    case 'beginTurn':
      if (state.phase !== 'ready') return state;
      return {
        ...state,
        phase: 'playing',
        turn: [],
        timer: { endsAt: action.now + state.settings.turnSeconds * 1000, remainingMs: state.settings.turnSeconds * 1000 },
      };

    case 'mark': {
      if (state.phase !== 'playing' || state.timer.endsAt === null) return state;
      const card = currentCard(state);
      if (card === undefined) return state;
      const golden = isGolden(state, card);
      const delta = entryDelta(action.result, state.settings, golden);
      return {
        ...state,
        teams: withScore(state.teams, state.teamIndex, delta),
        turn: [...state.turn, { card, result: action.result, delta, ...(golden && { golden }) }],
        cursor: state.cursor + 1,
      };
    }

    case 'undo': {
      if (state.phase !== 'playing' || state.turn.length === 0) return state;
      const last = state.turn[state.turn.length - 1];
      return {
        ...state,
        teams: withScore(state.teams, state.teamIndex, -last.delta),
        turn: state.turn.slice(0, -1),
        cursor: state.cursor - 1,
      };
    }

    case 'pause':
      if (state.phase !== 'playing' || state.timer.endsAt === null) return state;
      return { ...state, timer: { endsAt: null, remainingMs: Math.max(0, state.timer.endsAt - action.now) } };

    case 'resume':
      if (state.phase !== 'playing' || state.timer.endsAt !== null) return state;
      return { ...state, timer: { ...state.timer, endsAt: action.now + state.timer.remainingMs } };

    case 'timeUp':
      if (state.phase !== 'playing') return state;
      return { ...state, phase: 'turnEnd', timer: { endsAt: null, remainingMs: 0 } };

    case 'toggleEntry': {
      if (state.phase !== 'turnEnd') return state;
      const entry = state.turn[action.index];
      if (!entry) return state;
      const result: CardResult = entry.result === 'got' ? 'skip' : 'got';
      const delta = entryDelta(result, state.settings, entry.golden);
      return {
        ...state,
        teams: withScore(state.teams, state.teamIndex, delta - entry.delta),
        turn: state.turn.map((e, i) => (i === action.index ? { ...e, result, delta } : e)),
      };
    }

    case 'nextTurn': {
      if (state.phase !== 'turnEnd') return state;
      if (isFinalTurn(state)) return { ...state, phase: 'gameOver' };
      const wraps = state.teamIndex >= state.teams.length - 1;
      return {
        ...state,
        phase: 'ready',
        teamIndex: wraps ? 0 : state.teamIndex + 1,
        round: wraps ? state.round + 1 : state.round,
        turn: [],
        timer: fullTimer(state.settings),
      };
    }

    case 'endGame':
      if (state.phase === 'lobby') return state;
      return { ...state, phase: 'gameOver', timer: { endsAt: null, remainingMs: 0 } };

    case 'playAgain':
      return { ...initialState(state.settings), teams: state.teams.map((t) => ({ ...t, score: 0 })) };

    case 'reset':
      return initialState(state.settings);
  }
}

/** Restores a persisted game. A turn that was running when the page closed comes back paused. */
export function hydrate(raw: unknown, now: number): GameState | null {
  if (!raw || typeof raw !== 'object' || (raw as GameState).version !== 2) return null;
  const saved = raw as GameState;
  const settings = { ...DEFAULT_SETTINGS, ...saved.settings };
  const state = { ...saved, golden: saved.golden ?? [] };
  if (state.phase === 'playing' && state.timer.endsAt !== null) {
    return { ...state, settings, timer: { endsAt: null, remainingMs: Math.max(0, state.timer.endsAt - now) } };
  }
  return { ...state, settings };
}
