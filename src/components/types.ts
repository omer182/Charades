import type { Dispatch } from 'react';
import type { Action } from '../game/reducer';
import type { GameState } from '../game/types';

export interface ScreenProps {
  state: GameState;
  dispatch: Dispatch<Action>;
}
