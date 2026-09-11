import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import { cardsRouter } from "./routes/cards.js";

export const app = express();

app.use("/api/cards", cardsRouter);

// The frontend is a sibling Vite app built into ../../../dist relative to this
// compiled file (server/dist/src/app.js -> repo-root/dist) — serve it so one
// process can host both the API and the built React app.
const dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistDir = path.join(dirname, "../../../dist");
app.use(express.static(clientDistDir));
