# Speechless · בלי מילים 🎭

A Hebrew party charades game for teams, built for a TV. One player stands facing the screen and acts
out the card without a word, their team (backs to the screen) shouts guesses, and the clock decides.

**Live:** https://speechless.omersher.com

## Playing

- Add 1–8 teams, choose card categories, the number of rounds and the turn length, and whether skipping costs a point.
- Each turn opens with a get-ready screen and a 3-2-1 countdown.
- During a turn: **swipe right / → / Space** = got it, **swipe left / ←** = skip, **Z** = undo, **P** = pause.
- **Golden cards** score +2 instead of +1. They have a gold frame and ribbon, a shimmer and a chime,
  and the got-it button turns gold.
- When time's up you review the turn's cards (tap one to fix a wrong call; golden ones are tagged),
  then see the standings. The card left on screen at the buzzer isn't dealt again.
- Cards already played on this device are remembered, so the next game (a rematch, or another
  night) deals unplayed cards first. Once every card in the chosen categories has been played they
  start over; the lobby shows how many are still fresh and has a reset link.
- Scores can be nudged with ± on the scoreboard at any time.
- The game survives a page reload (a running turn comes back paused), keeps the screen awake,
  and supports fullscreen.

## Cards

400 cards in 9 categories, picked in the lobby:

| Kind | Categories |
|---|---|
| Photo (273) | חיות animals, אוכל food, חפצים ומקומות objects & places, דמויות ומקצועות people & characters, ספורט ופעולות sports & actions |
| Word only (127) | סרטים movies, סדרות TV, ספרים books, ביטויים phrases |

Every card is easy, medium or hard. Decks follow an easy-heavy rhythm, so hard cards arrive as
occasional spikes. Golden cards come only from hard cards: the deck is walked in play order, any hard
card may turn golden, and one always does after ten cards without one, so they're spread out (about
one every ten cards) even when a single small category is picked.

Everything lives in [`src/data/cards.json`](src/data/cards.json):

```jsonc
{
  "photos": { "אריה": { "category": "animals", "difficulty": "easy", "wiki": "Lion" } },
  "words": { "phrases": { "easy": ["חתול בשק"], "medium": [], "hard": [] } }
}
```

**Adding a word card:** add it to `words.<category>.<difficulty>`.

**Adding a photo card:**

1. Add the word to `photos` with a `category` and `difficulty`.
2. Put a photo in `pictures/raw/`, named after the word (`pictures/raw/אריה.jpg`). Or give the entry a
   `wiki` (English Wikipedia title) and run `node scripts/downloadImages.js` to fetch the article's
   lead image. Check it by eye; Wikipedia's lead image isn't always the obvious picture.
3. Run `npm run cards` to convert new or changed photos to web-sized WebP in `pictures/cards/` (it
   also removes cards whose photo was deleted).

The app shows the word above the photo, so nothing is drawn on the image itself.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # game logic tests (vitest)
npm run typecheck
npm run lint
npm run build      # → dist/
```

Stack: Vite, React 19, TypeScript, [motion](https://motion.dev) for animation, plain CSS with design
tokens (`src/styles/global.css`), Rubik for the Hebrew type. The page is right-to-left; the got-it /
skip buttons deliberately stay in physical order so "got it" is on the right, matching swipe-right.

```
src/
  game/             pure logic: reducer (state machine), deck + golden picker, card catalog, sound
  hooks/            persistence, rAF timer, wake lock, hotkeys
  components/       one component per screen: Lobby → GetReady → Stage → TurnEnd → GameOver
  data/cards.json   card catalog
pictures/
  raw/              original photos; the file name is the word to act out
  cards/            generated WebP, which is what the app ships
scripts/
  buildCards.mjs    npm run cards
  downloadImages.js Wikipedia lead images for catalog entries with a wiki title
```

## Deploying

Pushing to `main` builds the Docker image `ghcr.io/omer182/charades:latest` (the image keeps its old
name so existing deployments keep pulling it): a static build served by nginx on port 3000.

```bash
docker build -t speechless .
docker run -p 3000:3000 speechless
```
