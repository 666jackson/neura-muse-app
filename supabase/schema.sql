-- Neura Muse · Supabase schema
-- Run in the SQL editor of your Supabase project.

create extension if not exists "pgcrypto";

-- ============ TABLES ============

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  cover_image_url text,
  gallery_images jsonb default '[]'::jsonb,
  model_url text,                        -- .glb / .gltf in the "models" bucket
  video_url text,                        -- imported motion reel (mp4 in "videos" bucket)
  armor_type text,
  weapon_system text,
  energy_core text,
  cinematic_description text,
  color_theme text default '#7dd3fc',
  rarity_level text default 'SR',
  order_index int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weapons (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id) on delete cascade,
  name text not null,
  type text,
  description text,
  preview_image_url text
);

create table if not exists public.storyboards (
  id uuid primary key default gen_random_uuid(),
  character_id uuid references public.characters(id) on delete cascade,
  title text not null,
  scene_type text,                       -- cover / full-body / side-profile / loadout / combat / blueprint
  description text,
  image_url text,
  order_index int not null default 0
);

-- Standalone video library (not tied to a character).
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,               -- mp4 in the "videos" bucket
  poster_url text,                       -- optional thumbnail image
  order_index int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Background soundtrack library (mp3 audio played on the homepage).
create table if not exists public.soundtracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audio_url text not null,               -- mp3 in the "videos" bucket (audio/ prefix)
  order_index int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  image_url text not null,
  analysis_result jsonb,
  created_at timestamptz not null default now()
);

-- ============ ADMIN ROLE ============
-- Add admin user ids here (or use a user_roles table / custom claims).
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ============ ROW LEVEL SECURITY ============

alter table public.characters  enable row level security;
alter table public.weapons     enable row level security;
alter table public.storyboards enable row level security;
alter table public.videos      enable row level security;
alter table public.soundtracks enable row level security;
alter table public.uploads     enable row level security;
alter table public.admins      enable row level security;

-- Public can read only published characters; admins can do everything.
create policy "public read published characters" on public.characters
  for select using (is_public = true or public.is_admin());
create policy "admin write characters" on public.characters
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read weapons of published characters" on public.weapons
  for select using (
    exists (select 1 from public.characters c where c.id = character_id and (c.is_public or public.is_admin()))
  );
create policy "admin write weapons" on public.weapons
  for all using (public.is_admin()) with check (public.is_admin());

create policy "public read storyboards of published characters" on public.storyboards
  for select using (
    exists (select 1 from public.characters c where c.id = character_id and (c.is_public or public.is_admin()))
  );
create policy "admin write storyboards" on public.storyboards
  for all using (public.is_admin()) with check (public.is_admin());

-- Public can read only published videos; admins can do everything.
create policy "public read published videos" on public.videos
  for select using (is_public = true or public.is_admin());
create policy "admin write videos" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());

-- Public can read only published soundtracks; admins can do everything.
create policy "public read published soundtracks" on public.soundtracks
  for select using (is_public = true or public.is_admin());
create policy "admin write soundtracks" on public.soundtracks
  for all using (public.is_admin()) with check (public.is_admin());

-- Anyone signed-in (or anon) may insert fan uploads; only admins may browse them all.
create policy "insert uploads" on public.uploads
  for insert with check (true);
create policy "admin read uploads" on public.uploads
  for select using (public.is_admin() or user_id = auth.uid());

create policy "admins readable by admins" on public.admins
  for select using (public.is_admin());

-- ============ STORAGE BUCKETS ============
insert into storage.buckets (id, name, public) values
  ('characters', 'characters', true),
  ('models', 'models', true),
  ('uploads', 'uploads', true),
  ('videos', 'videos', true)
on conflict (id) do nothing;

create policy "public read character assets" on storage.objects
  for select using (bucket_id in ('characters', 'models', 'uploads', 'videos'));
create policy "admin write character assets" on storage.objects
  for insert with check (bucket_id in ('characters', 'models', 'videos') and public.is_admin());
create policy "anyone can add fan uploads" on storage.objects
  for insert with check (bucket_id = 'uploads');

-- ============ updated_at trigger ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists characters_touch on public.characters;
create trigger characters_touch before update on public.characters
  for each row execute function public.touch_updated_at();

drop trigger if exists videos_touch on public.videos;
create trigger videos_touch before update on public.videos
  for each row execute function public.touch_updated_at();

-- ============ MIGRATION (existing databases) ============
-- Safe to re-run; adds the video columns + bucket to an already-provisioned DB.
alter table public.characters add column if not exists video_url text;
alter table public.characters add column if not exists order_index int not null default 0;

insert into storage.buckets (id, name, public) values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Standalone video library table (safe to re-run on an existing DB).
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  poster_url text,
  order_index int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.videos enable row level security;

drop policy if exists "public read published videos" on public.videos;
create policy "public read published videos" on public.videos
  for select using (is_public = true or public.is_admin());
drop policy if exists "admin write videos" on public.videos;
create policy "admin write videos" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists videos_touch on public.videos;
create trigger videos_touch before update on public.videos
  for each row execute function public.touch_updated_at();

-- Soundtrack library table (safe to re-run on an existing DB).
create table if not exists public.soundtracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  audio_url text not null,
  order_index int not null default 0,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.soundtracks enable row level security;

drop policy if exists "public read published soundtracks" on public.soundtracks;
create policy "public read published soundtracks" on public.soundtracks
  for select using (is_public = true or public.is_admin());
drop policy if exists "admin write soundtracks" on public.soundtracks;
create policy "admin write soundtracks" on public.soundtracks
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists soundtracks_touch on public.soundtracks;
create trigger soundtracks_touch before update on public.soundtracks
  for each row execute function public.touch_updated_at();

-- ============ BOOTSTRAP ============
-- 1. Create your admin user in Authentication > Users.
-- 2. insert into public.admins (user_id) values ('YOUR-USER-UUID');
