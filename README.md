# ReadTheCard

A Magic: The Gathering guessing game. Guess the card from its art; each miss reveals another clue.

## Tech stack

React 19, TypeScript, Vite, Express, SQLite (`node:sqlite`), Vitest, Oxlint. Card data comes from [Scryfall](https://scryfall.com/docs/api)'s bulk data.

## Project structure

```
client/src/
  App.tsx
  data.ts
  theme.ts
  types.ts
  hooks/
    useTriviaGame.ts
    useSettings.ts
    useLoadFont.ts
  components/
    CardFrame.tsx
    GuessInput.tsx
    ClueList.tsx
    GuessHistory.tsx
    StatusBanner.tsx
    Settings.tsx
server/
  src/
    app.ts
    db.ts
    dev.ts
    index.ts
    routes/cards.ts
  scripts/fetch-cards.ts
  data/cards.sqlite
```

## Getting started

```bash
npm install
npm run fetch-cards
npm run dev
```

## Scripts

```bash
npm run dev           # dev server on http://localhost:3001
npm run build         # type-check, build frontend to dist/ and server to dist-server/
npm start             # run the production build
npm test              # run tests
npm run lint          # run Oxlint
npm run fetch-cards   # rebuild server/data/cards.sqlite from Scryfall
```

## Deployment

[render.yaml](render.yaml) deploys a single Node service on Render. Each deploy re-runs `fetch-cards`.
