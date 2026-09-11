# ReadTheCard

A Magic: The Gathering guessing game. 

## How it works

- Type into the guess box to see autocomplete suggestions, then pick a card name to submit it.
- Each miss reveals the next clue and costs you one of five guesses.
- Guess correctly (or run out of guesses) to see the answer and move on to the next card.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and build
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting

## Project structure

```
src/
  App.tsx                  Top-level layout, wires the game hook to the UI
  data.ts                  Card data, clue labels, and game constants (MAX_GUESSES, etc.)
  theme.ts                 Shared color palette and font
  types.ts                 Card / GameStatus / GuessRecord types
  hooks/
    useTriviaGame.ts       Game state: current card, guesses, status, history
    useLoadFont.ts         Loads the display font
  components/
    CardFrame.tsx          Card art placeholder / revealed card name
    GuessInput.tsx         Guess input with autocomplete suggestions
    ClueList.tsx           Progressive clue reveal
    GuessHistory.tsx       List of past guesses this round
    StatusBanner.tsx       Win/loss banner with "next card" action
```

Card data in [`src/data.ts`](src/data.ts) is currently a small hardcoded sample set — swap in a real data source (e.g. the [Scryfall API](https://scryfall.com/docs/api)) to expand beyond the mock cards.

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # type-check and build for production
npm run lint       # run Oxlint
npm run preview    # preview the production build locally
```
