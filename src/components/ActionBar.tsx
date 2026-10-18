import { Check, Pause, Play, Star, Undo2, X } from 'lucide-react';
import type { CardResult } from '../game/types';

/**
 * Undo · Skip · Got it · Pause. The same bar runs a turn on the big screen and on a phone remote,
 * so whoever hosts gets the same controls.
 */
export default function ActionBar({ golden, paused, canUndo, onMark, onUndo, onTogglePause }: {
  golden: boolean;
  paused: boolean;
  canUndo: boolean;
  onMark: (result: CardResult) => void;
  onUndo: () => void;
  onTogglePause: () => void;
}) {
  return (
    <div className="actions">
      <button className="act act--small" onClick={onUndo} disabled={!canUndo || paused} aria-label="ביטול הקלף האחרון" title="ביטול (Z)">
        <Undo2 size={22} />
      </button>
      <button className="act act--skip" onClick={() => onMark('skip')} disabled={paused} aria-label="דילוג">
        <X size={30} strokeWidth={2.6} />
        <span>דילוג</span>
      </button>
      <button className="act act--got" data-golden={golden} onClick={() => onMark('got')} disabled={paused} aria-label={golden ? 'ניחשו, פלוס 2' : 'ניחשו'}>
        {golden ? <Star size={28} fill="currentColor" /> : <Check size={30} strokeWidth={2.8} />}
        <span>ניחשו!</span>
        {golden && <bdi dir="ltr" className="act__bonus">+2</bdi>}
      </button>
      <button className="act act--small" onClick={onTogglePause} aria-label={paused ? 'המשך' : 'השהיה'} title="השהיה (P)">
        {paused ? <Play size={22} /> : <Pause size={22} />}
      </button>
    </div>
  );
}
