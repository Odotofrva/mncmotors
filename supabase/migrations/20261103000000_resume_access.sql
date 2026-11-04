create table if not exists public.resume_access_attempts (id bigint generated always as identity primary key, ip_hash text not null, created_at timestamptz not null default now());
create index if not exists resume_access_attempts_ip_time_idx on public.resume_access_attempts (ip_hash, created_at desc);
alter table public.resume_access_attempts enable row level security;
revoke all on public.resume_access_attempts from anon, authenticated;
insert into storage.buckets (id,name,public) values ('private-resumes','private-resumes',false) on conflict (id) do update set public=false;
