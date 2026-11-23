import { MasterState } from './types';
import { ALL_ANDROID_FEATURES } from './featureRegistry';

const EMBLEM_IMG = '/src/assets/images/daveboostz_emblem_1795339300790.jpg';
const ARENA_BG = '/src/assets/images/arena_battlefield_bg_1795339301167.jpg';
const HANGAR_BG = '/src/assets/images/cyber_shooter_bg_1795339300748.jpg';
const RETICLE_ICON = '/src/assets/images/game_icon_badge_1795339301121.jpg';

export const initialMasterState: MasterState = {
  config: {
    appName: 'DaveBoostz',
    tagline: 'Precision Android Gaming Control',
    launchTagline: 'Engineered for Stable Frame Pacing',
    logoUrl: EMBLEM_IMG,
    splashUrl: ARENA_BG,
    accentColor: '#ef4444',
    secondaryColor: '#18181b',
    glowIntensity: 'balanced',
    launcherIconAlias: 'DefaultRed',
    shizukuDownloadUrl: 'https://shizuku.rikka.app/download/',
    shizukuNoticeText:
      'Connect Shizuku for surface latency FPS sampling, standby bucket tuning, and allowlisted force-stop actions.',
    shizukuNoticeEnabled: true,
    appDownloadUrl: 'https://github.com/daveboostz/app/releases/latest',
    supportEmail: 'support@daveboostz.com',
    supportUrl: 'https://daveboostz.com/support'
  },
  overlay: {
    masterEnabled: true,
    bubbleEnabled: true,
    panelsEnabled: true,
    miniHudEnabled: true,
    cpuGaugeEnabled: true,
    gpuGaugeEnabled: true,
    fpsEnabled: true,
    cpuFreqEnabled: true,
    cpuTempEnabled: true,
    ramOverlayEnabled: true,
    touchPassThrough: true,
    edgeSnapEnabled: true,
    autoStartOnGameLaunch: true,
    hideControlsFromRecording: true,
    subOverlayVisibleInRecording: true,
    crosshairVisibleInRecording: true,
    miniHudStyle: 'compact_pill',
    defaultBubbleEdge: 'right',
    panelOpacityPercent: 92,
    hudScale: 1.0,
    positionLocked: false,
    refreshIntervalMs: 1000,
    highTempThresholdC: 44,
    lowFpsThreshold: 40,
    lowBatteryThresholdPct: 15
  },
  imageAssets: [
    {
      id: 'img-1',
      name: 'DaveBoostz Emblem Logo',
      category: 'logo',
      url: EMBLEM_IMG,
      altText: 'DaveBoostz metallic crimson emblem',
      sizeKb: 92
    },
    {
      id: 'img-2',
      name: 'Esports Arena Backdrop',
      category: 'background',
      url: ARENA_BG,
      altText: 'Dark esports arena stage backdrop',
      sizeKb: 148
    },
    {
      id: 'img-3',
      name: 'Tactical Hangar Backdrop',
      category: 'background',
      url: HANGAR_BG,
      altText: 'Architectural tactical hangar corridor backdrop',
      sizeKb: 136
    },
    {
      id: 'img-4',
      name: 'Crosshair Studio Icon',
      category: 'icon',
      url: RETICLE_ICON,
      altText: 'Precision tactical crosshair reticle badge',
      sizeKb: 84
    }
  ],
  games: [
    {
      id: 'game-1',
      packageName: 'com.tencent.ig',
      name: 'PUBG MOBILE',
      iconUrl: RETICLE_ICON,
      backgroundUrl: ARENA_BG,
      recommendedProfile: 'HIGH-END',
      compatibility: 'WORKS',
      notes: 'Uses display-supported refresh rate target with thermal guardrails.'
    },
    {
      id: 'game-2',
      packageName: 'com.dts.freefireth',
      name: 'Free Fire MAX',
      iconUrl: EMBLEM_IMG,
      backgroundUrl: HANGAR_BG,
      recommendedProfile: 'BALANCED',
      compatibility: 'WORKS',
      notes: 'Balanced profile recommended for sustained thermal stability.'
    },
    {
      id: 'game-3',
      packageName: 'com.activision.callofduty.shooter',
      name: 'Call of Duty: Mobile',
      iconUrl: RETICLE_ICON,
      backgroundUrl: HANGAR_BG,
      recommendedProfile: 'HIGH-END',
      compatibility: 'WORKS',
      notes: 'Supports priority notification filtering and Mini HUD overlay.'
    }
  ],
  content: {
    onboardingTitle: 'Welcome to DaveBoostz',
    onboardingDesc:
      'Monitor real device telemetry, manage background app behavior safely, and configure your floating gaming HUD.',
    basicModeBanner:
      'Basic mode is active because Shizuku is not connected. Hardware telemetry, background app cleanup, and DND remain available; connect Shizuku for SurfaceFlinger FPS sampling and force-stop.',
    lockedCardMessage: 'Requires Shizuku authorization',
    startBoostButton: 'Boost and Launch',
    comingSoonText: 'Scheduled for next release',
    defaultTip: 'Close unused background apps before starting long gaming sessions.',
    overlayPermissionRationale:
      'DaveBoostz requires Display over other apps permission to render the floating HUD and crosshair above games.',
    crosshairFairPlayWarning:
      'Fair-Play Notice: Check game terms of service before enabling visual crosshair overlays in competitive matches.',
    maintenanceMessage:
      'Remote cloud synchronization is undergoing scheduled maintenance. Local profiles and monitoring continue operating offline.'
  },
  features: ALL_ANDROID_FEATURES.map((f) => ({ ...f, lastUpdatedAt: '2026-11-22' })),
  ads: {
    enabled: false,
    globalFrequencyCapMinutes: 30,
    testMode: true,
    network: 'AdMob',
    unitIdOpen: 'ca-app-pub-3940256099942544/1033173712',
    unitIdLaunch: 'ca-app-pub-3940256099942544/5354046379',
    houseAdEnabled: false,
    houseAdImageUrl: ARENA_BG,
    houseAdLink: 'https://daveboostz.com'
  },
  release: {
    minSupportedVersion: '1.0.0',
    latestVersion: '2.0.0',
    changelog:
      '• Multi-screen Material 3 dark obsidian UI (Dashboard, Games, Monitor, System, Settings)\n• Real CPU per-core clock, RAM, thermal, and ConnectivityManager latency monitoring\n• Room-backed session recorder and Crosshair Studio overlay\n• Validated Supabase PostgreSQL remote config with offline cache',
    apkUrl: 'https://github.com/daveboostz/app/releases/download/v2.0.0/daveboostz-v2.0.0.apk',
    apkSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    forceUpdate: false
  },
  announcements: [
    {
      id: 'ann-1',
      title: 'DaveBoostz v2.0.0 Production Release',
      message: 'Upgraded hardware telemetry, Crosshair Studio, and validated Supabase sync are live.',
      type: 'info',
      startDate: '2026-11-01',
      endDate: '2026-12-31',
      maintenanceMode: false
    }
  ],
  tickets: [
    {
      id: 'tick-1',
      userEmail: 'player.demo@example.com',
      deviceInfo: 'Android 14 · Sample Seed Entry',
      subject: 'Shizuku wireless debugging setup',
      message: 'Where can I enable wireless debugging to pair Shizuku safely?',
      status: 'open',
      createdAt: '2026-11-20 14:32',
      adminReply: 'Open Developer Options > Wireless Debugging, pair in Shizuku, then tap Check Shizuku in System.'
    }
  ],
  adminUsers: [
    {
      id: 'admin-1',
      email: 'admin@daveboostz.com',
      role: 'Super Admin',
      addedAt: '2026-11-01'
    }
  ],
  versionHistory: [
    {
      versionNumber: 4,
      publishedAt: '2026-11-22 01:00',
      publishedBy: 'admin@daveboostz.com',
      summary: 'DaveBoostz v2.0.0 initial baseline with 24-feature registry and validated overlay bounds.'
    }
  ],
  auditLogs: [
    {
      id: 'log-1',
      timestamp: '2026-11-22 01:00',
      adminEmail: 'admin@daveboostz.com',
      action: 'INITIALIZE_BASELINE',
      details: 'Baseline configuration initialized for DaveBoostz v2.0.0.'
    }
  ],
  publishedVersionNumber: 4,
  lastPublishedAt: '2026-11-22 01:00',
  maintenanceMode: false
};
