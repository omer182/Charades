import { useEffect, useRef } from 'react';

type Bindings = Record<string, () => void>;

/** Binds `KeyboardEvent.code`s (e.g. 'Space', 'ArrowRight') while `enabled`; ignores typing in fields. */
export function useHotkeys(bindings: Bindings, enabled = true) {
  const ref = useRef(bindings);
  useEffect(() => {
    ref.current = bindings;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const handler = ref.current[e.code];
      if (handler) {
        e.preventDefault();
        handler();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
