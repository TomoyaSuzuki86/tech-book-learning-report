const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

const required = {
  OPENAI_API_KEY,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
};
for (const [name, value] of Object.entries(required)) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
}

const THEME_IMAGES = {
  "世界": {
    image_url: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=82",
    image_alt: "世界地図と国際ニュースを想起させるテーマ画像",
    image_credit: "テーマイメージ / Unsplash"
  },
  "国内": {
    image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=82",
    image_alt: "日本の都市と国内ニュースを想起させるテーマ画像",
    image_credit: "テーマイメージ / Unsplash"
  },
  "エンタメ": {
    image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=82",
    image_alt: "映画館とカルチャーニュースを想起させるテーマ画像",
    image_credit: "テーマイメージ / Unsplash"
  }
};

function todayInTokyo() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const m = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${m.year}-${m.month}-${m.day}`;
}

function extractOutputText(response) {
  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function parseJson(text) {
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  return JSON.parse(cleaned);
}

function validateBundle(bundle, date) {
  if (!bundle || !Array.isArray(bundle.articles) || bundle.articles.length !== 3) {
    throw new Error("OpenAI response must contain exactly 3 articles");
  }
  const expected = new Set(["世界", "国内", "エンタメ"]);
  for (const article of bundle.articles) {
    if (!expected.has(article.category)) throw new Error(`Unexpected category: ${article.category}`);
    expected.delete(article.category);
    if (!article.title || !article.summary || !article.takeaway) {
      throw new Error(`Missing required fields for ${article.category}`);
    }
    if (!Array.isArray(article.dialogue) || article.dialogue.length < 6) {
      throw new Error(`Dialogue too short for ${article.category}`);
    }
    article.article_date = date;
    article.dialogue = article.dialogue.map(turn => {
      if (Array.isArray(turn) && turn.length >= 2) return [String(turn[0]), String(turn[1])];
      return [String(turn.speaker || ""), String(turn.text || "")];
    });
    article.sources = Array.isArray(article.sources) ? article.sources : [];
    Object.assign(article, THEME_IMAGES[article.category]);
  }
  if (expected.size) throw new Error("Missing one or more required categories");
  return bundle.articles;
}

async function generateArticles(date) {
  const prompt = `
今日は日本時間 ${date}。最新情報をWeb検索して、朝に読むニュース討論を必ず3本作成してください。

内訳は厳密に:
1. 世界の重要ニュース 1本
2. 日本国内の重要ニュース 1本
3. エンタメの重要ニュース 1本

選定基準:
- 単なる話題性より、社会的影響、背景の深さ、今後の波及、読み物としての面白さを優先する。
- 3本が似た話題に偏らないようにする。
- できるだけ今日または直近24時間の新しい情報を優先する。
- 一次情報、公的機関、企業公式発表、Reuters/APなど信頼性の高い報道を優先して複数ソースで確認する。
- 日付や数値など、検索で確認できない情報を作らない。
- 政治・選挙では中立かつ事実ベースとし、人物・政党の支持や批判に誘導しない。選挙結果の独自予測もしない。
- 事実と分析を明確に分ける。

登場人物:
- 奏汰: 何にでも興味を持ち、素朴だが鋭い疑問で本質を突く。
- 日向: 博識で人生二週目のように達観し、歴史・経済・地政学・社会構造・業界構造まで広げて説明する。

各記事:
- summary は「何が起きたか」の事実のみを2〜4文で簡潔に整理する。
- dialogue は8〜12ターン程度。序盤で背景、中盤で利害関係と見落としやすい論点、後半で今後の分岐と長期的意味を議論する。
- 分析・推測を述べるターンでは文章の冒頭に「【分析】」を付ける。確認済み事実を説明する重要ターンには「【事実】」を付けてよい。
- takeaway は1〜2文。
- sources は実際に確認した主要ソースを2〜5件。title, publisher, url, published_at を入れる。published_at が不明なら空文字。

出力は説明やMarkdownを一切付けず、次のJSONだけにする:
{
  "articles": [
    {
      "category": "世界",
      "title": "...",
      "summary": "...",
      "dialogue": [["奏汰","..."],["日向","..."]],
      "takeaway": "...",
      "sources": [
        {"title":"...","publisher":"...","url":"https://...","published_at":"..."}
      ]
    },
    {
      "category": "国内",
      "title": "...",
      "summary": "...",
      "dialogue": [["奏汰","..."],["日向","..."]],
      "takeaway": "...",
      "sources": []
    },
    {
      "category": "エンタメ",
      "title": "...",
      "summary": "...",
      "dialogue": [["奏汰","..."],["日向","..."]],
      "takeaway": "...",
      "sources": []
    }
  ]
}
`.trim();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: prompt,
      tools: [{ type: "web_search" }],
      max_tool_calls: 12,
      store: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API failed (${response.status}): ${body.slice(0, 1200)}`);
  }

  const data = await response.json();
  const text = extractOutputText(data);
  if (!text) throw new Error("OpenAI API returned no output text");
  return validateBundle(parseJson(text), date);
}

async function getGitHubOidcToken() {
  const requestUrl = process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const requestToken = process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!requestUrl || !requestToken) {
    throw new Error("GitHub Actions OIDC environment is unavailable");
  }
  const url = new URL(requestUrl);
  url.searchParams.set("audience", "kanata-hinata-news");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${requestToken}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to obtain GitHub OIDC token: ${response.status}`);
  }
  const data = await response.json();
  if (!data.value) throw new Error("GitHub OIDC token response is missing value");
  return data.value;
}

async function publishArticles(articles) {
  const oidcToken = await getGitHubOidcToken();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ingest-kanata-hinata`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_PUBLISHABLE_KEY,
      "Authorization": `Bearer ${oidcToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ articles }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase ingest failed (${response.status}): ${body.slice(0, 1200)}`);
  }
  return response.text();
}

const date = todayInTokyo();
console.log(`Generating Kanata & Hinata morning news for ${date} with ${OPENAI_MODEL}...`);
const articles = await generateArticles(date);
const result = await publishArticles(articles);
console.log(`Published ${articles.length} articles for ${date}. Supabase response: ${result}`);
