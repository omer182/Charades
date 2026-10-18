import { describe, expect, it } from 'vitest';
import { buildDeck, pickGolden } from './deck';
import { currentCard, hydrate, initialState, reducer, standings, type Action } from './reducer';
import type { GameState } from './types';

const run = (state: GameState, ...actions: Action[]) => actions.reduce(reducer, state);

const twoTeams = () =>
  run(initialState(), { type: 'addTeam', name: 'Lions' }, { type: 'addTeam', name: 'Owls' });

const playing = (rounds = 2) =>
  run(
    twoTeams(),
    { type: 'updateSettings', patch: { rounds } },
    { type: 'startGame', deck: ['a', 'b', 'c', 'd'] },
    { type: 'beginTurn', now: 0 },
  );

describe('teams', () => {
  it('assigns distinct colors and ignores blank names', () => {
    const s = run(twoTeams(), { type: 'addTeam', name: '   ' });
    expect(s.teams).toHaveLength(2);
    expect(s.teams[0].color).not.toBe(s.teams[1].color);
  });

  it('cycles to a color no other team uses', () => {
    const s = twoTeams();
    const next = run(s, { type: 'cycleColor', id: s.teams[0].id });
    expect(next.teams[0].color).not.toBe(s.teams[0].color);
    expect(next.teams[0].color).not.toBe(s.teams[1].color);
  });
});

describe('turn flow', () => {
  it('scores got +1 and skip -1, walking the deck', () => {
    const s = run(playing(), { type: 'mark', result: 'got' }, { type: 'mark', result: 'got' }, { type: 'mark', result: 'skip' });
    expect(s.teams[0].score).toBe(1);
    expect(s.cursor).toBe(3);
    expect(s.turn.map((e) => e.card)).toEqual(['a', 'b', 'c']);
  });

  it('skip costs nothing when the penalty is off', () => {
    const s = run(
      twoTeams(),
      { type: 'updateSettings', patch: { skipPenalty: false } },
      { type: 'startGame', deck: ['a', 'b'] },
      { type: 'beginTurn', now: 0 },
      { type: 'mark', result: 'skip' },
    );
    expect(s.teams[0].score).toBe(0);
  });

  it('undo reverts score and returns to the previous card', () => {
    const s = run(playing(), { type: 'mark', result: 'got' }, { type: 'mark', result: 'skip' }, { type: 'undo' });
    expect(s.teams[0].score).toBe(1);
    expect(s.cursor).toBe(1);
    expect(s.turn).toHaveLength(1);
  });

  it('ignores marks while paused, and resume keeps the remaining time', () => {
    let s = run(playing(), { type: 'pause', now: 20_000 });
    expect(s.timer).toEqual({ endsAt: null, remainingMs: 40_000 });
    s = run(s, { type: 'mark', result: 'got' });
    expect(s.teams[0].score).toBe(0);
    s = run(s, { type: 'resume', now: 100_000 });
    expect(s.timer.endsAt).toBe(140_000);
  });

  it('lets the turn review flip a mistaken result', () => {
    const s = run(playing(), { type: 'mark', result: 'skip' }, { type: 'timeUp' }, { type: 'toggleEntry', index: 0 });
    expect(s.turn[0].result).toBe('got');
    expect(s.teams[0].score).toBe(1);
  });

  it('rotates teams, then rounds, then ends the game', () => {
    let s = playing(2);
    const phases: string[] = [];
    for (let turn = 0; turn < 4; turn++) {
      s = run(s, { type: 'timeUp' }, { type: 'nextTurn' });
      phases.push(`${s.phase}:${s.round}:${s.teamIndex}`);
      if (s.phase === 'ready') s = run(s, { type: 'beginTurn', now: 0 });
    }
    expect(phases).toEqual(['ready:1:1', 'ready:2:0', 'ready:2:1', 'gameOver:2:1']);
  });
});

describe('standings', () => {
  it('gives tied teams the same rank and marks co-leaders', () => {
    const s = run(twoTeams(), { type: 'addTeam', name: 'Bees' });
    const [a, b, c] = s.teams;
    const scored = run(s, { type: 'adjustScore', id: a.id, delta: 3 }, { type: 'adjustScore', id: b.id, delta: 3 }, { type: 'adjustScore', id: c.id, delta: 1 });
    const rows = standings(scored.teams);
    expect(rows.map((r) => r.rank)).toEqual([1, 1, 3]);
    expect(rows.filter((r) => r.isLeader)).toHaveLength(2);
  });
});

describe('hydrate', () => {
  it('restores a running turn as paused with the time that was left', () => {
    const saved = playing();
    const restored = hydrate(JSON.parse(JSON.stringify(saved)), 45_000)!;
    expect(restored.timer).toEqual({ endsAt: null, remainingMs: 15_000 });
  });

  it('rejects state from the old app', () => {
    expect(hydrate({ teams: [], isGameActive: true }, 0)).toBeNull();
  });
});

describe('buildDeck', () => {
  it('uses every card exactly once and leads with easy ones', () => {
    const names = ['e1', 'e2', 'e3', 'e4', 'm1', 'm2', 'h1', 'x'];
    const level = (n: string) => (n.startsWith('e') ? 'easy' : n.startsWith('m') ? 'medium' : n.startsWith('h') ? 'hard' : undefined);
    const deck = buildDeck(names, level);
    expect([...deck].sort()).toEqual([...names].sort());
    expect(deck.slice(0, 3).every((n) => n.startsWith('e'))).toBe(true);
  });
});

describe('end of turn', () => {
  it('the card showing at the buzzer is not dealt to the next team', () => {
    const s = run(playing(), { type: 'mark', result: 'got' }, { type: 'timeUp' }, { type: 'nextTurn' }, { type: 'beginTurn', now: 0 });
    expect(currentCard(s)).toBe('c');
    expect(s.turn).toEqual([]);
  });
});

describe('golden cards', () => {
  const goldenGame = () =>
    run(twoTeams(), { type: 'startGame', deck: ['a', 'b', 'c'], golden: ['b'] }, { type: 'beginTurn', now: 0 });

  it('scores a guessed golden card double, and undo takes both points back', () => {
    const s = run(goldenGame(), { type: 'mark', result: 'got' }, { type: 'mark', result: 'got' });
    expect(s.teams[0].score).toBe(3);
    expect(s.turn[1]).toMatchObject({ card: 'b', delta: 2, golden: true });
    expect(run(s, { type: 'undo' }).teams[0].score).toBe(1);
  });

  it('a skipped golden card costs the normal penalty, and fixing the call gives 2', () => {
    const s = run(goldenGame(), { type: 'mark', result: 'got' }, { type: 'mark', result: 'skip' }, { type: 'timeUp' });
    expect(s.teams[0].score).toBe(0);
    expect(run(s, { type: 'toggleEntry', index: 1 }).teams[0].score).toBe(3);
  });

  it('hard cards turn golden far more often than easy ones', () => {
    const names = Array.from({ length: 2000 }, (_, i) => `${i % 2 ? 'hard' : 'easy'}${i}`);
    const golden = pickGolden(names, (n) => (n.startsWith('hard') ? 'hard' : 'easy'));
    const hard = golden.filter((n) => n.startsWith('hard')).length;
    expect(hard).toBeGreaterThan(5 * (golden.length - hard));
  });

  it('restores older saves without a golden list', () => {
    const old: Partial<GameState> = goldenGame();
    delete old.golden;
    expect(hydrate(old, 0)?.golden).toEqual([]);
  });
});
