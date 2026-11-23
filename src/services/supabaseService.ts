import { isSupabaseConfigured, supabase, SUPABASE_STORAGE_BUCKET } from '../supabase';
import {
  AnalyticsSnapshot,
  AuditLogItem,
  ErrorReportRecord,
  ImageAsset,
  MasterState,
  RegisteredUserRecord,
  SessionTelemetryRecord
} from '../types';
import { initialMasterState } from '../initialData';
import { ALL_ANDROID_FEATURES } from '../featureRegistry';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
const SHA256_RE = /^[a-fA-F0-9]{64}$/;

export function isSafeAssetOrHttpsUrl(url: string): boolean {
  if (!url) return true;
  if (url.startsWith('/src/assets/')) return true;
  if (url.startsWith('data:image/webp;base64,') || url.startsWith('data:image/png;base64,')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates remote configuration values before persisting to Supabase PostgreSQL
 * so malformed settings can never reach Android clients.
 */
export function validateMasterState(state: MasterState): ValidationResult {
  const errors: string[] = [];

  if (!state.config.appName.trim()) {
    errors.push('App display name cannot be empty.');
  }
  if (!HEX_COLOR_RE.test(state.config.accentColor)) {
    errors.push('Primary accent color must be a valid 6-digit hex code (e.g. #ef4444).');
  }
  if (!HEX_COLOR_RE.test(state.config.secondaryColor)) {
    errors.push('Secondary surface color must be a valid 6-digit hex code (e.g. #18181b).');
  }
  if (!isSafeAssetOrHttpsUrl(state.config.shizukuDownloadUrl)) {
    errors.push('Shizuku download URL must use https://.');
  }
  if (!isSafeAssetOrHttpsUrl(state.config.appDownloadUrl)) {
    errors.push('App download URL must use https://.');
  }
  if (state.overlay.panelOpacityPercent < 50 || state.overlay.panelOpacityPercent > 100) {
    errors.push('Overlay panel opacity must be between 50% and 100%.');
  }
  if (state.overlay.hudScale < 0.75 || state.overlay.hudScale > 1.35) {
    errors.push('HUD scale must be between 0.75x and 1.35x.');
  }
  if (state.overlay.refreshIntervalMs < 500 || state.overlay.refreshIntervalMs > 5000) {
    errors.push('Overlay telemetry interval must be between 500ms and 5000ms.');
  }
  if (state.overlay.highTempThresholdC < 35 || state.overlay.highTempThresholdC > 65) {
    errors.push('High temperature threshold must be between 35°C and 65°C.');
  }
  if (!SEMVER_RE.test(state.release.latestVersion.trim())) {
    errors.push('Latest release version must follow X.Y.Z format (e.g. 2.0.0).');
  }
  if (!SEMVER_RE.test(state.release.minSupportedVersion.trim())) {
    errors.push('Minimum supported version must follow X.Y.Z format (e.g. 1.0.0).');
  }
  if (state.release.apkUrl && !isSafeAssetOrHttpsUrl(state.release.apkUrl)) {
    errors.push('Release APK URL must use https://.');
  }
  if (state.release.apkSha256 && !SHA256_RE.test(state.release.apkSha256.trim())) {
    errors.push('APK SHA-256 hash must be exactly 64 hexadecimal characters.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Safely merges cached/Supabase state with the latest schema so newly added
 * Android features and overlay settings are preserved cleanly.
 */
export function migrateMasterState(raw: Partial<MasterState> | null | undefined): MasterState {
  if (!raw) return initialMasterState;

  const existingFeatureMap = new Map(
    (Array.isArray(raw.features) ? raw.features : []).map((f) => [f.id, f])
  );

  const mergedFeatures = ALL_ANDROID_FEATURES.map((baseFeature) => {
    const saved = existingFeatureMap.get(baseFeature.id);
    if (!saved) return { ...baseFeature, lastUpdatedAt: '2026-11-22' };
    return {
      ...baseFeature,
      enabled: baseFeature.remoteControllable ? Boolean(saved.enabled) : true,
      percentageRollout:
        typeof saved.percentageRollout === 'number' ? saved.percentageRollout : baseFeature.percentageRollout,
      minVersion: saved.minVersion || baseFeature.minVersion,
      countries:
        Array.isArray(saved.countries) && saved.countries.length > 0 ? saved.countries : baseFeature.countries,
      lastUpdatedAt: saved.lastUpdatedAt || '2026-11-22'
    };
  });

  return {
    ...initialMasterState,
    ...raw,
    config: { ...initialMasterState.config, ...(raw.config || {}) },
    overlay: { ...initialMasterState.overlay, ...(raw.overlay || {}) },
    content: { ...initialMasterState.content, ...(raw.content || {}) },
    ads: { ...initialMasterState.ads, ...(raw.ads || {}) },
    release: { ...initialMasterState.release, ...(raw.release || {}) },
    features: mergedFeatures,
    imageAssets:
      Array.isArray(raw.imageAssets) && raw.imageAssets.length > 0
        ? raw.imageAssets
        : initialMasterState.imageAssets,
    games: Array.isArray(raw.games) ? raw.games : initialMasterState.games,
    announcements: Array.isArray(raw.announcements) ? raw.announcements : initialMasterState.announcements,
    tickets: Array.isArray(raw.tickets) ? raw.tickets : initialMasterState.tickets,
    adminUsers:
      Array.isArray(raw.adminUsers) && raw.adminUsers.length > 0 ? raw.adminUsers : initialMasterState.adminUsers,
    versionHistory: Array.isArray(raw.versionHistory) ? raw.versionHistory : initialMasterState.versionHistory,
    auditLogs: Array.isArray(raw.auditLogs) ? raw.auditLogs : initialMasterState.auditLogs
  };
}

/**
 * Builds the validated JSON payload consumed by Android `RemoteConfigRepository.kt`.
 */
export function buildAndroidPublishedPayload(state: MasterState) {
  const featureFlags: Record<string, boolean> = {};
  for (const f of state.features) {
    featureFlags[f.id] = f.remoteControllable ? f.enabled : true;
  }

  return {
    publishedVersionNumber: state.publishedVersionNumber,
    lastSyncedIso: new Date().toISOString(),
    maintenanceMode: state.maintenanceMode || state.announcements.some((a) => a.maintenanceMode),
    branding: {
      appName: state.config.appName,
      tagline: state.config.tagline,
      launchTagline: state.config.launchTagline,
      accentColor: state.config.accentColor,
      glowIntensity: state.config.glowIntensity,
      launcherIconAlias: state.config.launcherIconAlias,
      shizukuDownloadUrl: state.config.shizukuDownloadUrl,
      shizukuNoticeText: state.config.shizukuNoticeText,
      shizukuNoticeEnabled: state.config.shizukuNoticeEnabled
    },
    content: state.content,
    overlay: {
      ...state.overlay,
      panelOpacityPercent: Math.min(100, Math.max(50, state.overlay.panelOpacityPercent)),
      hudScale: Math.min(1.35, Math.max(0.75, state.overlay.hudScale)),
      refreshIntervalMs: Math.min(5000, Math.max(500, state.overlay.refreshIntervalMs))
    },
    release: state.release,
    featureFlags,
    games: state.games
  };
}

export function buildStorageObjectPath(category: ImageAsset['category'], fileName: string): string {
  const safeBase = fileName
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'asset';
  return `${category}/${Date.now()}-${safeBase}.webp`;
}

export async function verifyAdminAllowlist(uid: string): Promise<boolean> {
  if (!isSupabaseConfigured || !uid) return false;
  const { data, error } = await supabase
    .from('admins')
    .select('user_id, is_active')
    .eq('user_id', uid)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return Boolean(data);
}

export async function loadDraftState(): Promise<{ state: MasterState; source: 'supabase' | 'local' }> {
  let localState = initialMasterState;
  try {
    const localRaw = localStorage.getItem('daveboostz_admin_state');
    localState = migrateMasterState(localRaw ? JSON.parse(localRaw) : null);
  } catch {
    localState = initialMasterState;
  }

  if (!isSupabaseConfigured) {
    return { state: localState, source: 'local' };
  }

  const { data, error } = await supabase
    .from('daveboostz_config')
    .select('state_json')
    .eq('id', 'draft')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data?.state_json) {
    const rawState =
      typeof data.state_json === 'string' ? JSON.parse(data.state_json) : data.state_json;
    const parsed = migrateMasterState(rawState);
    localStorage.setItem('daveboostz_admin_state', JSON.stringify(parsed));
    return { state: parsed, source: 'supabase' };
  }

  return { state: localState, source: 'local' };
}

export async function saveDraftState(state: MasterState, actorUid?: string): Promise<void> {
  localStorage.setItem('daveboostz_admin_state', JSON.stringify(state));
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.from('daveboostz_config').upsert(
    {
      id: 'draft',
      version_number: Math.max(1, state.publishedVersionNumber),
      state_json: state,
      maintenance_mode: state.maintenanceMode,
      updated_by: actorUid || null
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordAuditLogToSupabase(entry: AuditLogItem, actorUid?: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from('daveboostz_audit_logs').upsert(
    {
      id: entry.id,
      admin_user_id: actorUid || null,
      admin_email: entry.adminEmail,
      action: entry.action,
      details: entry.details
    },
    { onConflict: 'id' }
  );
  if (error) {
    throw new Error(error.message);
  }
}

export async function publishToSupabase(state: MasterState, actorUid?: string): Promise<void> {
  const validation = validateMasterState(state);
  if (!validation.valid) {
    throw new Error(validation.errors[0]);
  }

  localStorage.setItem('daveboostz_admin_state', JSON.stringify(state));
  if (!isSupabaseConfigured) return;

  const payload = buildAndroidPublishedPayload(state);
  const { versionHistory, auditLogs, ...snapshot } = state;
  void versionHistory;
  void auditLogs;

  const { error: configErr } = await supabase.from('daveboostz_config').upsert(
    [
      {
        id: 'draft',
        version_number: Math.max(1, state.publishedVersionNumber),
        state_json: state,
        maintenance_mode: state.maintenanceMode,
        updated_by: actorUid || null
      },
      {
        id: 'published',
        version_number: Math.max(1, state.publishedVersionNumber),
        payload_json: payload,
        maintenance_mode: payload.maintenanceMode,
        updated_by: actorUid || null
      }
    ],
    { onConflict: 'id' }
  );
  if (configErr) throw new Error(configErr.message);

  const { error: versionErr } = await supabase.from('daveboostz_versions').upsert(
    {
      version_number: Math.max(1, state.publishedVersionNumber),
      summary: state.versionHistory[0]?.summary || `Published v${state.publishedVersionNumber}`,
      payload_json: payload,
      state_snapshot: snapshot,
      published_by: actorUid || null,
      published_by_email: state.versionHistory[0]?.publishedBy || 'admin@daveboostz.com'
    },
    { onConflict: 'version_number' }
  );
  if (versionErr) throw new Error(versionErr.message);

  if (state.tickets.length > 0) {
    await supabase.from('daveboostz_support_tickets').upsert(
      state.tickets.map((t) => ({
        id: t.id,
        user_email: t.userEmail,
        device_info: t.deviceInfo,
        subject: t.subject,
        message: t.message,
        status: t.status,
        admin_reply: t.adminReply || null,
        replied_by: t.adminReply && actorUid ? actorUid : null
      })),
      { onConflict: 'id' }
    );
  }

  if (state.auditLogs[0]) {
    await recordAuditLogToSupabase(state.auditLogs[0], actorUid);
  }
}

export async function uploadImageAssetToStorage(
  blob: Blob,
  fileName: string,
  category: ImageAsset['category'],
  actorUid?: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const storagePath = buildStorageObjectPath(category, fileName);
  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, blob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(SUPABASE_STORAGE_BUCKET).getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;

  await supabase.from('daveboostz_media_assets').upsert(
    {
      id: `img-${Date.now()}`,
      name: fileName,
      category,
      storage_path: storagePath,
      public_url: publicUrl,
      alt_text: fileName,
      size_kb: Math.max(1, Math.round(blob.size / 1024)),
      uploaded_by: actorUid || null
    },
    { onConflict: 'id' }
  );

  return { publicUrl, storagePath };
}

export async function deleteImageAssetFromStorage(storagePath?: string): Promise<void> {
  if (!isSupabaseConfigured || !storagePath) return;
  await supabase.storage.from(SUPABASE_STORAGE_BUCKET).remove([storagePath]);
  await supabase.from('daveboostz_media_assets').delete().eq('storage_path', storagePath);
}

export async function loadRegisteredUsers(): Promise<{
  users: RegisteredUserRecord[];
  source: 'supabase' | 'unconfigured';
}> {
  if (!isSupabaseConfigured) {
    return { users: [], source: 'unconfigured' };
  }

  const { data, error } = await supabase
    .from('daveboostz_users')
    .select('uid, email, display_name, device_model, app_version, status, role, last_active_at, created_at')
    .order('last_active_at', { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  const users: RegisteredUserRecord[] = (data || []).map((row) => ({
    uid: String(row.uid),
    email: String(row.email || 'unknown'),
    displayName: row.display_name ? String(row.display_name) : undefined,
    deviceModel: row.device_model ? String(row.device_model) : undefined,
    appVersion: row.app_version ? String(row.app_version) : undefined,
    status: row.status === 'suspended' ? 'suspended' : 'active',
    role: row.role === 'admin' || row.role === 'beta_tester' ? row.role : 'user',
    lastActiveAt: String(row.last_active_at || row.created_at || ''),
    createdAt: String(row.created_at || '')
  }));

  return { users, source: 'supabase' };
}

export async function updateRegisteredUserAccount(
  uid: string,
  updates: Partial<Pick<RegisteredUserRecord, 'status' | 'role'>>
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('daveboostz_users')
    .update(updates)
    .eq('uid', uid);

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  if (!isSupabaseConfigured) {
    return {
      source: 'unconfigured',
      totalUsers: 0,
      activeUsers7d: 0,
      sessions: [],
      errors: [],
      versionDistribution: [],
      loadedAt: new Date().toISOString()
    };
  }

  const [usersRes, sessionsRes, errorsRes] = await Promise.all([
    supabase.from('daveboostz_users').select('uid, app_version, last_active_at').limit(500),
    supabase
      .from('daveboostz_sessions')
      .select('id, app_version, device_model, android_version, game_package, duration_sec, avg_fps, max_temp_c, shizuku_active, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('daveboostz_error_reports')
      .select('id, app_version, device_model, severity, component, message, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
  ]);

  if (usersRes.error) throw new Error(usersRes.error.message);
  if (sessionsRes.error) throw new Error(sessionsRes.error.message);
  if (errorsRes.error) throw new Error(errorsRes.error.message);

  const userRows = usersRes.data || [];
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let activeUsers7d = 0;
  const versionCounts = new Map<string, number>();

  for (const row of userRows) {
    const lastActive = Date.parse(String(row.last_active_at || ''));
    if (!Number.isNaN(lastActive) && lastActive >= sevenDaysAgo) {
      activeUsers7d++;
    }
    const ver = String(row.app_version || 'unknown');
    versionCounts.set(ver, (versionCounts.get(ver) || 0) + 1);
  }

  const sessions: SessionTelemetryRecord[] = (sessionsRes.data || []).map((row) => ({
    id: String(row.id),
    appVersion: String(row.app_version || 'unknown'),
    deviceModel: row.device_model ? String(row.device_model) : undefined,
    androidVersion: row.android_version ? String(row.android_version) : undefined,
    gamePackage: row.game_package ? String(row.game_package) : undefined,
    durationSec: Number(row.duration_sec || 0),
    avgFps: typeof row.avg_fps === 'number' ? row.avg_fps : null,
    maxTempC: typeof row.max_temp_c === 'number' ? row.max_temp_c : undefined,
    shizukuActive: Boolean(row.shizuku_active),
    createdAt: String(row.created_at || '')
  }));

  const errors: ErrorReportRecord[] = (errorsRes.data || []).map((row) => ({
    id: String(row.id),
    appVersion: String(row.app_version || 'unknown'),
    deviceModel: row.device_model ? String(row.device_model) : undefined,
    severity:
      row.severity === 'fatal' || row.severity === 'warning' ? row.severity : 'error',
    component: row.component ? String(row.component) : undefined,
    message: String(row.message || 'Unspecified error'),
    createdAt: String(row.created_at || '')
  }));

  const versionDistribution = Array.from(versionCounts.entries())
    .map(([version, count]) => ({ version, count }))
    .sort((a, b) => b.count - a.count);

  return {
    source: 'supabase',
    totalUsers: userRows.length,
    activeUsers7d,
    sessions,
    errors,
    versionDistribution,
    loadedAt: new Date().toISOString()
  };
}
