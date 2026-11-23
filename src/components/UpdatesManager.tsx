import React from 'react';
import { AppRelease, VersionHistoryItem } from '../types';
import { Download, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface UpdatesManagerProps {
  release: AppRelease;
  versionHistory: VersionHistoryItem[];
  onChange: (updated: AppRelease) => void;
}

const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/;
const SHA256_RE = /^[a-fA-F0-9]{64}$/;

export const UpdatesManager: React.FC<UpdatesManagerProps> = ({
  release,
  versionHistory,
  onChange
}) => {
  const handleChange = <K extends keyof AppRelease>(field: K, value: AppRelease[K]) => {
    onChange({ ...release, [field]: value });
  };

  const versionValid = SEMVER_RE.test(release.latestVersion.trim());
  const minVersionValid = SEMVER_RE.test(release.minSupportedVersion.trim());
  const shaValid = !release.apkSha256 || SHA256_RE.test(release.apkSha256.trim());
  const urlValid = !release.apkUrl || release.apkUrl.startsWith('https://');

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Download className="w-5 h-5 text-red-500" />
          <span>App Version & Release Management</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Configure current Android version targets, force-update threshold, release notes, HTTPS download link, and SHA-256 verification digest.
        </p>
      </div>

      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Latest Available Version
            </label>
            <input
              type="text"
              value={release.latestVersion}
              onChange={(e) => handleChange('latestVersion', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
            />
            {!versionValid && (
              <p className="text-[11px] text-red-400 mt-1">Must use semantic version format (e.g. 2.0.0).</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Minimum Supported Version
            </label>
            <input
              type="text"
              value={release.minSupportedVersion}
              onChange={(e) => handleChange('minSupportedVersion', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
            />
            {!minVersionValid && (
              <p className="text-[11px] text-red-400 mt-1">Must use semantic version format (e.g. 1.0.0).</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">Require Update Below Minimum Version</div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Signals clients below v{release.minSupportedVersion || '1.0.0'} to display an update prompt.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('forceUpdate', !release.forceUpdate)}
            aria-pressed={release.forceUpdate}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              release.forceUpdate ? 'bg-red-600' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                release.forceUpdate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Release Notes / Changelog
          </label>
          <textarea
            rows={4}
            value={release.changelog}
            onChange={(e) => handleChange('changelog', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            HTTPS APK Download URL
          </label>
          <input
            type="url"
            value={release.apkUrl}
            onChange={(e) => handleChange('apkUrl', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
          />
          {!urlValid && (
            <p className="text-[11px] text-red-400 mt-1">APK URL must use https://.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            APK SHA-256 Digest
          </label>
          <input
            type="text"
            value={release.apkSha256}
            onChange={(e) => handleChange('apkSha256', e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 text-[11px] mt-1.5">
            {shaValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-zinc-400">Valid 64-character SHA-256 checksum for client verification.</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400">Checksum must be 64 hexadecimal characters.</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Published Version History */}
      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6">
        <h2 className="text-base font-semibold text-white mb-4">Published Configuration History</h2>
        {versionHistory.length === 0 ? (
          <div className="text-xs text-zinc-500 py-6 text-center">No published revisions yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800/80 text-xs">
            {versionHistory.slice(0, 8).map((v) => (
              <div key={v.versionNumber} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-semibold text-red-400">Revision #{v.versionNumber}</span>
                  <span className="mx-2 text-zinc-600">·</span>
                  <span className="text-zinc-200">{v.summary}</span>
                </div>
                <div className="text-zinc-500 font-mono tabular-nums shrink-0">
                  {v.publishedAt} · {v.publishedBy}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatesManager;
