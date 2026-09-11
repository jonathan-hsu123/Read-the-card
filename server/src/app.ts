import express from "express";
import { cardsRouter } from "./routes/cards.js";

export const app = express();

app.use("/api/cards", cardsRouter);
