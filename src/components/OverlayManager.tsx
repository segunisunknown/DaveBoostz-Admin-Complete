import React from 'react';
import { OverlayConfig } from '../types';
import {
  Layers,
  Gauge,
  Cpu,
  Eye,
  Sliders,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Smartphone
} from 'lucide-react';

interface OverlayManagerProps {
  overlay: OverlayConfig;
  onChange: (updated: OverlayConfig) => void;
  disabled?: boolean;
}

export const OverlayManager: React.FC<OverlayManagerProps> = ({ overlay, onChange, disabled }) => {
  const toggle = (key: keyof OverlayConfig) => {
    if (disabled) return;
    onChange({ ...overlay, [key]: !overlay[key] });
  };

  const updateField = <K extends keyof OverlayConfig>(key: K, value: OverlayConfig[K]) => {
    if (disabled) return;
    onChange({ ...overlay, [key]: value });
  };

  const renderSwitch = (
    label: string,
    description: string,
    field: keyof OverlayConfig,
    badge?: string
  ) => {
    const active = Boolean(overlay[field]);
    return (
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-white font-semibold text-sm">{label}</h4>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => toggle(field)}
          disabled={disabled}
          aria-pressed={active}
          className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
            active ? 'bg-red-600' : 'bg-zinc-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
              active ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Layers className="w-6 h-6 text-red-500" />
          <span>Overlay & Floating HUD Management</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Controls the Android single-window WindowManager overlay (`OverlayForegroundService.kt`), FPS/CPU/RAM telemetry, recording visibility, and position presets.
        </p>
      </div>

      {/* Master Switch + Android Permission Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Master Overlay System</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Enables or disables `OverlayForegroundService` (`TYPE_APPLICATION_OVERLAY`) across all games.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle('masterEnabled')}
              disabled={disabled}
              aria-pressed={overlay.masterEnabled}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                overlay.masterEnabled ? 'bg-red-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition duration-200 ${
                  overlay.masterEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Syncs via Supabase PostgreSQL (`daveboostz_config` published payload)</span>
            </div>
            <p className="text-zinc-400">
              When turned OFF and published, the Android service automatically detaches the WindowManager view on its next config update.
            </p>
          </div>
        </div>

        {/* Android Permission & Technical Status */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-red-500" />
            <span>Android Runtime Permission Requirements</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">SYSTEM_ALERT_WINDOW (Display over other apps)</p>
                <p className="text-zinc-400">
                  Checked on-device via `Settings.canDrawOverlays()`. Android forbids granting this remotely; if missing, the app opens Android Settings (`ACTION_MANAGE_OVERLAY_PERMISSION`).
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start space-x-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold">Shizuku 13.1.5 (SurfaceFlinger FPS)</p>
                <p className="text-zinc-400">
                  Real frame-rate stats require Shizuku UserService binding. When Shizuku is unavailable, the overlay displays &ldquo;FPS needs Shizuku&rdquo; instead of fake numbers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Overlay Feature Controls */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Gauge className="w-5 h-5 text-red-500" />
          <span>Individual Overlay Controls</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSwitch('Floating Edge Bubble', 'Draggable bubble docked to screen edge that toggles the Game Space panels.', 'bubbleEnabled')}
          {renderSwitch('Landscape Side Panels', 'RedMagic-style left & right panels with open touch pass-through center.', 'panelsEnabled')}
          {renderSwitch('Sub-Overlay Mini HUD', 'Compact telemetry strip displaying live temperature, RAM, battery, and FPS.', 'miniHudEnabled')}
          {renderSwitch('Auto-Start on Game Launch', 'Automatically launches OverlayForegroundService when user taps Boost & Launch.', 'autoStartOnGameLaunch')}
          {renderSwitch('Touch Pass-Through Center', 'Keeps FLAG_NOT_FOCUSABLE & FLAG_NOT_TOUCH_MODAL so game touches pass through.', 'touchPassThrough')}
          {renderSwitch('Edge Snap & Momentum', 'Snaps floating bubble and Mini HUD smoothly to nearest screen edge.', 'edgeSnapEnabled')}
        </div>
      </div>

      {/* FPS, CPU & RAM Telemetry Configuration */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-red-500" />
          <span>FPS, CPU & RAM Overlay Configuration</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderSwitch('FPS Counter Display', 'Shows real SurfaceFlinger FPS when Shizuku is active.', 'fpsEnabled', 'Shizuku Required')}
          {renderSwitch('CPU Gauge Ring', 'Displays live CPU frequency ring in the left overlay panel.', 'cpuGaugeEnabled')}
          {renderSwitch('GPU Gauge Ring', 'Displays GPU telemetry ring where accessible on device.', 'gpuGaugeEnabled')}
          {renderSwitch('CPU Frequency Readout', 'Reads /sys/devices/system/cpu scaling_cur_freq.', 'cpuFreqEnabled')}
          {renderSwitch('Device Temperature Readout', 'Reads BatteryManager temperature with high-temp color warning.', 'cpuTempEnabled')}
          {renderSwitch('RAM Usage Overlay', 'Reads real used/total RAM from ActivityManager.MemoryInfo.', 'ramOverlayEnabled')}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-zinc-800">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">Sample Interval</label>
            <select
              value={overlay.refreshIntervalMs}
              onChange={(e) => updateField('refreshIntervalMs', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value={500}>500 ms (Fast)</option>
              <option value={1000}>1000 ms (Balanced)</option>
              <option value={2000}>2000 ms (Battery Saver)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">High Temp Warning (°C)</label>
            <input
              type="number"
              min={35}
              max={65}
              value={overlay.highTempThresholdC}
              onChange={(e) => updateField('highTempThresholdC', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">Low FPS Warning</label>
            <input
              type="number"
              min={15}
              max={120}
              value={overlay.lowFpsThreshold}
              onChange={(e) => updateField('lowFpsThreshold', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">Low Battery Alert (%)</label>
            <input
              type="number"
              min={5}
              max={50}
              value={overlay.lowBatteryThresholdPct}
              onChange={(e) => updateField('lowBatteryThresholdPct', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* HUD Visibility & Position / Appearance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Eye className="w-5 h-5 text-red-500" />
            <span>HUD & Recording Visibility</span>
          </h3>
          {renderSwitch('Hide Control UI in Recordings', 'Auto-hides bubble and side panels during MediaProjection recording (default ON).', 'hideControlsFromRecording')}
          {renderSwitch('Mini HUD Visible in Recordings', 'Keeps the telemetry Mini HUD visible in screen recordings by default.', 'subOverlayVisibleInRecording')}
          {renderSwitch('Crosshair Visible in Recordings', 'Keeps Crosshair Studio overlay visible in recordings.', 'crosshairVisibleInRecording')}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <span>Position & Appearance Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">Mini HUD Style</label>
              <select
                value={overlay.miniHudStyle}
                onChange={(e) => updateField('miniHudStyle', e.target.value as OverlayConfig['miniHudStyle'])}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="compact_pill">Compact Pill</option>
                <option value="vertical_stack">Vertical Stack</option>
                <option value="horizontal_bar">Horizontal Bar</option>
                <option value="mini_graph">Mini Graph</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">Default Bubble Edge</label>
              <select
                value={overlay.defaultBubbleEdge}
                onChange={(e) => updateField('defaultBubbleEdge', e.target.value as 'left' | 'right')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="right">Right Edge</option>
                <option value="left">Left Edge</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">
                Panel Opacity ({overlay.panelOpacityPercent}%)
              </label>
              <input
                type="range"
                min={70}
                max={100}
                value={overlay.panelOpacityPercent}
                onChange={(e) => updateField('panelOpacityPercent', Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase mb-2">
                HUD Scale ({overlay.hudScale.toFixed(2)}x)
              </label>
              <input
                type="range"
                min={0.85}
                max={1.25}
                step={0.05}
                value={overlay.hudScale}
                onChange={(e) => updateField('hudScale', Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          </div>

          {renderSwitch('Lock Overlay Position', 'Prevents accidental dragging of the bubble or Mini HUD during gameplay.', 'positionLocked')}
        </div>
      </div>
    </div>
  );
};
