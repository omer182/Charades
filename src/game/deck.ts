import type { Difficulty } from './types';

/** Repeating difficulty rhythm: mostly easy, a breather of medium, the odd hard one. */
const PATTERN: Difficulty[] = ['easy', 'easy', 'easy', 'medium', 'medium', 'hard', 'easy', 'easy'];

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Builds a deck containing every card exactly once, ordered so difficulty follows PATTERN
 * for as long as each pool lasts. Unclassified cards count as medium.
 */
export function buildDeck(
  names: readonly string[],
  difficultyOf: (name: string) => Difficulty | undefined,
  random = Math.random,
): string[] {
  const pools: Record<Difficulty, string[]> = { easy: [], medium: [], hard: [] };
  for (const name of names) pools[difficultyOf(name) ?? 'medium'].push(name);
  for (const level of Object.keys(pools) as Difficulty[]) pools[level] = shuffle(pools[level], random);

  const fallback: Record<Difficulty, Difficulty[]> = {
    easy: ['medium', 'hard'],
    medium: ['easy', 'hard'],
    hard: ['medium', 'easy'],
  };

  const deck: string[] = [];
  for (let i = 0; deck.length < names.length; i++) {
    const want = PATTERN[i % PATTERN.length];
    const level = [want, ...fallback[want]].find((l) => pools[l].length > 0)!;
    deck.push(pools[level].pop()!);
  }
  return deck;
}

/** Chance any hard card turns golden (double points); easier cards never do. */
const GOLDEN_ODDS = 0.35;
/** A hard card is always golden once this many cards have gone by without one. */
const GOLDEN_GAP = 10;

/**
 * Picks this game's golden cards from the hard ones, walking the deck in play order so they
 * are spread out: roughly one every ten cards, however few hard cards the chosen categories have.
 */
export function pickGolden(
  deck: readonly string[],
  difficultyOf: (name: string) => Difficulty | undefined,
  random = Math.random,
): string[] {
  const golden: string[] = [];
  let sinceLast = Math.floor(random() * GOLDEN_GAP); // so the first one isn't always at the same spot
  for (const name of deck) {
    sinceLast++;
    if (difficultyOf(name) !== 'hard') continue;
    if (sinceLast >= GOLDEN_GAP || random() < GOLDEN_ODDS) {
      golden.push(name);
      sinceLast = 0;
    }
  }
  return golden;
}
