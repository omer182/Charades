import difficulty from '../data/difficulty.json';
import type { Difficulty } from './types';
import { buildDeck } from './deck';

// Generated from pictures/raw by `npm run cards`; the file name is the word to act out.
const files = import.meta.glob<string>('../../pictures/cards/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Card name (the Hebrew word) → image URL. */
export const CARD_URLS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [
    path.split('/').pop()!.replace(/\.[^.]+$/, ''),
    url,
  ]),
);

export const CARD_NAMES = Object.keys(CARD_URLS);

/** What players read: file-name artifacts like dashes and double spaces cleaned up. */
export const cardLabel = (name: string) => name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

const LEVELS: Difficulty[] = ['easy', 'medium', 'hard'];
const DIFFICULTY = new Map<string, Difficulty>(
  LEVELS.flatMap((level) => ((difficulty as Record<string, unknown>)[level] as string[] ?? []).map((n) => [n, level] as const)),
);

export const difficultyOf = (name: string) => DIFFICULTY.get(name);

export const newDeck = () => buildDeck(CARD_NAMES, difficultyOf);
