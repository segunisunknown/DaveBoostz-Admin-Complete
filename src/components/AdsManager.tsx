import React from 'react';
import { AdConfig } from '../types';
import { Megaphone } from 'lucide-react';

interface AdsManagerProps {
  ads: AdConfig;
  onChange: (updated: AdConfig) => void;
}

export const AdsManager: React.FC<AdsManagerProps> = ({ ads, onChange }) => {
  const handleChange = (field: keyof AdConfig, value: any) => {
    onChange({ ...ads, [field]: value });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <Megaphone className="w-6 h-6 text-red-500" />
          <span>Ads & Monetisation Configuration</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Optional ads (off by default). Configures frequency caps, test mode, timeouts (never blocking game launch), and house ads.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <div>
            <h4 className="text-white font-semibold text-sm">Global Ads Master Switch</h4>
            <p className="text-xs text-zinc-400">Controls whether ads are loaded in the Android app.</p>
          </div>
          <button
            onClick={() => handleChange('enabled', !ads.enabled)}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              ads.enabled ? 'bg-red-600' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                ads.enabled ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Ad Network
            </label>
            <select
              value={ads.network}
              onChange={(e) => handleChange('network', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            >
              <option value="AdMob">Google AdMob</option>
              <option value="AppLovin">AppLovin MAX</option>
              <option value="UnityAds">Unity Ads</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Global Frequency Cap (Minutes)
            </label>
            <input
              type="number"
              value={ads.globalFrequencyCapMinutes}
              onChange={(e) => handleChange('globalFrequencyCapMinutes', Number(e.target.value))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Ad Unit ID (First App Open)
            </label>
            <input
              type="text"
              value={ads.unitIdOpen}
              onChange={(e) => handleChange('unitIdOpen', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Ad Unit ID (Tap Launch / Boost)
            </label>
            <input
              type="text"
              value={ads.unitIdLaunch}
              onChange={(e) => handleChange('unitIdLaunch', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Safety rule: If ad fails or takes &gt;3s, it skips instantly so game launch is never stuck.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold text-sm">House Ad / Cross Promotion</h4>
              <p className="text-xs text-zinc-400">Promotes DaveBoostz Pro when external ads fail.</p>
            </div>
            <button
              onClick={() => handleChange('houseAdEnabled', !ads.houseAdEnabled)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                ads.houseAdEnabled ? 'bg-red-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  ads.houseAdEnabled ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="url"
              placeholder="House Ad Image URL"
              value={ads.houseAdImageUrl}
              onChange={(e) => handleChange('houseAdImageUrl', e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
            <input
              type="url"
              placeholder="House Ad Target URL"
              value={ads.houseAdLink}
              onChange={(e) => handleChange('houseAdLink', e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
