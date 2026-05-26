const fs = require("node:fs/promises");
const path = require("node:path");
const { Client } = require("pg");

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("Set SUPABASE_DB_URL before running this script.");
  }

  const schemaPath = path.join(__dirname, "..", "supabase-schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  await client.connect();
  try {
    await client.query(schema);
    const backfill = await client.query(`
      with completed_rows as (
        select
          p.family_id,
          p.learner,
          p.week_key,
          p.week_label,
          p.week_theme,
          p.mode,
          p.updated_at,
          count(distinct answer.value->>'word') as correct_words
        from public.practice_progress p
        cross join lateral jsonb_array_elements(coalesce(p.recent_answers, '[]'::jsonb)) as answer(value)
        where p.family_id = 'gu-family'
          and answer.value->>'correct' = 'true'
        group by p.family_id, p.learner, p.week_key, p.week_label, p.week_theme, p.mode, p.updated_at
        having count(distinct answer.value->>'word') >= 10
      )
      update public.practice_progress p
      set
        completed_set = true,
        completed_at = coalesce(p.completed_at, completed_rows.updated_at, now()),
        badge_count = greatest(p.badge_count, 1),
        badges = case
          when jsonb_array_length(coalesce(p.badges, '[]'::jsonb)) = 0 then jsonb_build_array(jsonb_build_object(
            'badge_id', p.learner || ':' || p.week_key || ':' || p.mode,
            'learner', p.learner,
            'week_key', p.week_key,
            'week_label', p.week_label,
            'week_theme', p.week_theme,
            'mode', p.mode,
            'title', p.week_label || ' ' || initcap(replace(p.mode, '-', ' ')) || ' Badge',
            'awarded_at', coalesce(p.completed_at, completed_rows.updated_at, now())
          ))
          else p.badges
        end
      from completed_rows
      where p.family_id = completed_rows.family_id
        and p.learner = completed_rows.learner
        and p.week_key = completed_rows.week_key
        and p.mode = completed_rows.mode
      returning p.learner, p.week_label, p.mode, p.badge_count;
    `);
    console.log(`Schema applied. Backfilled ${backfill.rowCount} completed set badge rows.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
