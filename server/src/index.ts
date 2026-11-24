import { fileURLToPath } from "node:url";
import path from "node:path";
import express from "express";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 3001);
const clientDistDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../dist");

app.use(express.static(clientDistDir));

app.listen(PORT, () => {
  console.log(`ReadTheCard listening on http://localhost:${PORT}`);
});
