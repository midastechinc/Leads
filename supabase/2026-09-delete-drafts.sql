-- Delete every draft in social_posts (not scheduled and not posted).
-- A copy is kept in social_posts_drafts_backup first, so this can be undone.

create table if not exists public.social_posts_drafts_backup as
  select * from public.social_posts where false;

insert into public.social_posts_drafts_backup
  select * from public.social_posts
  where scheduled_for is null and posted_at is null and coalesce(status, '') <> 'posted'
    and id not in (select id from public.social_posts_drafts_backup);

delete from public.social_posts
  where scheduled_for is null and posted_at is null and coalesce(status, '') <> 'posted';

select
  (select count(*) from public.social_posts_drafts_backup) as drafts_backed_up,
  (select count(*) from public.social_posts where scheduled_for is null and posted_at is null and coalesce(status, '') <> 'posted') as drafts_left,
  (select count(*) from public.social_posts where campaign = 'AI & Cybersecurity') as campaign_posts;

-- To undo:  insert into public.social_posts select * from public.social_posts_drafts_backup;
