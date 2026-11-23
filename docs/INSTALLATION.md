# DaveBoostz Installation & Deployment Guide

## 1. Supabase Backend Setup
1. Create or open your project in [Supabase](https://supabase.com/dashboard).
2. Open **SQL Editor** and execute the entire [`supabase/schema.sql`](../supabase/schema.sql) script. This provisions:
   - Tables: `admins`, `daveboostz_config`, `daveboostz_versions`, `daveboostz_audit_logs`, `daveboostz_users`, `daveboostz_sessions`, `daveboostz_error_reports`, `daveboostz_support_tickets`, `daveboostz_media_assets`
   - Indexes & `updated_at` triggers
   - Row Level Security (RLS) policies and `is_daveboostz_admin()` helper
   - Public Storage bucket `daveboostz-assets` with admin-only upload/delete policies
3. Enable **Email** sign-in in **Authentication → Providers** and configure your app URL in **Authentication → URL Configuration → Redirect URLs** (for password recovery links).
4. Create an admin account in **Authentication → Users**, copy its UUID, and insert it into `public.admins`:
   ```sql
   insert into public.admins (user_id, email, role, is_active)
   values ('<AUTH_USER_UUID>', 'admin@daveboostz.com', 'Super Admin', true);
   ```

## 2. Web Admin Panel (`admin-web` / Root)
1. Copy `.env.example` to `.env` and populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (never add `service_role` keys to frontend env vars).
2. Install dependencies and verify build:
   ```bash
   npm install
   npm run lint
   npm test
   npm run build
   ```
3. Deploy to Vercel:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings.

## 3. Android Application (`android-app/` / `android/`)
1. Optionally add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to your local `gradle.properties` (see `gradle.properties.example`) or set GitHub Actions secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Offline builds compile safely even when unset.
2. Open the Android directory in Android Studio Ladybug / Koala+ with JDK 17.
3. Sync Gradle and run:
   ```bash
   gradle :app:testDebugUnitTest :app:assembleDebug
   ```
