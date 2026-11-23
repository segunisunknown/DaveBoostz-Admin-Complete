import React, { useState } from 'react';
import { AnalyticsSnapshot, MasterState } from '../types';
import {
  Gamepad2,
  ToggleLeft,
  Download,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Layers,
  Users,
  Smartphone,
  FileCode
} from 'lucide-react';

interface DashboardProps {
  state: MasterState;
  analytics: AnalyticsSnapshot | null;
  analyticsLoading: boolean;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  analytics,
  analyticsLoading,
  setActiveTab
}) => {
  const [zipBusy, setZipBusy] = useState<'android' | 'admin' | 'workflow' | null>(null);
  const [zipFeedback, setZipFeedback] = useState<string | null>(null);

  const handleQuickZip = async (target: 'android' | 'admin' | 'android-yml' | 'admin-yml') => {
    setZipBusy(target === 'android' || target === 'admin' ? target : 'workflow');
    setZipFeedback(null);
    try {
      const exporter = await import('../utils/zipExporter');
      if (target === 'android') {
        const count = await exporter.downloadAndroidRepoZip();
        setZipFeedback(`Downloaded DaveBoostz-Android.zip (${count} files).`);
      } else if (target === 'admin') {
        const count = await exporter.downloadAdminRepoZip();
        setZipFeedback(`Downloaded DaveBoostz-Admin.zip (${count} files).`);
      } else if (target === 'android-yml') {
        exporter.downloadAndroidWorkflowYml();
        setZipFeedback('Downloaded android-ci.yml (.github/workflows/android-ci.yml).');
      } else {
        exporter.downloadAdminWorkflowYml();
        setZipFeedback('Downloaded ci.yml (.github/workflows/ci.yml).');
      }
    } catch (err: unknown) {
      setZipFeedback(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setZipBusy(null);
    }
  };
  const activeFeaturesCount = state.features.filter((f) => f.enabled).length;
  const controllableCount = state.features.filter((f) => f.remoteControllable).length;
  const openTicketsCount = state.tickets.filter((t) => t.status === 'open').length;

  const isSupabaseLive = analytics?.source === 'supabase';
  const totalUsersDisplay = analyticsLoading
    ? '...'
    : isSupabaseLive
    ? String(analytics.totalUsers)
    : '0';
  const activeUsersDisplay = analyticsLoading
    ? '...'
    : isSupabaseLive
    ? `${analytics.activeUsers7d} active (7d)`
    : 'Connect Supabase to measure';

  return (
    <div className="w-full space-y-6">
      {/* Primary Overview Header Card */}
      <div className="rounded-xl bg-[#111115] border border-zinc-800/90 p-6 md:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2 tabular-nums">
            <span className="text-red-400 font-medium">DaveBoostz Control Center</span>
            <span aria-hidden="true">·</span>
            <span>{state.features.length} registered modules</span>
            <span aria-hidden="true">·</span>
            <span>Revision #{state.publishedVersionNumber}</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
            {state.config.appName} Production Overview
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Central management for the Android application configuration, WindowManager HUD bounds, feature rollout switches, release integrity hashes, and administrative audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overlay')}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overlay Controls</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>Feature Registry</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('downloads')}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>ZIP Downloads</span>
          </button>
        </div>
      </div>

      {/* Direct Repository ZIP Export Bar */}
      <div className="rounded-xl bg-[#111115] border border-zinc-800/90 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-white">Separated Repository &amp; Workflow Downloads</h2>
          <p className="text-xs text-zinc-400">
            {zipFeedback || 'Download DaveBoostz-Android.zip, DaveBoostz-Admin.zip, or individual CI workflow files directly.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleQuickZip('android')}
            disabled={zipBusy !== null}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors inline-flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{zipBusy === 'android' ? 'Packaging Android ZIP...' : 'Download DaveBoostz-Android.zip'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickZip('admin')}
            disabled={zipBusy !== null}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors inline-flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{zipBusy === 'admin' ? 'Packaging Admin ZIP...' : 'Download DaveBoostz-Admin.zip'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickZip('android-yml')}
            disabled={zipBusy !== null}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>android-ci.yml</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickZip('admin-yml')}
            disabled={zipBusy !== null}
            className="px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>ci.yml</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Real counts only — never fabricated) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className="text-left bg-[#111115] border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">{totalUsersDisplay}</div>
          <div className="text-xs text-zinc-500 mt-1 truncate">{activeUsersDisplay}</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('features')}
          className="text-left bg-[#111115] border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Feature Availability</span>
            <ToggleLeft className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">
            {activeFeaturesCount}/{state.features.length}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            {controllableCount} remotely controllable
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overlay')}
          className="text-left bg-[#111115] border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Overlay System</span>
            <Layers className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {state.overlay.masterEnabled ? 'Enabled' : 'Disabled'}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {state.overlay.miniHudStyle.replace('_', ' ')} · {state.overlay.refreshIntervalMs}ms
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('games')}
          className="text-left bg-[#111115] border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Game Catalog & Support</span>
            <Gamepad2 className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">{state.games.length}</div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">{openTicketsCount} open tickets</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('updates')}
          className="text-left bg-[#111115] border border-zinc-800/90 rounded-xl p-5 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-zinc-400 font-medium">Android Release</span>
            <Download className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-white tabular-nums font-mono">
            v{state.release.latestVersion}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            Min v{state.release.minSupportedVersion}
          </div>
        </button>
      </div>

      {/* System Health & Recent Administrative Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>System Health & Configuration</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              View Analytics
            </button>
          </div>

          <div className="divide-y divide-zinc-800/80 text-sm">
            <div className="flex justify-between py-3">
              <span className="text-zinc-400">Supabase Backend</span>
              <span className={isSupabaseLive ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {isSupabaseLive ? 'Connected (Postgres + Auth + Storage)' : 'Local Preview Mode'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-zinc-400">App Display Name</span>
              <span className="text-zinc-100 font-medium">{state.config.appName}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-zinc-400">Recorded Telemetry Sessions</span>
              <span className="text-zinc-100 font-mono tabular-nums">
                {isSupabaseLive ? analytics.sessions.length : '0 (No Supabase stream)'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-zinc-400">Maintenance Mode</span>
              <span className={state.maintenanceMode ? 'text-red-400 font-semibold' : 'text-emerald-400 font-medium'}>
                {state.maintenanceMode ? 'ACTIVE' : 'Normal'}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-zinc-400">Published Config Revision</span>
              <span className="text-zinc-100 font-mono tabular-nums">
                #{state.publishedVersionNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" />
              <span>Recent Administrative Activity</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('workflow')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Full Audit Log
            </button>
          </div>

          {state.auditLogs.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500">
              No administrative actions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {state.auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs gap-2 mb-1">
                    <span className="font-mono font-medium text-red-400">{log.action}</span>
                    <span className="text-zinc-500 font-mono tabular-nums">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{log.details}</p>
                  <div className="text-[11px] text-zinc-500 mt-1">Actor: {log.adminEmail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
