import { useEffect } from 'react';

/** Keeps the screen awake while `active` — nobody wants the phone to dim mid-mime. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) lock.release();
      } catch {
        // denied (e.g. battery saver) — not worth surfacing
      }
    };
    // The lock is dropped whenever the tab is hidden; take it again on return.
    const onVisible = () => document.visibilityState === 'visible' && acquire();

    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release();
    };
  }, [active]);
}
