const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

async function initDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS snake_scores (
      id BIGSERIAL PRIMARY KEY,
      player_name VARCHAR(16) NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 5 AND score <= 600),
      foods INTEGER NOT NULL CHECK (foods >= 0 AND foods <= 595),
      collisions INTEGER NOT NULL CHECK (collisions >= 0 AND collisions <= 5000),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_snake_scores_rank
    ON snake_scores (score DESC, collisions ASC, created_at ASC);
  `);
}

app.get("/api/leaderboard", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT player_name, score, foods, collisions, created_at
      FROM snake_scores
      ORDER BY score DESC, collisions ASC, created_at ASC
      LIMIT 20
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "leaderboard_unavailable" });
  }
});

app.post("/api/scores", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim().slice(0, 16);
    const score = Number(req.body?.score);
    const foods = Number(req.body?.foods);
    const collisions = Number(req.body?.collisions);

    if (!name || !Number.isInteger(score) || !Number.isInteger(foods) || !Number.isInteger(collisions)) {
      return res.status(400).json({ error: "invalid_payload" });
    }
    if (score !== 5 + foods || foods < 0 || foods > 595 || collisions < 0 || collisions > 5000) {
      return res.status(400).json({ error: "invalid_score" });
    }

    await pool.query(
      `INSERT INTO snake_scores (player_name, score, foods, collisions) VALUES ($1, $2, $3, $4)`,
      [name, score, foods, collisions]
    );

    const { rows } = await pool.query(`
      SELECT 1 + COUNT(*)::int AS rank
      FROM snake_scores
      WHERE score > $1
         OR (score = $1 AND collisions < $2)
    `, [score, collisions]);

    res.status(201).json({ ok: true, rank: rows[0].rank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "score_save_failed" });
  }
});

app.get("/health", (_req, res) => res.type("text").send("ok"));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initDb()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Dot Snake listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed", err);
    process.exit(1);
  });
