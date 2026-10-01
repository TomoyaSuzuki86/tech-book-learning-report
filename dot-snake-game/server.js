const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("redis");

const app = express();
const port = process.env.PORT || 3000;
const redisUrl = process.env.REDIS_URL;
const LEADERBOARD_KEY = "dot-snake:leaderboard:v1";

if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

const redis = createClient({ url: redisUrl });
redis.on("error", (err) => console.error("Redis error", err));

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "public")));

function encodeEntry({ name, score, foods, collisions }) {
  const safeName = Buffer.from(name, "utf8").toString("base64url");
  return [
    Date.now().toString().padStart(13, "0"),
    crypto.randomBytes(4).toString("hex"),
    safeName,
    score,
    foods,
    collisions
  ].join("|");
}

function decodeEntry(member) {
  const [timestamp, id, safeName, score, foods, collisions] = member.split("|");
  return {
    player_name: Buffer.from(safeName, "base64url").toString("utf8"),
    score: Number(score),
    foods: Number(foods),
    collisions: Number(collisions),
    created_at: new Date(Number(timestamp)).toISOString()
  };
}

function rankScore(score, collisions) {
  return score * 10001 + (5000 - collisions);
}

app.get("/api/leaderboard", async (_req, res) => {
  try {
    const members = await redis.zRange(LEADERBOARD_KEY, 0, 19, { REV: true });
    res.json(members.map(decodeEntry));
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

    const member = encodeEntry({ name, score, foods, collisions });
    await redis.zAdd(LEADERBOARD_KEY, [{ score: rankScore(score, collisions), value: member }]);

    const rankZeroBased = await redis.zRevRank(LEADERBOARD_KEY, member);
    res.status(201).json({ ok: true, rank: rankZeroBased == null ? null : rankZeroBased + 1 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "score_save_failed" });
  }
});

app.get("/health", async (_req, res) => {
  try {
    await redis.ping();
    res.type("text").send("ok");
  } catch {
    res.status(503).type("text").send("redis unavailable");
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

(async () => {
  await redis.connect();
  app.listen(port, "0.0.0.0", () => {
    console.log(`Dot Snake listening on ${port}`);
  });
})().catch((err) => {
  console.error("Startup failed", err);
  process.exit(1);
});
