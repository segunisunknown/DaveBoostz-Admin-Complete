# Supabase Backend Configuration Guide

DaveBoostz v2.0.0 uses **Supabase Authentication**, **Supabase PostgreSQL** (with Row Level Security), and **Supabase Storage** (`daveboostz-assets`).

## 1. Run the SQL Setup Script
1. Open your Supabase Dashboard → **SQL Editor**.
2. Paste the full contents of [`schema.sql`](./schema.sql) and click **Run**.
3. This creates:
   - `public.admins`, `public.daveboostz_config`, `public.daveboostz_versions`, `public.daveboostz_audit_logs`
   - `public.daveboostz_users`, `public.daveboostz_sessions`, `public.daveboostz_error_reports`
   - `public.daveboostz_support_tickets`, `public.daveboostz_media_assets`
   - Storage bucket `daveboostz-assets` with public read + admin-only write policies
   - Strict RLS policies enforced via `public.is_daveboostz_admin()`

## 2. Provision Your First Admin Account
1. In **Authentication → Providers**, keep **Email** enabled and disable public sign-ups if this is a private admin console.
2. In **Authentication → URL Configuration**, add your Admin Web origin (for example `http://localhost:3000` and your Vercel URL) to **Redirect URLs** so **Password Recovery** links redirect back cleanly.
3. In **Authentication → Users**, create your first admin user and copy their UUID (`user_id`).
4. Run in **SQL Editor**:
   ```sql
   insert into public.admins (user_id, email, role, is_active)
   values ('<AUTH_USER_UUID>', 'admin@daveboostz.com', 'Super Admin', true)
   on conflict (user_id) do update set role = 'Super Admin', is_active = true;
   ```

## 3. Environment Variables (Frontend & Android)
- Never place Supabase `service_role` keys or database passwords in frontend code, `.env.example`, or Android builds.
- Web Admin uses only the public project URL and `anon` key:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Android uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` (via `gradle.properties` or GitHub Actions repository secrets).
