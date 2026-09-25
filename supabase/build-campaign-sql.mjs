// Builds supabase/2026-09-ai-cybersecurity.sql from the Content Hub seed files.
import fs from 'node:fs';
import path from 'node:path';

const SEED = 'linkedin/content-hub/seed';
const IMG_BASE = 'https://midastechinc.github.io/Leads/social-images/';
const ACCOUNTS = { 'li-ali': ['linkedin', 'Ali'], 'li-midas': ['linkedin', 'Midas Tech'], instagram: ['instagram', null], facebook: ['facebook', null] };
// One-line E'' strings keep each post on a single line, so a partial copy is easy to spot.
const q = v => v == null ? 'null' : `E'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n')}'`;

const rows = fs.readdirSync(SEED).sort().map(f => {
  const p = JSON.parse(fs.readFileSync(path.join(SEED, f), 'utf8'));
  const lines = p.body.trimEnd().split('\n');
  const last = lines[lines.length - 1].trim();
  const hashtags = last.startsWith('#') ? last : '';
  const caption = (hashtags ? lines.slice(0, -1) : lines).join('\n').trim();
  const [platform, account] = ACCOUNTS[p.platform];
  return { platform, account, headline: p.title, caption, hashtags, notes: p.notes || '', first_comment: p.firstComment || null,
    image_url: p.image ? IMG_BASE + path.basename(p.image) : '', scheduled_for: `${p.when}:00-04:00`,
    post_kind: p.kind === 'Article' ? 'article' : 'post', campaign: p.campaign };
});

const cols = `(platform, account, headline, category, caption, hashtags, cta, notes, first_comment, status, image_engine, image_style, image_url, attachment_image_url, attachment_image_name, source_topic, target_audience, brand_voice, post_payload, auto_generated, scheduled_for, post_kind, campaign)`;
const inserts = rows.map((r, i) => `-- Post ${i + 1} of ${rows.length}: ${r.headline}
insert into public.social_posts ${cols} select ${q(r.platform)}, ${q(r.account)}, ${q(r.headline)}, 'cybersecurity', ${q(r.caption)}, ${q(r.hashtags)}, '', ${q(r.notes)}, ${q(r.first_comment)}, 'scheduled', 'campaign', '', ${q(r.image_url)}, '', '', ${q(r.campaign)}, 'Healthcare, accounting and warehouse owners', 'casual', '{}', false, ${q(r.scheduled_for)}::timestamptz, ${q(r.post_kind)}, ${q(r.campaign)} where not exists (select 1 from public.social_posts where platform = ${q(r.platform)} and headline = ${q(r.headline)});`).join('\n');

const sql = `-- Midas Tech: posting calendar columns + "AI & Cybersecurity" campaign
-- Paste into the Supabase SQL editor and run once. Safe to re-run: nothing is added twice.

-- 1. Posting calendar columns (all optional; existing rows are unchanged)
alter table public.social_posts
  add column if not exists scheduled_for timestamptz,
  add column if not exists posted_at     timestamptz,
  add column if not exists campaign      text,
  add column if not exists account       text,
  add column if not exists first_comment text,
  add column if not exists post_kind     text default 'post';

create index if not exists social_posts_scheduled_for_idx on public.social_posts (scheduled_for);

-- 2. Campaign posts (${rows.length}). Times are Eastern (EDT, -04:00).
${inserts}

-- End of file. If this line is missing from the SQL editor, the copy was cut off.
select count(*) as campaign_posts from public.social_posts where campaign = 'AI & Cybersecurity';
`;
fs.writeFileSync('supabase/2026-09-ai-cybersecurity.sql', sql);
console.log(`Wrote ${rows.length} posts`);
