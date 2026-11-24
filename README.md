# ReadTheCard

A Magic: The Gathering guessing game.

## How it works

- Type into the guess box to see autocomplete suggestions, then pick a card name to submit it.
- Each miss reveals the next clue and costs you one of five guesses.
- Guess correctly (or run out of guesses) to see the answer and move on to the next card.

## Tech stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/) for dev server and build, [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting.
- **Backend**: Node.js + [Express](https://expressjs.com/), SQLite via Node's built-in `node:sqlite`, seeded from [Scryfall](https://scryfall.com/docs/api)'s bulk card data.

## Project structure

```
client/src/                  frontend (Vite root config lives at repo root)
  App.tsx                     Top-level layout, wires the game hook to the UI
  data.ts                     Clue labels and game constants (MAX_GUESSES, etc.)
  theme.ts                    Shared color palette and font
  types.ts                    Card / GameStatus / GuessRecord types
  hooks/
    useTriviaGame.ts          Game state: fetches cards/search from the backend, tracks guesses/status/history
    useSettings.ts             Answer-pool filter settings, persisted to localStorage
    useLoadFont.ts            Loads the display font
  components/
    CardFrame.tsx             Card art, revealed name on win/loss
    GuessInput.tsx             Guess input with autocomplete suggestions
    ClueList.tsx               Progressive clue reveal
    GuessHistory.tsx            List of past guesses this round
    StatusBanner.tsx             Win/loss banner with "next card" action
    Settings.tsx                 Cog-icon button + filter panel (Universes Beyond, booster-only, year range, first-printing-only)

server/                      backend
  src/
    db.ts                     SQLite connection + printings table schema
    app.ts                     Express app, mounts routes
    index.ts                   Production entry: serves the API and the built frontend from dist/
    dev.ts                     Dev entry: serves the API with Vite as middleware
    routes/cards.ts             GET /random (accepts filter query params), GET /search, GET /year-range
  scripts/fetch-cards.ts       Imports Scryfall's bulk card data into the DB
  data/cards.sqlite            Generated DB file (gitignored)
```

## Getting started

```bash
npm install
npm run fetch-cards   # one-time: downloads Scryfall's bulk data into server/data/cards.sqlite
npm run dev           # http://localhost:3001
```

Other scripts:

```bash
npm run build   # type-check everything, build the frontend to dist/ and the server to dist-server/
npm start       # run the production build
npm run lint    # run Oxlint
```

## Re-syncing card data

Re-run `npm run fetch-cards` any time you want to refresh the card pool from Scryfall's latest bulk data — it fully replaces the existing `printings` table.

## Deployment

The app has no user accounts and the SQLite file is just a rebuildable Scryfall snapshot, so there's nothing that needs persistent storage — it deploys as a **single Node service**: the built backend (`dist-server/src/index.js`) serves both the `/api/*` routes and the built frontend as static files (see `server/src/index.ts`), so there's one process and one URL, no CORS to configure.

**[render.yaml](render.yaml)** at the repo root configures this for [Render](https://render.com)'s free tier:
- Build: `npm install && npm run build && npm run fetch-cards`.
- Start: `npm start`.

To deploy: connect the repo on Render and it'll pick up `render.yaml` automatically (or paste the same build/start commands into any other Node host — Fly.io, Railway, etc. work the same way). Re-deploying re-runs `fetch-cards`, so the card pool refreshes on every deploy.
