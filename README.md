# EvelynEllaPractice

A static vocabulary practice website for Evelyn Gu, Ella Gu, and Nianwen.

## Live Site

https://vocabulary-fun-practice.vercel.app

## Local Preview

```sh
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Supabase Progress Save

Run [supabase-schema.sql](./supabase-schema.sql) in Supabase SQL Editor.

Then open the app and enter:

- Family ID: for example `gu-family`
- Project URL: Supabase Project Settings -> API -> Project URL
- Anon Key: Supabase Project Settings -> API -> Project API keys -> `anon public`

The app loads existing progress from Supabase when settings are present. Each checked answer saves the current stats, the latest answer, and a recent answer history into the `practice_progress` table. If Supabase is unavailable, the same data is saved locally in the browser and retried on the next save.

## Deploy To Vercel With Token

From this folder:

```sh
VERCEL_TOKEN='your-token' node scripts/deploy-vercel.mjs
```

Create a token at `https://vercel.com/account/settings/tokens`.

Optional settings:

```sh
VERCEL_PROJECT_NAME='vocabulary-fun-practice' VERCEL_TOKEN='your-token' node scripts/deploy-vercel.mjs
```

For a team account, also add `VERCEL_TEAM_ID`.

Vercel can deploy this as a static site with no build command and `index.html` as the output.
