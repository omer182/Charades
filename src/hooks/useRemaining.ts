import { useEffect, useState } from 'react';
import type { TimerState } from '../game/types';
import { serverNow } from '../net/clock';

/** Milliseconds left on the turn, updated every animation frame while the clock runs (on the room's clock in phone mode). */
export function useRemaining({ endsAt, remainingMs }: TimerState) {
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    if (endsAt === null) return;
    let raf = 0;
    const tick = () => {
      setNow(serverNow());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [endsAt]);

  return endsAt === null ? remainingMs : Math.max(0, endsAt - now);
}
