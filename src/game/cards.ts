import catalog from '../data/cards.json';
import type { CategoryId, Difficulty } from './types';
import { buildFreshDeck, pickGolden } from './deck';
import { forgetPlayed, loadPlayed } from './played';

export interface Category {
  id: CategoryId;
  label: string;
  /** Photo categories show a picture; word categories are just the word on a coloured card. */
  kind: 'photo' | 'word';
  color: string;
}

export const CATEGORIES: Category[] = [
  { id: 'animals', label: 'חיות', kind: 'photo', color: '#3ddc97' },
  { id: 'food', label: 'אוכל', kind: 'photo', color: '#ff8c42' },
  { id: 'objects', label: 'חפצים ומקומות', kind: 'photo', color: '#4cc9f0' },
  { id: 'people', label: 'דמויות ומקצועות', kind: 'photo', color: '#f472b6' },
  { id: 'actions', label: 'ספורט ופעולות', kind: 'photo', color: '#a3e635' },
  { id: 'movies', label: 'סרטים', kind: 'word', color: '#ff5d73' },
  { id: 'tv', label: 'סדרות', kind: 'word', color: '#a78bfa' },
  { id: 'books', label: 'ספרים', kind: 'word', color: '#ffd23f' },
  { id: 'phrases', label: 'ביטויים', kind: 'word', color: '#2dd4bf' },
];

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export interface Card {
  /** Unique id kept in the deck: the word itself. */
  id: string;
  category: CategoryId;
  difficulty: Difficulty;
  /** Photo URL; word-only cards have none. */
  image?: string;
}

// Generated from pictures/raw by `npm run cards`; the file name is the word to act out.
const files = import.meta.glob<string>('../../pictures/cards/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace(/\.[^.]+$/, ''), url]),
);

type PhotoEntry = { category: CategoryId; difficulty: Difficulty };
const photos = catalog.photos as Record<string, PhotoEntry>;
const words = catalog.words as Record<CategoryId, Record<Difficulty, string[]>>;

const cards: Card[] = [
  // Every built photo is playable; one missing from the catalog counts as a medium object.
  ...Object.entries(IMAGES).map(([id, image]): Card => ({
    id,
    image,
    category: photos[id]?.category ?? 'objects',
    difficulty: photos[id]?.difficulty ?? 'medium',
  })),
  ...Object.entries(words).flatMap(([category, levels]) =>
    Object.entries(levels).flatMap(([difficulty, list]) =>
      list.map((id): Card => ({ id, category: category as CategoryId, difficulty: difficulty as Difficulty })),
    ),
  ),
];

export const CARDS: Record<string, Card> = Object.fromEntries(cards.map((c) => [c.id, c]));

export const PHOTO_IDS = cards.filter((c) => c.image).map((c) => c.id);

export const countIn = (category: CategoryId) => cards.filter((c) => c.category === category).length;

/** What players read: stray whitespace from file names collapsed. */
export const cardLabel = (id: string) => id.replace(/\s+/g, ' ').trim();

export const idsIn = (categories: readonly CategoryId[]) => {
  const wanted = new Set(categories);
  return cards.filter((c) => wanted.has(c.category)).map((c) => c.id);
};

/** Deals a game: unplayed cards first. Once every card in these categories was played, they all start over. */
export function newDeck(categories: readonly CategoryId[]) {
  const ids = idsIn(categories);
  let played = loadPlayed();
  if (ids.every((id) => played.has(id))) {
    forgetPlayed(ids);
    played = new Set();
  }
  const difficultyOf = (id: string) => CARDS[id]?.difficulty;
  const deck = buildFreshDeck(ids, difficultyOf, played);
  return { deck, golden: pickGolden(deck, difficultyOf) };
}
