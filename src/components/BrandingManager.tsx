import React from 'react';
import { AppConfig } from '../types';
import { Palette } from 'lucide-react';

interface BrandingManagerProps {
  config: AppConfig;
  onChange: (updated: AppConfig) => void;
}

export const BrandingManager: React.FC<BrandingManagerProps> = ({ config, onChange }) => {
  const handleChange = <K extends keyof AppConfig>(field: K, value: AppConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-red-500" />
          <span>Branding & Theme Configuration</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Manage display identity, hex color accents, lighting intensity, and pre-bundled launcher icon aliases pushed to the Android app.
        </p>
      </div>

      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              App Display Name
            </label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Header Tagline
            </label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Launch Screen Tagline
            </label>
            <input
              type="text"
              value={config.launchTagline}
              onChange={(e) => handleChange('launchTagline', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Primary Accent Color (Hex)
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(config.accentColor) ? config.accentColor : '#ef4444'}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="w-11 h-10 bg-zinc-950 border border-zinc-800 rounded-lg p-1 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={config.accentColor}
                onChange={(e) => handleChange('accentColor', e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5 border-t border-zinc-800/80">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Surface Lighting Intensity
            </label>
            <select
              value={config.glowIntensity}
              onChange={(e) => handleChange('glowIntensity', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="low">Low (Minimal Border Contrast)</option>
              <option value="balanced">Balanced (Subtle Ambient Edge)</option>
              <option value="high">High (Stronger Accent Border)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Pre-bundled Launcher Icon Alias
            </label>
            <select
              value={config.launcherIconAlias}
              onChange={(e) => handleChange('launcherIconAlias', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="DefaultRed">Default Red Emblem</option>
              <option value="CyberNeon">Cyber Accent Variant</option>
              <option value="CarbonBlack">Stealth Carbon Black</option>
              <option value="GoldEdition">Tournament Gold</option>
            </select>
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Maps cleanly to Android manifest `activity-alias` entries pre-compiled inside the APK.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingManager;
