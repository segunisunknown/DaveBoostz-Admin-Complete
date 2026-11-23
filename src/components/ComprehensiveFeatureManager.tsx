import React, { useState } from 'react';
import { AndroidFeatureItem } from '../types';
import { Layers, Search, Lock } from 'lucide-react';

interface ComprehensiveFeatureManagerProps {
  features: AndroidFeatureItem[];
  onChange: (updated: AndroidFeatureItem[]) => void;
  disabled?: boolean;
}

export const ComprehensiveFeatureManager: React.FC<ComprehensiveFeatureManagerProps> = ({
  features,
  onChange,
  disabled
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hookFilter, setHookFilter] = useState<'all' | 'wired' | 'hook'>('all');

  const categories = [
    'ALL',
    'Overlay & HUD',
    'Game Space & AI',
    'Boost Engine',
    'Pro Tools',
    'Network & Hardware',
    'Analytics & Settings'
  ];

  const todayIso = new Date().toISOString().split('T')[0];

  const handleToggle = (id: string) => {
    if (disabled) return;
    onChange(
      features.map((f) =>
        f.id === id && f.remoteControllable
          ? { ...f, enabled: !f.enabled, lastUpdatedAt: todayIso }
          : f
      )
    );
  };

  const handleRolloutChange = (id: string, val: number) => {
    if (disabled) return;
    onChange(
      features.map((f) =>
        f.id === id ? { ...f, percentageRollout: val, lastUpdatedAt: todayIso } : f
      )
    );
  };

  const handleToggleModuleHook = (id: string) => {
    if (disabled) return;
    onChange(
      features.map((f) =>
        f.id === id
          ? { ...f, requiresAndroidIntegration: !f.requiresAndroidIntegration, lastUpdatedAt: todayIso }
          : f
      )
    );
  };

  const filteredFeatures = features.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.androidSource.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    const matchesHook =
      hookFilter === 'all' ||
      (hookFilter === 'wired' && !f.requiresAndroidIntegration) ||
      (hookFilter === 'hook' && f.requiresAndroidIntegration);
    return matchesSearch && matchesCategory && matchesHook;
  });

  const controllableCount = features.filter((f) => f.remoteControllable).length;
  const activeCount = features.filter((f) => f.enabled).length;
  const shizukuCount = features.filter((f) => f.status === 'Shizuku Required').length;
  const restrictedCount = features.filter((f) => !f.remoteControllable).length;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-red-500" />
          <span>Central Feature Registry ({features.length} Modules)</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Synchronized 1:1 with <code className="font-mono text-zinc-300">FeatureRegistry.kt</code>. Every toggle persists to Supabase draft and publishes to <code className="font-mono text-zinc-300">daveboostz_config.payload_json</code>.
        </p>
      </div>

      {/* Inventory Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1">Registered Modules</span>
          <span className="text-2xl font-bold text-white font-mono tabular-nums">{features.length}</span>
        </div>
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1">Active / Remote</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            {activeCount} / {controllableCount}
          </span>
        </div>
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1">Shizuku Required</span>
          <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{shizukuCount}</span>
        </div>
        <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1">OS Read-Only</span>
          <span className="text-2xl font-bold text-zinc-300 font-mono tabular-nums">{restrictedCount}</span>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3 bg-[#111115] border border-zinc-800/90 p-4 rounded-xl">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search feature name, key, or Kotlin source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg self-start">
            {(
              [
                ['all', 'All Hooks'],
                ['wired', 'Live Wired'],
                ['hook', 'Module Hook']
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setHookFilter(val)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  hookFilter === val ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Features List */}
      {filteredFeatures.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 bg-[#111115] border border-dashed border-zinc-800 rounded-xl">
          No features match the current search or category filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredFeatures.map((feat) => (
            <div
              key={feat.id}
              className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="font-medium text-zinc-300">{feat.category}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={
                        feat.status === 'Implemented'
                          ? 'text-emerald-400'
                          : feat.status === 'Shizuku Required'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }
                    >
                      {feat.status}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Min v{feat.minVersion}</span>
                  </div>
                  <span className="font-mono text-zinc-500">{feat.id}</span>
                </div>

                <h3 className="text-white font-semibold text-base">{feat.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
                <div className="text-[11px] font-mono text-zinc-500 flex flex-wrap items-center gap-2">
                  <span>{feat.androidSource}</span>
                  {feat.lastUpdatedAt && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">Updated {feat.lastUpdatedAt}</span>
                    </>
                  )}
                </div>

                {feat.limitationReason && (
                  <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                    {feat.limitationReason}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span>Text: {feat.supportsText ? 'Yes' : 'No'}</span>
                  <span aria-hidden="true">·</span>
                  <span>Icon: {feat.supportsIcon ? 'Yes' : 'No'}</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleToggleModuleHook(feat.id)}
                    className={`underline decoration-dotted underline-offset-2 transition-colors ${
                      feat.requiresAndroidIntegration ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                    title="Toggle Module Hook status"
                  >
                    {feat.requiresAndroidIntegration ? 'Module Hook' : 'Live Wired'}
                  </button>
                </div>

                {feat.remoteControllable ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-zinc-400 font-mono tabular-nums w-9 text-right">
                        {feat.percentageRollout}%
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={feat.percentageRollout}
                        disabled={disabled}
                        onChange={(e) => handleRolloutChange(feat.id, Number(e.target.value))}
                        className="w-16 accent-red-600 cursor-pointer"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(feat.id)}
                      disabled={disabled}
                      aria-pressed={feat.enabled}
                      aria-label={`Toggle ${feat.name}`}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 focus:outline-none disabled:opacity-50 ${
                        feat.enabled ? 'bg-red-600' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-150 ${
                          feat.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Lock className="w-3.5 h-3.5" />
                    <span>OS Read-Only</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComprehensiveFeatureManager;
