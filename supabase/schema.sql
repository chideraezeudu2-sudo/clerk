-- Signal database schema
-- Paste this entire file into the Supabase SQL Editor
-- (https://supabase.com/dashboard/project/ejdpkamrxiilpglkfqlw/sql/new) and click "Run".

-- ============ TABLES ============

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  mailing_address text not null default '',
  default_follow_up_days int not null default 3,
  daily_cap int not null default 50,
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now()
);

create table if not exists public.personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company_name text not null default '',
  description text not null default '',
  website_url text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.senders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  provider text not null default 'gmail',
  smtp_host text not null default 'smtp.gmail.com',
  smtp_port int not null default 465,
  smtp_user text not null default '',
  smtp_pass text not null default '',
  status text not null default 'active' check (status in ('active', 'paused')),
  daily_cap int not null default 15,
  max_cap int not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  persona_id uuid references public.personas (id) on delete set null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'paused')),
  signal_keywords text[] not null default '{}',
  voice_notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  name text not null,
  email text not null,
  company text not null default '',
  role text not null default '',
  signal_type text not null default 'hiring',
  signal_title text not null default '',
  signal_detail text not null default '',
  source_url text,
  status text not null default 'new' check (status in ('new', 'drafted', 'sent')),
  created_at timestamptz not null default now()
);

create table if not exists public.email_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  campaign_id uuid references public.campaigns (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'sent')),
  rejection_reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.sent_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  draft_id uuid references public.email_drafts (id) on delete set null,
  campaign_id uuid references public.campaigns (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  sender_id uuid references public.senders (id) on delete set null,
  to_email text not null,
  subject text not null,
  body text not null,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  error text,
  sent_at timestamptz not null default now()
);

create index if not exists leads_campaign_idx on public.leads (campaign_id);
create index if not exists leads_user_idx on public.leads (user_id);
create index if not exists drafts_user_idx on public.email_drafts (user_id);
create index if not exists sent_user_idx on public.sent_emails (user_id);
create index if not exists campaigns_user_idx on public.campaigns (user_id);

-- ============ GRANTS FOR POSTGREST ROLES ============

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.personas enable row level security;
alter table public.senders enable row level security;
alter table public.campaigns enable row level security;
alter table public.leads enable row level security;
alter table public.email_drafts enable row level security;
alter table public.sent_emails enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own settings" on public.user_settings;
create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own personas" on public.personas;
create policy "own personas" on public.personas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own senders" on public.senders;
create policy "own senders" on public.senders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own campaigns" on public.campaigns;
create policy "own campaigns" on public.campaigns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own leads" on public.leads;
create policy "own leads" on public.leads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own drafts" on public.email_drafts;
create policy "own drafts" on public.email_drafts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sent" on public.sent_emails;
create policy "own sent" on public.sent_emails
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
