import React from 'react';
import { AnalyticsSnapshot, MasterState } from '../types';
import { BarChart3, RefreshCw, AlertTriangle, Activity, Smartphone, Layers } from 'lucide-react';

interface AnalyticsManagerProps {
  state: MasterState;
  analytics: AnalyticsSnapshot | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AnalyticsManager: React.FC<AnalyticsManagerProps> = ({
  state,
  analytics,
  loading,
  onRefresh
}) => {
  const isLive = analytics?.source === 'supabase';
  const sessions = analytics?.sessions || [];
  const errors = analytics?.errors || [];
  const versionDist = analytics?.versionDistribution || [];

  const avgDurationSec =
    sessions.length > 0
      ? Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / sessions.length)
      : null;

  const fpsSamples = sessions.map((s) => s.avgFps).filter((v): v is number => typeof v === 'number');
  const meanMeasuredFps =
    fpsSamples.length > 0
      ? Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length)
      : null;

  const shizukuSessionsCount = sessions.filter((s) => s.shizukuActive).length;
  const totalFeaturesEnabled = state.features.filter((f) => f.enabled).length;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-red-500" />
            <span>Analytics & Real Telemetry</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Displays genuine user activity, opt-in Android session logs, version distribution, and crash reports from Supabase PostgreSQL. Zero fabricated numbers.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors disabled:opacity-50 self-start whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {!isLive && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-xs text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <div className="font-semibold text-amber-200">Supabase Telemetry Disconnected (Local Preview Mode)</div>
            <p className="text-amber-300/80 mt-0.5">
              Configure <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> and set <code className="font-mono">SUPABASE_URL</code> / <code className="font-mono">SUPABASE_ANON_KEY</code> in the Android build to inspect live user sessions, version adoption, and error reports.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5">
          <div className="text-xs text-zinc-400">Active Users (7 Days)</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {isLive ? analytics.activeUsers7d : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            {isLive ? `Out of ${analytics.totalUsers} total` : 'No Supabase stream'}
          </div>
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5">
          <div className="text-xs text-zinc-400">Recorded Gaming Sessions</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {isLive ? sessions.length : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            {avgDurationSec !== null ? `Avg ${Math.round(avgDurationSec / 60)}m ${avgDurationSec % 60}s` : 'No sessions logged yet'}
          </div>
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5">
          <div className="text-xs text-zinc-400">Shizuku Verified FPS</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {meanMeasuredFps !== null ? `${meanMeasuredFps} FPS` : '—'}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            {fpsSamples.length > 0
              ? `${shizukuSessionsCount}/${sessions.length} Shizuku sessions`
              : 'Requires Shizuku opt-in session'}
          </div>
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5">
          <div className="text-xs text-zinc-400">Feature Rollout Readiness</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-2">
            {totalFeaturesEnabled}/{state.features.length}
          </div>
          <div className="text-xs text-zinc-500 mt-1 tabular-nums">
            {errors.length} error reports logged
          </div>
        </div>
      </div>

      {/* App Version Distribution & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-red-500" />
            <span>App Version Distribution</span>
          </h2>

          {versionDist.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No client version records collected yet in <code className="font-mono text-zinc-400">daveboostz_users</code>.
            </div>
          ) : (
            <div className="space-y-3">
              {versionDist.map((item) => {
                const pct = analytics && analytics.totalUsers > 0
                  ? Math.round((item.count / analytics.totalUsers) * 100)
                  : 0;
                return (
                  <div key={item.version} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-zinc-200">v{item.version}</span>
                      <span className="font-mono tabular-nums text-zinc-400">
                        {item.count} users · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-red-500" />
            <span>Feature Availability Breakdown</span>
          </h2>
          <div className="divide-y divide-zinc-800/80 text-xs">
            {[
              'Overlay & HUD',
              'Game Space & AI',
              'Boost Engine',
              'Pro Tools',
              'Network & Hardware',
              'Analytics & Settings'
            ].map((cat) => {
              const items = state.features.filter((f) => f.category === cat);
              const enabled = items.filter((f) => f.enabled).length;
              return (
                <div key={cat} className="py-2.5 flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">{cat}</span>
                  <span className="font-mono tabular-nums text-zinc-400">
                    {enabled} / {items.length} active
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gaming Sessions & Error Reports Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-red-500" />
            <span>Recent Opt-In Gaming Sessions</span>
          </h2>
          {sessions.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No opt-in session telemetry recorded in <code className="font-mono text-zinc-400">daveboostz_sessions</code>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">Game / Device</th>
                    <th className="py-2 px-3 font-medium text-right">Duration</th>
                    <th className="py-2 px-3 font-medium text-right">Avg FPS</th>
                    <th className="py-2 pl-3 font-medium text-right">Temp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {sessions.slice(0, 10).map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-3">
                        <div className="text-zinc-200 font-medium truncate max-w-[180px]">
                          {s.gamePackage || 'Session'}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {s.deviceModel || 'Android'} · v{s.appVersion}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-zinc-300">
                        {Math.round(s.durationSec / 60)}m
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-zinc-300">
                        {s.avgFps ? `${s.avgFps}` : 'N/A'}
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-zinc-300">
                        {s.maxTempC ? `${s.maxTempC.toFixed(1)}°C` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>Client Error Reports</span>
          </h2>
          {errors.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No client errors reported in <code className="font-mono text-zinc-400">daveboostz_error_reports</code>.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {errors.slice(0, 8).map((err) => (
                <div key={err.id} className="py-3 first:pt-0 last:pb-0 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={err.severity === 'fatal' ? 'text-red-400 font-semibold' : 'text-amber-400 font-medium'}>
                      {err.severity.toUpperCase()} · {err.component || 'Core'}
                    </span>
                    <span className="font-mono tabular-nums text-zinc-500">
                      v{err.appVersion} · {err.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-mono text-[11px] break-all">{err.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
