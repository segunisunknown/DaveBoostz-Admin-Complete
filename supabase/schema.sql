-- ============================================================================
-- DaveBoostz v2.0.0 — Complete Supabase PostgreSQL + Storage + RLS Setup
-- Run this entire script inside the Supabase SQL Editor (Project -> SQL Editor).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Shared updated_at trigger helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Tables & Relationships
-- ----------------------------------------------------------------------------

-- Authorized dashboard administrators (provisioned via SQL Editor / service role)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'Content Editor'
    check (role in ('Super Admin', 'Content Editor', 'Support Agent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_admins_updated_at on public.admins;
create trigger trg_admins_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

-- Draft & Published remote configuration documents (id = 'draft' | 'published')
create table if not exists public.daveboostz_config (
  id text primary key check (id in ('draft', 'published')),
  version_number integer not null default 1 check (version_number >= 1),
  state_json jsonb,
  payload_json jsonb,
  maintenance_mode boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_daveboostz_config_updated_at on public.daveboostz_config;
create trigger trg_daveboostz_config_updated_at
  before update on public.daveboostz_config
  for each row execute function public.set_updated_at();

-- Published configuration revision snapshots for rollback
create table if not exists public.daveboostz_versions (
  version_number integer primary key check (version_number >= 1),
  summary text not null,
  payload_json jsonb not null,
  state_snapshot jsonb,
  published_by uuid references auth.users(id) on delete set null,
  published_by_email text not null default 'admin@daveboostz.com',
  published_at timestamptz not null default now()
);

-- Administrative audit trail
create table if not exists public.daveboostz_audit_logs (
  id text primary key,
  admin_user_id uuid references auth.users(id) on delete set null,
  admin_email text not null,
  action text not null,
  details text not null,
  created_at timestamptz not null default now()
);

-- Registered Android application users
create table if not exists public.daveboostz_users (
  uid uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  display_name text,
  device_model text,
  app_version text,
  status text not null default 'active' check (status in ('active', 'suspended')),
  role text not null default 'user' check (role in ('user', 'beta_tester', 'admin')),
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_daveboostz_users_updated_at on public.daveboostz_users;
create trigger trg_daveboostz_users_updated_at
  before update on public.daveboostz_users
  for each row execute function public.set_updated_at();

-- Opt-in Android gaming session telemetry
create table if not exists public.daveboostz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_uid uuid references public.daveboostz_users(uid) on delete set null,
  app_version text not null check (char_length(app_version) <= 32),
  device_model text,
  android_version text,
  game_package text,
  duration_sec integer not null check (duration_sec >= 0 and duration_sec <= 86400),
  avg_fps integer check (avg_fps is null or (avg_fps >= 1 and avg_fps <= 360)),
  max_temp_c real check (max_temp_c is null or (max_temp_c >= 0 and max_temp_c <= 120)),
  shizuku_active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Client error & crash telemetry
create table if not exists public.daveboostz_error_reports (
  id uuid primary key default gen_random_uuid(),
  user_uid uuid references public.daveboostz_users(uid) on delete set null,
  app_version text not null check (char_length(app_version) <= 32),
  device_model text,
  severity text not null default 'error' check (severity in ('warning', 'error', 'fatal')),
  component text,
  message text not null check (char_length(message) <= 4000),
  created_at timestamptz not null default now()
);

-- Support tickets & admin responses
create table if not exists public.daveboostz_support_tickets (
  id text primary key,
  user_uid uuid references public.daveboostz_users(uid) on delete set null,
  user_email text not null,
  device_info text not null default '',
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  admin_reply text,
  replied_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_daveboostz_support_tickets_updated_at on public.daveboostz_support_tickets;
create trigger trg_daveboostz_support_tickets_updated_at
  before update on public.daveboostz_support_tickets
  for each row execute function public.set_updated_at();

-- Media asset metadata linked to Supabase Storage ('daveboostz-assets')
create table if not exists public.daveboostz_media_assets (
  id text primary key,
  name text not null,
  category text not null check (category in ('logo', 'background', 'banner', 'icon')),
  storage_path text,
  public_url text not null,
  alt_text text not null default '',
  size_kb integer not null default 0 check (size_kb >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_admins_email on public.admins (email);
create index if not exists idx_versions_published_at on public.daveboostz_versions (published_at desc);
create index if not exists idx_audit_logs_created_at on public.daveboostz_audit_logs (created_at desc);
create index if not exists idx_users_last_active on public.daveboostz_users (last_active_at desc);
create index if not exists idx_users_status on public.daveboostz_users (status);
create index if not exists idx_sessions_created_at on public.daveboostz_sessions (created_at desc);
create index if not exists idx_sessions_user_uid on public.daveboostz_sessions (user_uid);
create index if not exists idx_error_reports_created_at on public.daveboostz_error_reports (created_at desc);
create index if not exists idx_error_reports_severity on public.daveboostz_error_reports (severity);
create index if not exists idx_tickets_status_created on public.daveboostz_support_tickets (status, created_at desc);
create index if not exists idx_media_assets_category on public.daveboostz_media_assets (category, created_at desc);

-- ----------------------------------------------------------------------------
-- 4. RLS Helper Function (security definer avoids recursive RLS checks)
-- ----------------------------------------------------------------------------
create or replace function public.is_daveboostz_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
      and a.is_active = true
  );
$$;

create or replace function public.is_daveboostz_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
      and a.is_active = true
      and a.role = 'Super Admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- 5. Enable Row Level Security (RLS) on All Tables
-- ----------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.daveboostz_config enable row level security;
alter table public.daveboostz_versions enable row level security;
alter table public.daveboostz_audit_logs enable row level security;
alter table public.daveboostz_users enable row level security;
alter table public.daveboostz_sessions enable row level security;
alter table public.daveboostz_error_reports enable row level security;
alter table public.daveboostz_support_tickets enable row level security;
alter table public.daveboostz_media_assets enable row level security;

-- admins policies (no self-promotion; users can read own admin row, Super Admins can read/manage)
drop policy if exists "admins_select_own_or_super" on public.admins;
create policy "admins_select_own_or_super"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid() or public.is_daveboostz_super_admin());

drop policy if exists "admins_manage_super_admin" on public.admins;
create policy "admins_manage_super_admin"
  on public.admins for all
  to authenticated
  using (public.is_daveboostz_super_admin())
  with check (public.is_daveboostz_super_admin());

-- daveboostz_config policies (public read ONLY on id = 'published'; admins full CRUD)
drop policy if exists "config_public_read_published" on public.daveboostz_config;
create policy "config_public_read_published"
  on public.daveboostz_config for select
  to anon, authenticated
  using (id = 'published' or public.is_daveboostz_admin());

drop policy if exists "config_admin_write" on public.daveboostz_config;
create policy "config_admin_write"
  on public.daveboostz_config for all
  to authenticated
  using (public.is_daveboostz_admin())
  with check (public.is_daveboostz_admin());

-- daveboostz_versions policies (admin-only)
drop policy if exists "versions_admin_all" on public.daveboostz_versions;
create policy "versions_admin_all"
  on public.daveboostz_versions for all
  to authenticated
  using (public.is_daveboostz_admin())
  with check (public.is_daveboostz_admin());

-- daveboostz_audit_logs policies (admin-only read/append)
drop policy if exists "audit_logs_admin_select" on public.daveboostz_audit_logs;
create policy "audit_logs_admin_select"
  on public.daveboostz_audit_logs for select
  to authenticated
  using (public.is_daveboostz_admin());

drop policy if exists "audit_logs_admin_insert" on public.daveboostz_audit_logs;
create policy "audit_logs_admin_insert"
  on public.daveboostz_audit_logs for insert
  to authenticated
  with check (public.is_daveboostz_admin());

-- daveboostz_users policies (admin full access; users can view their own record)
drop policy if exists "users_admin_or_self_select" on public.daveboostz_users;
create policy "users_admin_or_self_select"
  on public.daveboostz_users for select
  to authenticated
  using (public.is_daveboostz_admin() or auth_user_id = auth.uid());

drop policy if exists "users_admin_write" on public.daveboostz_users;
create policy "users_admin_write"
  on public.daveboostz_users for all
  to authenticated
  using (public.is_daveboostz_admin())
  with check (public.is_daveboostz_admin());

-- daveboostz_sessions policies (validated opt-in telemetry insert; admin-only read)
drop policy if exists "sessions_admin_select" on public.daveboostz_sessions;
create policy "sessions_admin_select"
  on public.daveboostz_sessions for select
  to authenticated
  using (public.is_daveboostz_admin());

drop policy if exists "sessions_opt_in_insert" on public.daveboostz_sessions;
create policy "sessions_opt_in_insert"
  on public.daveboostz_sessions for insert
  to anon, authenticated
  with check (
    duration_sec >= 0
    and duration_sec <= 86400
    and char_length(app_version) between 1 and 32
  );

-- daveboostz_error_reports policies (validated crash insert; admin-only read)
drop policy if exists "error_reports_admin_select" on public.daveboostz_error_reports;
create policy "error_reports_admin_select"
  on public.daveboostz_error_reports for select
  to authenticated
  using (public.is_daveboostz_admin());

drop policy if exists "error_reports_client_insert" on public.daveboostz_error_reports;
create policy "error_reports_client_insert"
  on public.daveboostz_error_reports for insert
  to anon, authenticated
  with check (
    severity in ('warning', 'error', 'fatal')
    and char_length(app_version) between 1 and 32
    and char_length(message) between 1 and 4000
  );

-- daveboostz_support_tickets policies (admin full CRUD; authenticated users own tickets)
drop policy if exists "tickets_admin_all" on public.daveboostz_support_tickets;
create policy "tickets_admin_all"
  on public.daveboostz_support_tickets for all
  to authenticated
  using (public.is_daveboostz_admin())
  with check (public.is_daveboostz_admin());

drop policy if exists "tickets_user_insert_own" on public.daveboostz_support_tickets;
create policy "tickets_user_insert_own"
  on public.daveboostz_support_tickets for insert
  to authenticated
  with check (status = 'open' and admin_reply is null);

-- daveboostz_media_assets policies (public read; admin write)
drop policy if exists "media_assets_public_read" on public.daveboostz_media_assets;
create policy "media_assets_public_read"
  on public.daveboostz_media_assets for select
  to anon, authenticated
  using (true);

drop policy if exists "media_assets_admin_write" on public.daveboostz_media_assets;
create policy "media_assets_admin_write"
  on public.daveboostz_media_assets for all
  to authenticated
  using (public.is_daveboostz_admin())
  with check (public.is_daveboostz_admin());

-- ----------------------------------------------------------------------------
-- 6. Supabase Storage Bucket & Policies ('daveboostz-assets')
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'daveboostz-assets',
  'daveboostz-assets',
  true,
  5242880, -- 5 MB max per asset
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "daveboostz_assets_public_read" on storage.objects;
create policy "daveboostz_assets_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'daveboostz-assets');

drop policy if exists "daveboostz_assets_admin_insert" on storage.objects;
create policy "daveboostz_assets_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'daveboostz-assets'
    and public.is_daveboostz_admin()
  );

drop policy if exists "daveboostz_assets_admin_update" on storage.objects;
create policy "daveboostz_assets_admin_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'daveboostz-assets'
    and public.is_daveboostz_admin()
  )
  with check (
    bucket_id = 'daveboostz-assets'
    and public.is_daveboostz_admin()
  );

drop policy if exists "daveboostz_assets_admin_delete" on storage.objects;
create policy "daveboostz_assets_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'daveboostz-assets'
    and public.is_daveboostz_admin()
  );

-- ----------------------------------------------------------------------------
-- 7. Bootstrap First Super Admin (Replace UUID & Email after creating Auth user)
-- ----------------------------------------------------------------------------
-- insert into public.admins (user_id, email, role, is_active)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@daveboostz.com', 'Super Admin', true)
-- on conflict (user_id) do update set role = 'Super Admin', is_active = true;

-- ----------------------------------------------------------------------------
-- 10. Realtime publication for cross-client admin synchronization
-- ----------------------------------------------------------------------------
-- These tables are used by the admin dashboard to refresh drafts and telemetry
-- when another admin or an Android client writes new rows.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'daveboostz_config'
    ) then
      alter publication supabase_realtime add table public.daveboostz_config;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'daveboostz_sessions'
    ) then
      alter publication supabase_realtime add table public.daveboostz_sessions;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'daveboostz_error_reports'
    ) then
      alter publication supabase_realtime add table public.daveboostz_error_reports;
    end if;
  end if;
end $$;
