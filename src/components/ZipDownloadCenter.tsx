import React, { useState } from 'react';
import { Package, Download, Smartphone, FileCode, Archive, GitBranch } from 'lucide-react';
import {
  downloadAdminRepoZip,
  downloadAdminWorkflowYml,
  downloadAndroidRepoZip,
  downloadAndroidWorkflowYml,
  downloadAndroidWorkflowZip,
  downloadCompleteZip,
  getArchiveCounts
} from '../utils/zipExporter';

export const ZipDownloadCenter: React.FC = () => {
  const [downloadingComplete, setDownloadingComplete] = useState(false);
  const [downloadingApp, setDownloadingApp] = useState(false);
  const [downloadingAdmin, setDownloadingAdmin] = useState(false);
  const [downloadingWorkflowZip, setDownloadingWorkflowZip] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { androidFileCount, adminFileCount, totalCompleteCount } = getArchiveCounts();

  const handleDownloadAndroid = async () => {
    setStatusMessage(null);
    setDownloadingApp(true);
    try {
      const count = await downloadAndroidRepoZip();
      setStatusMessage({ type: 'success', text: `Packaged DaveBoostz-Android.zip (${count} files).` });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to package DaveBoostz-Android.zip.'
      });
    } finally {
      setDownloadingApp(false);
    }
  };

  const handleDownloadAdmin = async () => {
    setStatusMessage(null);
    setDownloadingAdmin(true);
    try {
      const count = await downloadAdminRepoZip();
      setStatusMessage({ type: 'success', text: `Packaged DaveBoostz-Admin.zip (${count} files).` });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to package DaveBoostz-Admin.zip.'
      });
    } finally {
      setDownloadingAdmin(false);
    }
  };

  const handleDownloadComplete = async () => {
    setStatusMessage(null);
    setDownloadingComplete(true);
    try {
      const count = await downloadCompleteZip();
      setStatusMessage({ type: 'success', text: `Packaged DaveBoostz-Complete-v2.0.zip (${count} files).` });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to package DaveBoostz-Complete-v2.0.zip.'
      });
    } finally {
      setDownloadingComplete(false);
    }
  };

  const handleDownloadAndroidWorkflowYml = () => {
    setStatusMessage(null);
    try {
      downloadAndroidWorkflowYml();
      setStatusMessage({
        type: 'success',
        text: 'Downloaded android-ci.yml (place at .github/workflows/android-ci.yml in DaveBoostz-Android).'
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to download android-ci.yml.'
      });
    }
  };

  const handleDownloadAdminWorkflowYml = () => {
    setStatusMessage(null);
    try {
      downloadAdminWorkflowYml();
      setStatusMessage({
        type: 'success',
        text: 'Downloaded ci.yml (place at .github/workflows/ci.yml in DaveBoostz-Admin).'
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to download ci.yml.'
      });
    }
  };

  const handleDownloadAndroidWorkflowZip = async () => {
    setStatusMessage(null);
    setDownloadingWorkflowZip(true);
    try {
      await downloadAndroidWorkflowZip();
      setStatusMessage({
        type: 'success',
        text: 'Packaged DaveBoostz-Android-Workflow.zip (.github/workflows/android-ci.yml).'
      });
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to package DaveBoostz-Android-Workflow.zip.'
      });
    } finally {
      setDownloadingWorkflowZip(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center space-x-2.5 tracking-tight">
          <Package className="w-5 h-5 text-red-500" />
          <span>ZIP Downloads &amp; Repository Export</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Download clean, separated GitHub-ready archives (<span className="font-mono text-zinc-300">DaveBoostz-Android.zip</span> and <span className="font-mono text-zinc-300">DaveBoostz-Admin.zip</span>) or standalone GitHub Actions workflow files without node_modules or secrets.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`px-4 py-3 rounded-lg text-xs border ${
            statusMessage.type === 'error'
              ? 'bg-red-950/50 border-red-800 text-red-300'
              : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Separated Repository Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#111115] border border-red-600/30 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">DaveBoostz-Android.zip</h3>
              <span className="text-[11px] font-mono text-zinc-400 tabular-nums">{androidFileCount} files</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standalone Android repository: Kotlin sources, AIDL, Jetpack Compose screens, Hilt + Room + DataStore, Shizuku 13.1.5, Gradle KTS, unit tests, <span className="font-mono text-zinc-300">.gitignore</span>, and <span className="font-mono text-zinc-300">android-ci.yml</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadAndroid}
            disabled={downloadingApp}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingApp ? 'Packaging DaveBoostz-Android...' : 'Download DaveBoostz-Android.zip'}</span>
          </button>
        </div>

        <div className="bg-[#111115] border border-blue-500/30 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">DaveBoostz-Admin.zip</h3>
              <span className="text-[11px] font-mono text-zinc-400 tabular-nums">{adminFileCount} files</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standalone Admin Website repository: React + Vite + Tailwind, Supabase Auth, PostgreSQL &amp; Storage RLS schema (<span className="font-mono text-zinc-300">supabase/</span>), <span className="font-mono text-zinc-300">vercel.json</span>, <span className="font-mono text-zinc-300">package-lock.json</span>, unit tests, docs, and <span className="font-mono text-zinc-300">ci.yml</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadAdmin}
            disabled={downloadingAdmin}
            className="w-full py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingAdmin ? 'Packaging DaveBoostz-Admin...' : 'Download DaveBoostz-Admin.zip'}</span>
          </button>
        </div>
      </div>

      {/* Standalone GitHub Actions Workflows */}
      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-red-400" />
              <span>Separate GitHub Actions Workflows</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Download only the workflow files to upload directly into <span className="font-mono text-zinc-300">.github/workflows/</span> without unpacking the full repository ZIPs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownloadAndroidWorkflowYml}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-red-600/30 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Download android-ci.yml</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAndroidWorkflowZip}
            disabled={downloadingWorkflowZip}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Package className="w-3.5 h-3.5 text-red-400" />
            <span>{downloadingWorkflowZip ? 'Packaging...' : 'Android Workflow ZIP'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAdminWorkflowYml}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-blue-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download ci.yml (Admin)</span>
          </button>
        </div>
      </div>

      {/* Full Combined Archive */}
      <div className="bg-[#111115] border border-zinc-800/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2.5">
            <Archive className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-white">DaveBoostz-Complete-v2.0.zip</h3>
            <span className="text-[11px] font-mono text-zinc-400 tabular-nums">· {totalCompleteCount} files</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Combined monorepo archive containing <span className="font-mono text-zinc-300">android/</span>,{' '}
            <span className="font-mono text-zinc-300">admin-web/</span>,{' '}
            <span className="font-mono text-zinc-300">supabase/</span>, and{' '}
            <span className="font-mono text-zinc-300">docs/</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadComplete}
          disabled={downloadingComplete}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloadingComplete ? 'Packaging v2.0...' : 'Download Combined v2.0 ZIP'}</span>
        </button>
      </div>
    </div>
  );
};

export default ZipDownloadCenter;
