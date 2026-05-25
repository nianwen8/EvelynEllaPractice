# EvelynEllaPractice

A static vocabulary practice website for Evelyn Gu and Ella Gu.

## Live Site

https://vocabulary-fun-practice.vercel.app

## Local Preview

```sh
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

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
