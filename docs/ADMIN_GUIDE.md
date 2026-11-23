# DaveBoostz Administrator Guide

## Authentication, Sessions & Password Recovery
- Sign in using Supabase Auth Email/Password credentials (`supabase.auth.signInWithPassword`).
- Sessions persist cleanly and refresh automatically via Supabase Auth tokens.
- Use **Forgot password?** on the sign-in screen to send a Supabase recovery link (`resetPasswordForEmail`) and update the administrator password inline upon redirect (`PASSWORD_RECOVERY` → `updateUser`).
- Administrative access requires an active row in `public.admins` (`user_id = auth.uid()`, `is_active = true`). Client-side self-promotion is blocked by RLS.

## Configuration & Storage Workflow
1. Edit Overlay HUD parameters, Feature Registry switches, Games Catalog, Text Strings, or App Release details.
2. Upload icons, logos, and banners via **Icons & Assets** — images are compressed to WebP and uploaded directly to the Supabase Storage `daveboostz-assets` bucket.
3. Changes validate automatically against safe bounds (valid `#RRGGBB` colors, `https://` URLs, opacity 50–100%, HUD scale 0.75x–1.35x, telemetry interval 500–5000ms, semver/SHA-256 release metadata).
4. Click **Save Draft** to persist work-in-progress to `daveboostz_config` (`id = 'draft'`).
5. Click **Publish** to push the live validated configuration to `daveboostz_config` (`id = 'published'`), snapshot the revision into `daveboostz_versions`, sync support ticket updates to `daveboostz_support_tickets`, and append an audit entry to `daveboostz_audit_logs`.
6. Use **History & Preview** to roll back a previous published snapshot into draft at any time.
