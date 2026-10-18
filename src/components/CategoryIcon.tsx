import { Apple, BookOpen, Clapperboard, Dumbbell, MessageCircleMore, PawPrint, Shapes, Tv, UserRound, type LucideProps } from 'lucide-react';
import type { CategoryId } from '../game/types';

const ICONS = {
  animals: PawPrint,
  food: Apple,
  objects: Shapes,
  people: UserRound,
  actions: Dumbbell,
  movies: Clapperboard,
  tv: Tv,
  books: BookOpen,
  phrases: MessageCircleMore,
} satisfies Record<CategoryId, unknown>;

export default function CategoryIcon({ id, ...props }: { id: CategoryId } & LucideProps) {
  const Icon = ICONS[id];
  return <Icon aria-hidden {...props} />;
}
