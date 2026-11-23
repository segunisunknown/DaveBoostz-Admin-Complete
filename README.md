# DaveBoostz v2.0.0 — Android Gaming Performance & Remote Administration Platform

Private administration console and Material 3 Jetpack Compose Android application backed by **Supabase Authentication**, **Supabase PostgreSQL** (Row Level Security), and **Supabase Storage**.

## Repository Structure

```
DaveBoostz/
├── android-app/        # Android Kotlin + Compose + Hilt + Room + DataStore + Shizuku 13.1.5
├── src/                # React + TypeScript + Vite + Tailwind Admin Web Platform
├── supabase/           # Complete PostgreSQL schema, relationships, indexes, RLS & Storage SQL
├── docs/               # Installation, Admin Guide, and Architecture documentation
├── .github/workflows/  # CI workflows (Web Admin & Android Gradle CI)
├── vercel.json         # Production SPA rewrite configuration
└── PROJECT_VERSION.txt # 2.0.0
```

## Quick Setup (Admin Web Console & Supabase)

1. Copy `.env.example` to `.env` and fill in your Supabase public credentials (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`). Never expose `service_role` keys in frontend files.
2. In your Supabase Dashboard:
   - Run `supabase/schema.sql` in **SQL Editor** to create all tables, foreign keys, indexes, `daveboostz-assets` Storage bucket, and RLS policies.
   - Enable **Email** sign-in under **Authentication → Providers** and configure your web URL under **Authentication → URL Configuration → Redirect URLs** (required for Password Recovery links).
   - Create an admin user under **Authentication → Users**, copy their UUID (`user_id`), and insert a row into `public.admins`:
     ```sql
     insert into public.admins (user_id, email, role, is_active)
     values ('<AUTH_USER_UUID>', 'admin@daveboostz.com', 'Super Admin', true);
     ```
3. Run locally:
   ```bash
   npm install
   npm run dev
   ```
4. Build and verify for production (Vercel):
   ```bash
   npm run lint
   npm test
   npm run build
   ```

## Android Application Highlights (v2.0.0)

- **5-Screen Compose Navigation (`MainActivity.kt`)**: Dashboard, Games (+ Crosshair Studio), Monitor, System (Shizuku & Runtime Permissions), and Settings.
- **Honest Telemetry (`HardwareMonitor.kt`)**: Reads genuine per-core CPU frequencies, `/proc/meminfo` / `ActivityManager`, battery thermal/voltage sensors, `Display.Mode` supported refresh rates, and TCP network probe latency — never fabricated FPS or fake overclocking.
- **Single-Window Overlay HUD (`OverlayForegroundService.kt`)**: Edge bubble, landscape side panels, compact/vertical Mini HUD, and non-touchable **Crosshair Studio** reticle (`CLASSIC_CROSS`, `CENTER_DOT`, `CIRCLE_RETICLE`, `OPEN_BRACKET`) backed by `UserPreferencesRepository` (DataStore).
- **Validated Supabase Remote Config (`RemoteConfigModels.kt` & `RemoteConfigRepository.kt`)**: Fetches `daveboostz_config?id=eq.published` over HTTPS using OkHttp + `kotlinx.serialization`, caches in DataStore, clamps HUD bounds safely, disables remote overrides under maintenance mode, and records opt-in session diagnostics to `daveboostz_sessions` only when explicitly enabled.

## Documentation

See `/docs/README.md`, `/docs/INSTALLATION.md`, `/docs/ADMIN_GUIDE.md`, and `/docs/ARCHITECTURE.md` for full guides.
