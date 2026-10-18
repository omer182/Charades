import { describe, expect, it } from 'vitest';
import { initialState, reducer, type Action } from '../src/game/reducer';
import { createRooms, ROOM_TTL_MS } from './rooms';

const game = () =>
  ([
    { type: 'addTeam', name: 'אריות' },
    { type: 'addTeam', name: 'ינשופים' },
    { type: 'startGame', deck: ['a', 'b', 'c'] },
  ] as Action[]).reduce(reducer, initialState());

describe('rooms', () => {
  it('opens a room from a screen snapshot with a four-letter code', () => {
    const room = createRooms().open(game())!;
    expect(room.code).toMatch(/^[A-Z]{4}$/);
    expect(room.state.phase).toBe('ready');
  });

  it('rejects snapshots that are not a game', () => {
    expect(createRooms().open({ hello: 1 })).toBeNull();
  });

  it('rebuilds a room under its old code after a restart', () => {
    expect(createRooms().open(game(), 'KXPD')!.code).toBe('KXPD');
  });

  it('stamps turn timing with the server clock', () => {
    const rooms = createRooms({ now: () => 1_000_000 });
    const room = rooms.open(game())!;
    const res = rooms.apply(room, 'x1', { type: 'beginTurn', now: 5 }, 'screen');
    expect(res.ok && res.state.timer.endsAt).toBe(1_000_000 + 60_000);
  });

  it('applies an action once even if it is resent', () => {
    const rooms = createRooms();
    const room = rooms.open(game())!;
    rooms.apply(room, 'b', { type: 'beginTurn', now: 0 }, 'screen');
    rooms.apply(room, 'm1', { type: 'mark', result: 'got' }, 'remote');
    const again = rooms.apply(room, 'm1', { type: 'mark', result: 'got' }, 'remote');
    expect(again.ok && again.duplicate).toBe(true);
    expect(room.state.cursor).toBe(1);
  });

  it('lets a remote run a turn but not set up the game', () => {
    const rooms = createRooms();
    const room = rooms.open(game())!;
    expect(rooms.apply(room, '1', { type: 'addTeam', name: 'x' }, 'remote').ok).toBe(false);
    expect(rooms.apply(room, '2', { type: 'reset' }, 'remote').ok).toBe(false);
    expect(rooms.apply(room, '3', { type: 'nope' }, 'screen').ok).toBe(false);
    expect(room.state.teams).toHaveLength(2);
  });

  it('drops rooms nobody touched for the TTL', () => {
    let t = 0;
    const rooms = createRooms({ now: () => t });
    rooms.open(game());
    t = ROOM_TTL_MS + 1;
    expect(rooms.sweep()).toBe(1);
    expect(rooms.size()).toBe(0);
  });
});
