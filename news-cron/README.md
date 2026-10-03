# 奏汰と日向の朝ニュース Cron

毎朝、OpenAI Responses API + Web Searchで「世界 / 国内 / エンタメ」の3本を生成し、Supabaseへupsertします。

## Required environment variables

- OPENAI_API_KEY
- OPENAI_MODEL (optional, default: gpt-6-luna)
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- NEWS_INGEST_TOKEN

Render Cronは日本時間07:30（UTC 22:30）を想定します。
