# Charades 🎭

A party charades game for teams. One player acts out the picture card, their team shouts guesses,
and the clock decides. Built for a laptop on the TV or a phone passed around the room.

**Live:** https://charades.omersher.com

## Playing

- Add 1–8 teams, pick rounds, turn length, and whether skipping costs a point.
- Each turn opens with a hand-off screen and a 3-2-1 countdown.
- During a turn: **swipe right / → / Space** = got it, **swipe left / ←** = skip, **Z** = undo, **P** = pause.
- When time's up you review the turn's cards — tap one to fix a wrong call — then see the standings.
- Scores can be nudged with ± on the scoreboard at any time.
- The game survives a page reload (a running turn comes back paused), keeps the screen awake,
  and supports fullscreen.

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
tokens (`src/styles/global.css`).

```
src/
  game/          pure logic — reducer (state machine), deck builder, cards, sound
  hooks/         persistence, rAF timer, wake lock, hotkeys
  components/    one component per screen: Lobby → GetReady → Stage → TurnEnd → GameOver
  data/cards.json   card catalog: category + difficulty per photo, plus word-only cards
pictures/
  raw/           original photos; the file name is the word to act out
  cards/         generated, web-sized WebP — what the app ships
```

## Cards

The interface is Hebrew, right-to-left. Players pick categories in the lobby: five photo categories
(animals, food, objects & places, people & characters, sports & actions) and four word-only ones
(movies, TV shows, books, phrases). Decks follow an easy-heavy rhythm so the hard cards arrive as
occasional spikes, and a few cards each game (mostly hard ones) are golden and worth double.

**Photo cards**

1. Add the word to `photos` in `src/data/cards.json` with a `category` and `difficulty`.
2. Drop a photo into `pictures/raw/`, named after the word: `pictures/raw/אריה.jpg`. Or give the
   entry a `wiki` (English Wikipedia title) and run `node scripts/downloadImages.js` to fetch the
   article's lead image.
3. Run `npm run cards` — converts new/changed photos to `pictures/cards/*.webp` (and removes cards
   whose photo was deleted).

The word is shown by the app above the photo, so nothing is drawn on the image itself.

**Word cards**: add the word to `words.<category>.<difficulty>` in `src/data/cards.json`.

## Deploying

Pushing to `main` builds the Docker image (`ghcr.io/<owner>/charades:latest`): a static build
served by nginx on port 3000.

```bash
docker build -t charades .
docker run -p 3000:3000 charades
```
