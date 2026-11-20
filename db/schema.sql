-- ---------------------------------------------------------------------------
-- outfiter. database schema
--
-- This file is idempotent: it is safe to run it on an empty database or on a
-- database that is already up to date. Apply it with:
--
--   npm run db:push
--
-- Every statement is wrapped in IF NOT EXISTS so adding a statement here and
-- re-running the command upgrades existing environments in place.
-- ---------------------------------------------------------------------------

create table if not exists wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  name text not null,
  type text not null,
  color text not null default '',
  description text not null default '',
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists outfit_posts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null,
  title text not null,
  category text not null default 'Everyday',
  image_url text not null,
  location text not null default '',
  created_at timestamptz not null default now()
);

-- Added later than the first release: keep `create table` above authoritative
-- for new databases, and back-fill existing ones here.
alter table outfit_posts add column if not exists category text not null default 'Everyday';
alter table outfit_posts alter column category set default 'Everyday';

create table if not exists outfit_post_items (
  post_id uuid not null references outfit_posts(id) on delete cascade,
  item_id uuid not null references wardrobe_items(id) on delete cascade,
  primary key (post_id, item_id)
);

create table if not exists outfit_likes (
  post_id uuid not null references outfit_posts(id) on delete cascade,
  clerk_user_id text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, clerk_user_id)
);

-- Wardrobe: newest first, scoped to the owner.
create index if not exists wardrobe_items_user_idx on wardrobe_items (clerk_user_id, created_at desc);

-- Feed: newest first.
create index if not exists outfit_posts_created_idx on outfit_posts (created_at desc);

-- Feed likes counter and "did I like this" lookups.
create index if not exists outfit_likes_post_idx on outfit_likes (post_id);

-- Deleting a wardrobe item must not lose the post -> item link lookups.
create index if not exists outfit_post_items_item_idx on outfit_post_items (item_id);
