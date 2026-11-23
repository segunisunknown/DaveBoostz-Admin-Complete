export interface AppConfig {
  appName: string;
  tagline: string;
  launchTagline: string;
  logoUrl: string;
  splashUrl: string;
  accentColor: string;
  secondaryColor: string;
  glowIntensity: string;
  launcherIconAlias: string;
  shizukuDownloadUrl: string;
  shizukuNoticeText: string;
  shizukuNoticeEnabled: boolean;
  appDownloadUrl: string;
  supportEmail: string;
  supportUrl: string;
}

export interface OverlayConfig {
  masterEnabled: boolean;
  bubbleEnabled: boolean;
  panelsEnabled: boolean;
  miniHudEnabled: boolean;
  cpuGaugeEnabled: boolean;
  gpuGaugeEnabled: boolean;
  fpsEnabled: boolean;
  cpuFreqEnabled: boolean;
  cpuTempEnabled: boolean;
  ramOverlayEnabled: boolean;
  touchPassThrough: boolean;
  edgeSnapEnabled: boolean;
  autoStartOnGameLaunch: boolean;
  hideControlsFromRecording: boolean;
  subOverlayVisibleInRecording: boolean;
  crosshairVisibleInRecording: boolean;
  miniHudStyle: 'compact_pill' | 'vertical_stack' | 'horizontal_bar' | 'mini_graph';
  defaultBubbleEdge: 'left' | 'right';
  panelOpacityPercent: number;
  hudScale: number;
  positionLocked: boolean;
  refreshIntervalMs: number;
  highTempThresholdC: number;
  lowFpsThreshold: number;
  lowBatteryThresholdPct: number;
}

export interface ImageAsset {
  id: string;
  name: string;
  category: 'logo' | 'background' | 'banner' | 'icon';
  url: string;
  storagePath?: string;
  altText: string;
  sizeKb: number;
}

export interface GameItem {
  id: string;
  packageName: string;
  name: string;
  iconUrl: string;
  backgroundUrl: string;
  recommendedProfile: 'LOW-END' | 'BALANCED' | 'HIGH-END';
  compatibility: 'WORKS' | 'PARTIAL' | 'NOT_WORKING';
  notes: string;
}

export interface ContentStrings {
  onboardingTitle: string;
  onboardingDesc: string;
  basicModeBanner: string;
  lockedCardMessage: string;
  startBoostButton: string;
  comingSoonText: string;
  defaultTip: string;
  overlayPermissionRationale: string;
  crosshairFairPlayWarning: string;
  maintenanceMessage: string;
}

export type FeatureCategory =
  | 'Overlay & HUD'
  | 'Game Space & AI'
  | 'Boost Engine'
  | 'Pro Tools'
  | 'Network & Hardware'
  | 'Analytics & Settings';

export interface AndroidFeatureItem {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  enabled: boolean;
  percentageRollout: number;
  minVersion: string;
  countries: string[];
  status: 'Implemented' | 'Shizuku Required' | 'Partial / Hardware Bound';
  androidSource: string;
  supportsText: boolean;
  supportsIcon: boolean;
  requiresAndroidIntegration: boolean;
  remoteControllable: boolean;
  lastUpdatedAt?: string;
  limitationReason?: string;
}

export interface AdConfig {
  enabled: boolean;
  globalFrequencyCapMinutes: number;
  testMode: boolean;
  network: string;
  unitIdOpen: string;
  unitIdLaunch: string;
  houseAdEnabled: boolean;
  houseAdImageUrl: string;
  houseAdLink: string;
}

export interface AppRelease {
  minSupportedVersion: string;
  latestVersion: string;
  changelog: string;
  apkUrl: string;
  apkSha256: string;
  forceUpdate: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance';
  startDate: string;
  endDate: string;
  imageUrl?: string;
  linkUrl?: string;
  maintenanceMode: boolean;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  deviceInfo: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  adminReply?: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  role: 'Super Admin' | 'Content Editor' | 'Support Agent';
  addedAt: string;
}

export interface RegisteredUserRecord {
  uid: string;
  email: string;
  displayName?: string;
  deviceModel?: string;
  appVersion?: string;
  status: 'active' | 'suspended';
  role: 'user' | 'beta_tester' | 'admin';
  lastActiveAt: string;
  createdAt: string;
}

export interface SessionTelemetryRecord {
  id: string;
  appVersion: string;
  deviceModel?: string;
  androidVersion?: string;
  gamePackage?: string;
  durationSec: number;
  avgFps?: number | null;
  maxTempC?: number;
  shizukuActive?: boolean;
  createdAt: string;
}

export interface ErrorReportRecord {
  id: string;
  appVersion: string;
  deviceModel?: string;
  severity: 'warning' | 'error' | 'fatal';
  component?: string;
  message: string;
  createdAt: string;
}

export interface AnalyticsSnapshot {
  source: 'supabase' | 'unconfigured';
  totalUsers: number;
  activeUsers7d: number;
  sessions: SessionTelemetryRecord[];
  errors: ErrorReportRecord[];
  versionDistribution: Array<{ version: string; count: number }>;
  loadedAt: string;
}

export interface VersionHistoryItem {
  versionNumber: number;
  publishedAt: string;
  publishedBy: string;
  summary: string;
  snapshot?: Omit<MasterState, 'versionHistory' | 'auditLogs'>;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  details: string;
}

export interface MasterState {
  config: AppConfig;
  overlay: OverlayConfig;
  imageAssets: ImageAsset[];
  games: GameItem[];
  content: ContentStrings;
  features: AndroidFeatureItem[];
  ads: AdConfig;
  release: AppRelease;
  announcements: Announcement[];
  tickets: SupportTicket[];
  adminUsers: AdminUserItem[];
  versionHistory: VersionHistoryItem[];
  auditLogs: AuditLogItem[];
  publishedVersionNumber: number;
  lastPublishedAt: string | null;
  maintenanceMode: boolean;
}
