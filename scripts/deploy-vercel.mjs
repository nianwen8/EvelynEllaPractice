import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

const token = process.env.VERCEL_TOKEN;
const projectName = process.env.VERCEL_PROJECT_NAME || "vocabulary-fun-practice";
const teamId = process.env.VERCEL_TEAM_ID;

if (!token) {
  console.error("Missing VERCEL_TOKEN. Create one at https://vercel.com/account/settings/tokens and run:");
  console.error("VERCEL_TOKEN='your-token' node scripts/deploy-vercel.mjs");
  process.exit(1);
}

const root = new URL("..", import.meta.url);
const fileNames = ["index.html", "package.json", "vercel.json", "README.md"];

const files = await Promise.all(
  fileNames.map(async (file) => ({
    file,
    data: await readFile(join(root.pathname, file), "utf8"),
    encoding: "utf-8"
  }))
);

const params = new URLSearchParams({
  forceNew: "1",
  skipAutoDetectionConfirmation: "1"
});

if (teamId) {
  params.set("teamId", teamId);
}

const response = await fetch(`https://api.vercel.com/v13/deployments?${params}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: projectName,
    target: "production",
    files,
    projectSettings: {
      framework: null,
      buildCommand: null,
      devCommand: null,
      installCommand: null,
      outputDirectory: "."
    },
    meta: {
      source: basename(root.pathname)
    }
  })
});

const body = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error(`Vercel deployment failed: ${response.status} ${response.statusText}`);
  console.error(JSON.stringify(body, null, 2));
  process.exit(1);
}

const url = body.url ? `https://${body.url}` : null;
console.log(`Deployment created: ${body.id || "unknown id"}`);
console.log(`Status: ${body.readyState || body.status || "unknown"}`);
if (url) console.log(`URL: ${url}`);
