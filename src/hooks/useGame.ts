import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CARDS } from '../game/cards';
import { markPlayed } from '../game/played';
import { hydrate, initialState, reducer, type Action } from '../game/reducer';
import type { GameState } from '../game/types';
import { screenRoom } from '../net/screenRoom';

const KEY = 'charades:v2';

function load(): GameState {
  try {
    localStorage.removeItem('charadesGameState'); // v1 state, incompatible
    const state = hydrate(JSON.parse(localStorage.getItem(KEY) ?? 'null'), Date.now());
    if (!state) return initialState();
    // Cards can be removed between deploys; drop cards that no longer exist.
    const deck = state.deck.filter((name) => name in CARDS);
    return deck.length === state.deck.length ? state : { ...state, deck, cursor: 0 };
  } catch {
    return initialState();
  }
}

/**
 * The game on the big screen. Offline it's a local reducer; with a room open (phone control) the
 * room's state is the game and actions go through the server. Either way it's saved locally.
 */
export function useGame() {
  const [local, setLocal] = useState(load);
  const room = useSyncExternalStore(screenRoom.subscribe, screenRoom.getSnapshot);
  const localRef = useRef(local);

  useEffect(() => {
    localRef.current = local;
  });

  // Reconnect to a room left open before a reload.
  useEffect(() => {
    screenRoom.setLocalState(() => localRef.current);
    screenRoom.resume();
  }, []);

  const state = room.open && room.state ? room.state : local;

  const dispatch = useCallback((action: Action) => {
    if (screenRoom.getSnapshot().open) screenRoom.dispatch(action);
    else setLocal((s) => reducer(s, action));
  }, []);

  const openRoom = useCallback(() => screenRoom.open(), []);
  const closeRoom = useCallback(() => {
    const last = screenRoom.close();
    if (last) setLocal(last);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: the game still works, it just won't survive a reload
    }
  }, [state]);

  // Every card dealt so far this game (including one left on screen at the buzzer) counts as played.
  const { deck, cursor } = state;
  useEffect(() => markPlayed(deck.slice(0, cursor)), [deck, cursor]);

  return { state, dispatch, room, openRoom, closeRoom };
}
