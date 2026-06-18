import express from "express";
import cors from "cors";
import "./db/database.js";
import apiRouter from "./routes/index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Generic error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Hotel API running on http://localhost:${PORT}`));
