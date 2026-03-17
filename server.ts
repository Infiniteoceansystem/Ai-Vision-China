import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fal } from "@fal-ai/client";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Configure Fal.ai client
  fal.config({
    credentials: process.env.FAL_API_KEY!,
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/env.js", (req, res) => {
    res.type("application/javascript");
    res.send(`window.process = { env: { GEMINI_API_KEY: ${JSON.stringify(process.env.GEMINI_API_KEY || '')}, API_KEY: ${JSON.stringify(process.env.API_KEY || '')} } };`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
