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
  data/difficulty.json   easy / medium / hard per card (unlisted cards count as medium)
pictures/
  raw/           original photos; the file name is the word to act out
  cards/         generated, web-sized WebP — what the app ships
```

## Adding cards

1. Drop a photo into `pictures/raw/`, named after the word (Hebrew is fine): `pictures/raw/אריה.jpg`.
2. Run `npm run cards` — converts new/changed photos to `pictures/cards/*.webp` (and removes cards
   whose photo was deleted).
3. Optionally list the word under `easy`, `medium` or `hard` in `src/data/difficulty.json`.
   Decks follow an easy-heavy rhythm so the hard ones arrive as occasional spikes.

The word is shown by the app above the photo, so nothing is drawn on the image itself.

## Deploying

Pushing to `main` builds the Docker image (`ghcr.io/<owner>/charades:latest`): a static build
served by nginx on port 3000.

```bash
docker build -t charades .
docker run -p 3000:3000 charades
```
