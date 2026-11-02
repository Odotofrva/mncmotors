-- Run in Supabase SQL Editor. Applications are private and have no browser-accessible policies.
create table if not exists public.community_applications (
 id uuid primary key default gen_random_uuid(),
 first_name text not null check (char_length(first_name) between 1 and 80),
 last_name text not null check (char_length(last_name) between 1 and 80),
 email text not null check (char_length(email) between 3 and 180),
 interest text not null check (char_length(interest) between 1 and 100),
 message text not null default '' check (char_length(message) <= 1000),
 consent boolean not null check (consent = true),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
alter table public.community_applications enable row level security;
revoke all on public.community_applications from anon, authenticated;
-- Do not create anon SELECT/INSERT/UPDATE policies. Only the Edge Function's service role inserts.
create index if not exists community_applications_created_idx on public.community_applications(created_at desc);
