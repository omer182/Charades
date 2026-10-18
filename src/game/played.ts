/**
 * Cards already played on this device, kept across games so a rematch deals fresh cards first.
 * Storage can be blocked or full; then the game just forgets, it never breaks.
 */
const KEY = 'charades:played';

export function loadPlayed(): Set<string> {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function save(played: Set<string>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...played]));
  } catch {
    // ignore
  }
}

export function markPlayed(cards: readonly string[]) {
  const played = loadPlayed();
  const before = played.size;
  for (const card of cards) played.add(card);
  if (played.size !== before) save(played);
}

/** Forgets the given cards (or everything), so they count as fresh again. */
export function forgetPlayed(cards?: readonly string[]) {
  if (!cards) return save(new Set());
  const played = loadPlayed();
  for (const card of cards) played.delete(card);
  save(played);
}
