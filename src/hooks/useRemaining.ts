import { useEffect, useState } from 'react';
import type { TimerState } from '../game/types';

/** Milliseconds left on the turn, updated every animation frame while the clock runs. */
export function useRemaining({ endsAt, remainingMs }: TimerState) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [endsAt]);

  return endsAt === null ? remainingMs : Math.max(0, endsAt - now);
}
