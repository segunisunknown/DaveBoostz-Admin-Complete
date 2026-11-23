import React from 'react';
import { CloudUpload, RefreshCw, Menu, Save, Package } from 'lucide-react';

interface HeaderProps {
  activeTabLabel: string;
  onPublish: () => void;
  onSaveDraft: () => void;
  isPublishing: boolean;
  isSaving: boolean;
  publishedVersion: number;
  lastPublishedAt: string | null;
  hasUnsavedChanges: boolean;
  onResetToDefaults: () => void;
  onOpenSidebar: () => void;
  onOpenDownloads: () => void;
  supabaseConnected: boolean;
  appVersion: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTabLabel,
  onPublish,
  onSaveDraft,
  isPublishing,
  isSaving,
  publishedVersion,
  lastPublishedAt,
  hasUnsavedChanges,
  onResetToDefaults,
  onOpenSidebar,
  onOpenDownloads,
  supabaseConnected,
  appVersion
}) => {
  return (
    <header className="h-16 bg-[#0B0B0F] border-b border-zinc-800/90 px-4 md:px-6 flex items-center justify-between shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 lg:hidden shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-white truncate">
            <span className="text-zinc-500 hidden sm:inline">Control Center</span>
            <span className="text-zinc-600 hidden sm:inline" aria-hidden="true">/</span>
            <span className="truncate">{activeTabLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 truncate mt-0.5 tabular-nums">
            <span>v{appVersion}</span>
            <span aria-hidden="true">·</span>
            <span>Revision #{publishedVersion}</span>
            {lastPublishedAt && (
              <>
                <span className="hidden md:inline" aria-hidden="true">·</span>
                <span className="hidden md:inline">{lastPublishedAt}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span className={supabaseConnected ? 'text-emerald-400' : 'text-amber-400'}>
              {supabaseConnected ? 'Supabase Live' : 'Local Preview'}
            </span>
            {hasUnsavedChanges && (
              <>
                <span className="hidden xl:inline" aria-hidden="true">·</span>
                <span className="hidden xl:inline text-amber-400">Draft modified</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenDownloads}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors whitespace-nowrap shrink-0"
          title="Open ZIP Downloads (Android & Admin)"
        >
          <Package className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">ZIPs</span>
        </button>

        <button
          type="button"
          onClick={onResetToDefaults}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors whitespace-nowrap shrink-0"
          title="Reset configuration to baseline defaults"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden md:inline">Reset</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <Save className="w-3.5 h-3.5 text-zinc-400" />
          <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={isPublishing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          <CloudUpload className="w-3.5 h-3.5" />
          <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
        </button>
      </div>
    </header>
  );
};
