import { useEffect, useReducer } from 'react';
import { CARD_URLS } from '../game/cards';
import { hydrate, initialState, reducer } from '../game/reducer';
import type { GameState } from '../game/types';

const KEY = 'charades:v2';

function load(): GameState {
  try {
    localStorage.removeItem('charadesGameState'); // v1 state, incompatible
    const state = hydrate(JSON.parse(localStorage.getItem(KEY) ?? 'null'), Date.now());
    if (!state) return initialState();
    // Images can be removed between deploys; drop cards that no longer exist.
    const deck = state.deck.filter((name) => name in CARD_URLS);
    return deck.length === state.deck.length ? state : { ...state, deck, cursor: 0 };
  } catch {
    return initialState();
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // storage full or blocked: the game still works, it just won't survive a reload
    }
  }, [state]);

  return [state, dispatch] as const;
}
