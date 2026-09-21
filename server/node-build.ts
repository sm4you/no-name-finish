import path from "path";
import express from "express";
import { createServer } from "./index";

const app = createServer();
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

// Serve static frontend in production
const distSpaPath = path.resolve(process.cwd(), "dist/spa");
app.use(express.static(distSpaPath));

// SPA fallback for non-API routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.resolve(distSpaPath, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Application static files not built yet.");
    }
  });
});

app.listen(PORT, HOST, () => {
  console.log(`[No Name Production Server] Running at http://${HOST}:${PORT}`);
});
