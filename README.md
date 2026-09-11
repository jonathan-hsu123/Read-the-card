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
    useLoadFont.ts            Loads the display font
  components/
    CardFrame.tsx             Card art, revealed name on win/loss
    GuessInput.tsx             Guess input with autocomplete suggestions
    ClueList.tsx               Progressive clue reveal
    GuessHistory.tsx            List of past guesses this round
    StatusBanner.tsx             Win/loss banner with "next card" action

server/                      backend (independent app, its own package.json)
  src/
    db.ts                     SQLite connection + printings table schema
    app.ts                     Express app, mounts routes
    index.ts                   Starts the HTTP server
    routes/cards.ts             GET /random, GET /search
  scripts/fetch-cards.ts       Imports Scryfall's bulk card data into the DB
  data/cards.sqlite            Generated DB file (gitignored)
```

## Getting started

**1. Install dependencies** (frontend and backend are separate apps, each needs its own install):

```bash
npm install
cd server && npm install && cd ..
```

**2. Build the card database** (one-time; downloads Scryfall's bulk data and populates `server/data/cards.sqlite` — takes a minute or two):

```bash
cd server && npm run fetch-cards && cd ..
```

**3. Run both apps**, each in its own terminal:

```bash
# terminal 1 — backend, http://localhost:3001
cd server && npm run dev

# terminal 2 — frontend, http://localhost:5173
npm run dev
```

Open the frontend URL — Vite proxies its `/api/*` requests to the backend automatically (see `vite.config.ts`).

Other scripts:

```bash
npm run build      # type-check and build the frontend for production
npm run lint        # run Oxlint on the frontend
npm run preview      # preview the frontend production build locally

cd server && npm run build   # type-check and compile the backend
cd server && npm run start    # run the compiled backend (after build)
```

## Re-syncing card data

Re-run `npm run fetch-cards` inside `server/` any time you want to refresh the card pool from Scryfall's latest bulk data — it fully replaces the existing `printings` table.
