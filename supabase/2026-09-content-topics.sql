-- Topics tab: one row per monthly campaign topic.
-- Status: idea -> approved -> written (Claude has loaded the posts). Scheduled/posted
-- is worked out from the social_posts rows that share the topic's campaign name.
-- Safe to re-run.

create table if not exists public.content_topics (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  title        text not null,
  angle        text,
  audience     text,
  target_month date,
  notes        text,
  source       text not null default 'planned',  -- 'planned' (Claude) or 'ali'
  status       text not null default 'idea',     -- idea | approved | written | skipped
  campaign     text                              -- matches social_posts.campaign once written
);

insert into public.content_topics (title, angle, audience, target_month, notes, source, status, campaign)
select * from (values
  ('AI & Cybersecurity', 'Attackers have an AI copilot too. Limit what they can reach.', 'All', date '2026-09-01', 'From Ali''s article.', 'ali', 'written', 'AI & Cybersecurity'),
  ('Cybersecurity Awareness Month', 'A 10-minute checklist every small office can do this month', 'All', date '2026-10-01', 'October is Cybersecurity Awareness Month. Start mid-October, after the AI campaign ends Oct 9.', 'planned', 'idea', null),
  ('Fake invoices and payment scams', 'Real-looking scams aimed at accounting firms and their clients', 'Accounting firms', date '2026-11-01', null, 'planned', 'idea', null),
  ('Backups and ransomware', 'Could you reopen Monday if you got hit on Friday?', 'Healthcare clinics', date '2026-12-01', null, 'planned', 'idea', null),
  ('Tax season prep', 'Protecting client files and portals before the rush', 'Accounting firms', date '2027-01-01', null, 'planned', 'idea', null),
  ('MFA and passwords', 'The cheapest fix most businesses still skip', 'All', date '2027-02-01', null, 'planned', 'idea', null),
  ('Warehouse downtime', 'What one hour of IT outage really costs a warehouse', 'Warehouses', date '2027-03-01', null, 'planned', 'idea', null)
) as t(title, angle, audience, target_month, notes, source, status, campaign)
where not exists (select 1 from public.content_topics c where c.title = t.title);

select title, to_char(target_month, 'Mon YYYY') as month, status from public.content_topics order by target_month;
