-- Side Three: tables for when clips move off the phone and into Supabase.
-- Run in the Supabase SQL editor. Storage bucket: "media" (private).

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_on date not null,
  ends_on date not null,
  pressed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  user_id uuid references auth.users(id),
  name text not null,
  initial text not null,
  role text not null default 'girl' check (role in ('host', 'girl', 'lens', 'editor')),
  flight text,
  lands text,
  liner_note text,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('clip', 'fit', 'voice')),
  day text not null,
  moment text not null,
  dlala boolean not null default false,
  storage_path text not null,
  mime text not null,
  captured_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists media_trip_day on media (trip_id, day, captured_at);

alter table trips enable row level security;
alter table members enable row level security;
alter table media enable row level security;

-- Members of a trip can read everything on it; each member writes only their own media.
create policy "members read trip" on trips for select
  using (exists (select 1 from members m where m.trip_id = trips.id and m.user_id = auth.uid()));
create policy "members read members" on members for select
  using (exists (select 1 from members m where m.trip_id = members.trip_id and m.user_id = auth.uid()));
create policy "members read media" on media for select
  using (exists (select 1 from members m where m.trip_id = media.trip_id and m.user_id = auth.uid()));
create policy "members add own media" on media for insert
  with check (exists (select 1 from members m where m.id = media.member_id and m.user_id = auth.uid()));
