# 奏汰と日向の朝ニュース

毎朝、GitHub Actionsが OpenAI Responses API + Web Search で「世界 / 国内 / エンタメ」の3本を生成し、Supabaseへ保存します。ニュースサイトはSupabaseから直接読み込むため、記事追加ごとのGitHubコミットやRender再デプロイは不要です。

## Schedule

- GitHub Actions: 毎日 07:30 JST
- Workflow: `.github/workflows/kanata-hinata-morning-news.yml`（mainブランチ）
- Generator: `news-cron/generate-news.mjs`（kanata-hinata-newsブランチ）

## Required GitHub Actions secret

- `OPENAI_API_KEY`

Supabaseへの書き込み認証はGitHub Actions OIDCを使用するため、Supabaseのsecret/service-role keyをGitHubへ保存する必要はありません。

## Public configuration

- `OPENAI_MODEL` (default: gpt-6-luna)
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
