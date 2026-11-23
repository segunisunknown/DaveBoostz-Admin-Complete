import React, { useState } from 'react';
import { MasterState } from '../types';
import { Workflow, History, RotateCcw } from 'lucide-react';

interface WorkflowPreviewProps {
  state: MasterState;
  onPublish: () => void;
  onRollback: (versionNum: number) => void;
}

export const WorkflowPreview: React.FC<WorkflowPreviewProps> = ({ state, onPublish, onRollback }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'home' | 'overlay' | 'dashboard'>('home');

  const isEnabled = (id: string) => state.features.find((f) => f.id === id)?.enabled ?? true;
  const activeGame = state.games[0];

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Workflow className="w-6 h-6 text-red-500" />
            <span>Workflow, Live Preview & Version Control</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Preview text, overlay visibility, branding, and feature states before publishing to the Android app.
          </p>
        </div>
        <button
          type="button"
          onClick={onPublish}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 shrink-0"
        >
          Publish Live v{state.publishedVersionNumber + 1}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => setActivePreviewTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activePreviewTab === 'home' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Game Space
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab('overlay')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activePreviewTab === 'overlay' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Overlay HUD ({state.overlay.masterEnabled ? 'ON' : 'OFF'})
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activePreviewTab === 'dashboard' ? 'bg-red-600 text-white' : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              Feature States
            </button>
          </div>

          <div className="w-full aspect-[16/9] bg-zinc-950 rounded-2xl border-4 border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col">
            <div className="h-9 bg-zinc-900 border-b border-zinc-800 px-4 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
              <div className="flex items-center space-x-2">
                <img
                  src={state.config.logoUrl}
                  alt="Logo"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  className="w-5 h-5 rounded object-cover"
                />
                <span className="font-bold text-red-500">{state.config.appName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-sm bg-amber-400" />
                <span>Basic Mode</span>
              </div>
            </div>

            <div className="flex-1 p-4 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 overflow-y-auto flex flex-col justify-between">
              {activePreviewTab === 'home' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 uppercase tracking-widest">{state.config.tagline}</span>
                    <span className="text-xs font-bold text-red-500">{activeGame?.name || 'Game Library'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      {activeGame && (
                        <img
                          src={activeGame.iconUrl}
                          alt={activeGame.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-sm truncate">{state.content.onboardingTitle}</h4>
                        <p className="text-[11px] text-zinc-400 truncate">{state.content.defaultTip}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold shadow-lg shadow-red-600/30 shrink-0"
                    >
                      {state.content.startBoostButton}
                    </button>
                  </div>
                </div>
              )}

              {activePreviewTab === 'overlay' && (
                <div className="space-y-3">
                  {state.overlay.masterEnabled && isEnabled('overlay_hud') ? (
                    <>
                      <div className="p-3 rounded-xl bg-black/80 border border-red-600/40 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                          <span className="text-white text-xs font-bold">
                            Overlay Active · {state.overlay.miniHudStyle.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-300 font-mono">
                          {state.overlay.fpsEnabled ? 'FPS: Shizuku' : 'FPS Hidden'}
                          {state.overlay.cpuTempEnabled ? ' • 39°C' : ''}
                          {state.overlay.ramOverlayEnabled ? ' • RAM On' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 text-center">
                        Bubble Edge: {state.overlay.defaultBubbleEdge.toUpperCase()} • Opacity: {state.overlay.panelOpacityPercent}% • Center Touch Pass-Through: {state.overlay.touchPassThrough ? 'ON' : 'OFF'}
                      </p>
                    </>
                  ) : (
                    <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-xs text-zinc-400">
                      Overlay System is currently disabled in Admin Panel.
                    </div>
                  )}
                </div>
              )}

              {activePreviewTab === 'dashboard' && (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {state.features.slice(0, 6).map((f) => (
                    <div key={f.id} className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-300 truncate pr-2">{f.name}</span>
                      <span className={f.enabled ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {f.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {state.config.shizukuNoticeEnabled && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300">
                  {state.content.basicModeBanner}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-red-500" />
                <span>Version History & One-Click Rollback</span>
              </h3>
              <span className="text-xs text-red-400 font-bold">Live v{state.publishedVersionNumber}</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {state.versionHistory.map((ver) => (
                <div key={ver.versionNumber} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-bold text-sm">Version #{ver.versionNumber}</span>
                      <span className="text-xs text-zinc-500">{ver.publishedAt}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 truncate">{ver.summary}</p>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Published by {ver.publishedBy}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRollback(ver.versionNumber)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                    <span>Rollback</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
