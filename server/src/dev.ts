import { createServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { app } from "./app.js";

const PORT = Number(process.env.PORT ?? 3001);
const httpServer = createServer(app);

const vite = await createViteServer({
  server: { middlewareMode: true, hmr: { server: httpServer } },
  appType: "spa",
});

app.use(vite.middlewares);

httpServer.listen(PORT, () => {
  console.log(`ReadTheCard dev server on http://localhost:${PORT}`);
});
