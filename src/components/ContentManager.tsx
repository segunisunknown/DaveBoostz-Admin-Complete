import React from 'react';
import { ContentStrings } from '../types';
import { initialMasterState } from '../initialData';
import { FileText, RotateCcw } from 'lucide-react';

interface ContentManagerProps {
  content: ContentStrings;
  onChange: (updated: ContentStrings) => void;
  onRestorePrevious?: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  content,
  onChange,
  onRestorePrevious
}) => {
  const handleChange = (field: keyof ContentStrings, value: string) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <FileText className="w-6 h-6 text-red-500" />
            <span>App Text & Content Management</span>
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Edit every string displayed in the Android app (onboarding, Basic mode banner, overlay rationale, crosshair warning, buttons, and maintenance notice).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRestorePrevious && (
            <button
              type="button"
              onClick={onRestorePrevious}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restore Published Text</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onChange(initialMasterState.content)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-500" />
            <span>Default Copy</span>
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Onboarding Title
            </label>
            <input
              type="text"
              value={content.onboardingTitle}
              onChange={(e) => handleChange('onboardingTitle', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Start Boost Button Label
            </label>
            <input
              type="text"
              value={content.startBoostButton}
              onChange={(e) => handleChange('startBoostButton', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Onboarding Description
          </label>
          <textarea
            rows={2}
            value={content.onboardingDesc}
            onChange={(e) => handleChange('onboardingDesc', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Basic Mode Banner Text (Shown when Shizuku is missing)
          </label>
          <textarea
            rows={3}
            value={content.basicModeBanner}
            onChange={(e) => handleChange('basicModeBanner', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Overlay Permission Explanation
            </label>
            <textarea
              rows={2}
              value={content.overlayPermissionRationale}
              onChange={(e) => handleChange('overlayPermissionRationale', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Crosshair Fair-Play Warning
            </label>
            <textarea
              rows={2}
              value={content.crosshairFairPlayWarning}
              onChange={(e) => handleChange('crosshairFairPlayWarning', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Locked Card Message
            </label>
            <input
              type="text"
              value={content.lockedCardMessage}
              onChange={(e) => handleChange('lockedCardMessage', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Default Tips Ticker Text
            </label>
            <input
              type="text"
              value={content.defaultTip}
              onChange={(e) => handleChange('defaultTip', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Unfinished Area Label
            </label>
            <input
              type="text"
              value={content.comingSoonText}
              onChange={(e) => handleChange('comingSoonText', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
            Maintenance Mode Message
          </label>
          <textarea
            rows={2}
            value={content.maintenanceMessage}
            onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
