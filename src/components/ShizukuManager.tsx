import React from 'react';
import { AppConfig } from '../types';
import { Shield, ExternalLink, CheckCircle } from 'lucide-react';

interface ShizukuManagerProps {
  config: AppConfig;
  onChange: (updated: AppConfig) => void;
}

export const ShizukuManager: React.FC<ShizukuManagerProps> = ({ config, onChange }) => {
  const handleChange = (field: keyof AppConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Shield className="w-6 h-6 text-red-500" />
          <span>Shizuku & External Links Configuration</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Configure Shizuku download URLs, companion notices, and support channels.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Shizuku Download URL (HTTPS only, allowlisted)
          </label>
          <div className="flex space-x-3">
            <input
              type="url"
              value={config.shizukuDownloadUrl}
              onChange={(e) => handleChange('shizukuDownloadUrl', e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
            <a
              href={config.shizukuDownloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center space-x-2 text-sm font-semibold"
            >
              <span>Test Link</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Basic Mode Notice Text (Banner shown when Shizuku is disconnected)
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.shizukuNoticeEnabled}
                onChange={(e) => handleChange('shizukuNoticeEnabled', e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded bg-zinc-950 border-zinc-800"
              />
              <span className="text-xs text-zinc-300">Enable Notice Banner</span>
            </label>
          </div>
          <textarea
            rows={3}
            value={config.shizukuNoticeText}
            onChange={(e) => handleChange('shizukuNoticeText', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              DaveBoostz APK Release URL
            </label>
            <input
              type="url"
              value={config.appDownloadUrl}
              onChange={(e) => handleChange('appDownloadUrl', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
