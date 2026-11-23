# DaveBoostz System Architecture

## Shared Configuration Contract
Both the Web Admin Panel (`src/services/supabaseService.ts`) and the Android app (`RemoteConfigModels.kt` & `RemoteConfigRepository.kt`) share one strict schema stored in PostgreSQL table `public.daveboostz_config` (`id = 'published'`, `payload_json` JSONB column):
- `publishedVersionNumber` & `lastSyncedIso`
- `maintenanceMode`
- `branding` (`appName`, `tagline`, `accentColor`, `launcherIconAlias`, Shizuku notices)
- `content` (UI copy strings, permission rationales, fair-play disclosures)
- `overlay` (WindowManager HUD switches, bounds, style, thresholds)
- `release` (`minSupportedVersion`, `latestVersion`, `changelog`, `apkUrl`, `apkSha256`, `forceUpdate`)
- `featureFlags` (24-module map synced 1:1 with `FeatureRegistry.kt`)
- `games` (catalog entries with recommended profiles)

## Supabase Security & Storage Design
- **Row Level Security (RLS)** is enabled on all 9 public tables (`admins`, `daveboostz_config`, `daveboostz_versions`, `daveboostz_audit_logs`, `daveboostz_users`, `daveboostz_sessions`, `daveboostz_error_reports`, `daveboostz_support_tickets`, `daveboostz_media_assets`).
- Public/anonymous reads on `daveboostz_config` are strictly limited to `id = 'published'`. Drafts, version history, audit logs, users, and telemetry reads require `public.is_daveboostz_admin()`.
- **Supabase Storage (`daveboostz-assets`)** serves public HTTPS CDN image URLs while restricting object inserts, updates, and deletes to authenticated active admins.

## Android Safety & Honesty Boundaries
- `HardwareMonitor.kt`: Reads real OS telemetry (`ActivityManager.MemoryInfo`, `BatteryManager`, `/sys/devices/system/cpu`, `Display.Mode`, `ConnectivityManager`). Never fabricates FPS or hardware overclocking claims.
- `ShizukuUserService.kt`: Executes only allowlisted actions (`FORCE_STOP`, `DENY_BG`, `ALLOW_BG`, `STANDBY_RARE`, `GAME_MODE_PERF`, `GAME_MODE_STANDARD`, `COMPILE_SPEED`) and `dumpsys SurfaceFlinger --latency`. Arbitrary shell execution is rejected.
- `OverlayForegroundService.kt`: Single `TYPE_APPLICATION_OVERLAY` Compose WindowManager window with center touch pass-through and remote kill-switch support.
