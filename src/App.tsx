import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnalyticsSnapshot, MasterState, RegisteredUserRecord } from './types';
import { initialMasterState } from './initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { isSupabaseConfigured, supabase } from './supabase';
import {
  loadAnalyticsSnapshot,
  loadDraftState,
  loadRegisteredUsers,
  migrateMasterState,
  publishToSupabase,
  saveDraftState,
  updateRegisteredUserAccount,
  validateMasterState,
  verifyAdminAllowlist
} from './services/supabaseService';
import { Shield, Mail, Lock, AlertCircle, CheckCircle2, X, KeyRound, ArrowLeft } from 'lucide-react';

// Lazy-load secondary manager modules to reduce initial bundle weight
const AnalyticsManager = lazy(() =>
  import('./components/AnalyticsManager').then((m) => ({ default: m.AnalyticsManager }))
);
const OverlayManager = lazy(() =>
  import('./components/OverlayManager').then((m) => ({ default: m.OverlayManager }))
);
const ComprehensiveFeatureManager = lazy(() =>
  import('./components/ComprehensiveFeatureManager').then((m) => ({
    default: m.ComprehensiveFeatureManager
  }))
);
const BrandingManager = lazy(() =>
  import('./components/BrandingManager').then((m) => ({ default: m.BrandingManager }))
);
const ImageManager = lazy(() =>
  import('./components/ImageManager').then((m) => ({ default: m.ImageManager }))
);
const ContentManager = lazy(() =>
  import('./components/ContentManager').then((m) => ({ default: m.ContentManager }))
);
const GamesManager = lazy(() =>
  import('./components/GamesManager').then((m) => ({ default: m.GamesManager }))
);
const ShizukuManager = lazy(() =>
  import('./components/ShizukuManager').then((m) => ({ default: m.ShizukuManager }))
);
const AdsManager = lazy(() =>
  import('./components/AdsManager').then((m) => ({ default: m.AdsManager }))
);
const UpdatesManager = lazy(() =>
  import('./components/UpdatesManager').then((m) => ({ default: m.UpdatesManager }))
);
const AnnouncementsManager = lazy(() =>
  import('./components/AnnouncementsManager').then((m) => ({
    default: m.AnnouncementsManager
  }))
);
const SupportManager = lazy(() =>
  import('./components/SupportManager').then((m) => ({ default: m.SupportManager }))
);
const WorkflowPreview = lazy(() =>
  import('./components/WorkflowPreview').then((m) => ({ default: m.WorkflowPreview }))
);
const ZipDownloadCenter = lazy(() =>
  import('./components/ZipDownloadCenter').then((m) => ({ default: m.ZipDownloadCenter }))
);
const UserManager = lazy(() =>
  import('./components/UserManager').then((m) => ({ default: m.UserManager }))
);

interface SessionUser {
  email: string;
  uid: string;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics & Telemetry',
  users: 'Users & Access',
  overlay: 'Overlay & HUD',
  features: 'Feature Registry',
  content: 'Text & Strings',
  images: 'Icons & Assets',
  branding: 'Branding & Theme',
  games: 'Games Catalog',
  shizuku: 'Shizuku & Links',
  ads: 'Ad Configuration',
  updates: 'App Releases',
  announcements: 'Announcements',
  support: 'Support Tickets',
  workflow: 'History & Preview',
  downloads: 'ZIP Downloads'
};

export default function App() {
  const [state, setState] = useState<MasterState>(() => {
    try {
      const saved = localStorage.getItem('daveboostz_admin_state');
      return migrateMasterState(saved ? JSON.parse(saved) : null);
    } catch {
      return initialMasterState;
    }
  });

  const [lastPublishedContent, setLastPublishedContent] = useState(state.content);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [user, setUser] = useState<SessionUser | null>(() =>
    isSupabaseConfigured ? null : { email: 'preview-sandbox@daveboostz.local', uid: 'local-preview-sandbox' }
  );
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(() => !isSupabaseConfigured);
  const [authChecking, setAuthChecking] = useState<boolean>(isSupabaseConfigured);
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'update_password'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshAnalyticsAndUsers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAnalytics({
        source: 'unconfigured',
        totalUsers: 0,
        activeUsers7d: 0,
        sessions: [],
        errors: [],
        versionDistribution: [],
        loadedAt: new Date().toISOString()
      });
      setRegisteredUsers([]);
      return;
    }

    setAnalyticsLoading(true);
    setUsersLoading(true);
    try {
      const [snapshot, userRes] = await Promise.all([
        loadAnalyticsSnapshot(),
        loadRegisteredUsers()
      ]);
      setAnalytics(snapshot);
      setRegisteredUsers(userRes.users);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check Supabase RLS policies.';
      setBanner({
        type: 'error',
        text: `Failed to fetch analytics/users: ${message}`
      });
    } finally {
      setAnalyticsLoading(false);
      setUsersLoading(false);
    }
  }, []);

  const syncAuthenticatedSession = useCallback(
    async (sessionUser: { id: string; email?: string } | null) => {
      setAuthChecking(true);
      if (!sessionUser) {
        setUser(null);
        setIsAuthorizedAdmin(false);
        setAuthChecking(false);
        return;
      }

      try {
        const allowed = await verifyAdminAllowlist(sessionUser.id);
        setUser({ email: sessionUser.email || 'admin', uid: sessionUser.id });
        setIsAuthorizedAdmin(allowed);
        if (allowed) {
          setIsLoadingRemote(true);
          const { state: remoteState } = await loadDraftState();
          setState(remoteState);
          setLastPublishedContent(remoteState.content);
          await refreshAnalyticsAndUsers();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify admin allowlist or load Supabase.';
        setBanner({
          type: 'error',
          text: message
        });
      } finally {
        setIsLoadingRemote(false);
        setAuthChecking(false);
      }
    },
    [refreshAnalyticsAndUsers]
  );

  useEffect(() => {
    if (!isSupabaseConfigured) {
      loadDraftState()
        .then(({ state: loaded }) => setState(loaded))
        .catch((err) => console.error('Local state load failed:', err));
      refreshAnalyticsAndUsers();
      return;
    }

    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        syncAuthenticatedSession(data.session?.user ?? null);
      })
      .catch(() => {
        if (mounted) setAuthChecking(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setAuthMode('update_password');
        setLoginNotice('Enter a new password for your administrator account.');
        setLoginError('');
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthorizedAdmin(false);
        setAuthChecking(false);
        return;
      }
      syncAuthenticatedSession(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshAnalyticsAndUsers, syncAuthenticatedSession]);

  // Keep the admin view aligned with changes made by another admin or Android clients.
  // Draft updates are only applied when this browser has no unsaved local edits.
  useEffect(() => {
    if (!isSupabaseConfigured || !isAuthorizedAdmin || !user) return;

    const channel = supabase
      .channel(`daveboostz-admin-sync-${user.uid}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daveboostz_config' },
        (payload) => {
          const row = (payload.new || payload.old) as { id?: string };
          if (row?.id === 'draft' && !hasUnsavedChanges) {
            loadDraftState()
              .then(({ state: remoteState }) => {
                setState(remoteState);
                setLastPublishedContent(remoteState.content);
              })
              .catch((err: unknown) => console.error('Draft realtime refresh failed:', err));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'daveboostz_sessions' },
        () => refreshAnalyticsAndUsers()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'daveboostz_error_reports' },
        () => refreshAnalyticsAndUsers()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAuthorizedAdmin, user?.uid, hasUnsavedChanges, refreshAnalyticsAndUsers]);

  const handleStateChange = async (
    updater: (prev: MasterState) => MasterState,
    persistImmediately = false,
    auditAction?: { action: string; details: string }
  ) => {
    const previousState = state;
    let nextState = updater(previousState);

    if (auditAction) {
      nextState = {
        ...nextState,
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            adminEmail: user?.email || 'admin@daveboostz.com',
            action: auditAction.action,
            details: auditAction.details
          },
          ...nextState.auditLogs
        ].slice(0, 50)
      };
    }

    setState(nextState);
    setHasUnsavedChanges(true);

    try {
      localStorage.setItem('daveboostz_admin_state', JSON.stringify(nextState));
      if (persistImmediately && isSupabaseConfigured) {
        setIsSaving(true);
        await saveDraftState(nextState, user?.uid);
      }
    } catch (err: unknown) {
      setState(previousState);
      localStorage.setItem('daveboostz_admin_state', JSON.stringify(previousState));
      const message = err instanceof Error ? err.message : 'Permission denied or offline';
      setBanner({
        type: 'error',
        text: `Failed to save change to Supabase: ${message}. Reverted.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const validation = validateMasterState(state);
    if (!validation.valid) {
      setBanner({ type: 'error', text: `Validation error: ${validation.errors[0]}` });
      return;
    }

    setIsSaving(true);
    setBanner(null);
    try {
      await saveDraftState(state, user?.uid);
      setBanner({
        type: 'success',
        text: isSupabaseConfigured
          ? 'Validated draft saved to Supabase PostgreSQL (`daveboostz_config/draft`).'
          : 'Validated draft saved locally. Configure VITE_SUPABASE_* env vars to sync with Supabase.'
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setBanner({ type: 'error', text: `Draft save failed: ${message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    const validation = validateMasterState(state);
    if (!validation.valid) {
      setBanner({ type: 'error', text: `Cannot publish: ${validation.errors[0]}` });
      return;
    }

    setIsPublishing(true);
    setBanner(null);
    try {
      const now = new Date().toLocaleString();
      const newVersionNum = state.publishedVersionNumber + 1;
      const { versionHistory, auditLogs, ...snapshot } = state;

      const updatedState: MasterState = {
        ...state,
        publishedVersionNumber: newVersionNum,
        lastPublishedAt: now,
        versionHistory: [
          {
            versionNumber: newVersionNum,
            publishedAt: now,
            publishedBy: user?.email || 'admin@daveboostz.com',
            summary: `Published v${newVersionNum} (${state.features.filter((f) => f.enabled).length}/${state.features.length} features ON · Overlay ${state.overlay.masterEnabled ? 'ON' : 'OFF'})`,
            snapshot
          },
          ...versionHistory
        ].slice(0, 20),
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: now,
            adminEmail: user?.email || 'admin@daveboostz.com',
            action: 'PUBLISH_CONFIG',
            details: `Published revision #${newVersionNum} to Supabase daveboostz_config (id='published').`
          },
          ...auditLogs
        ].slice(0, 50)
      };

      await publishToSupabase(updatedState, user?.uid);
      setState(updatedState);
      setLastPublishedContent(updatedState.content);
      setHasUnsavedChanges(false);
      setBanner({
        type: 'success',
        text: isSupabaseConfigured
          ? `Published Revision #${newVersionNum} live to Supabase PostgreSQL.`
          : `Published Revision #${newVersionNum} in local preview mode.`
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verify Supabase RLS policies and admins table';
      setBanner({
        type: 'error',
        text: `Publish failed: ${message}`
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRollback = async (versionNum: number) => {
    const target = state.versionHistory.find((v) => v.versionNumber === versionNum);
    if (!target) return;

    const restored: MasterState = target.snapshot
      ? migrateMasterState({
          ...target.snapshot,
          publishedVersionNumber: state.publishedVersionNumber,
          lastPublishedAt: state.lastPublishedAt,
          versionHistory: state.versionHistory,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              adminEmail: user?.email || 'admin@daveboostz.com',
              action: 'ROLLBACK_DRAFT',
              details: `Restored draft configuration from Revision #${versionNum}.`
            },
            ...state.auditLogs
          ]
        })
      : {
          ...state,
          auditLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleString(),
              adminEmail: user?.email || 'admin@daveboostz.com',
              action: 'ROLLBACK_LOGGED',
              details: `Referenced Revision #${versionNum}.`
            },
            ...state.auditLogs
          ]
        };

    setState(restored);
    setHasUnsavedChanges(true);
    await saveDraftState(restored, user?.uid).catch(() => {});
    setBanner({
      type: 'success',
      text: `Restored Revision #${versionNum} into draft. Click Publish to push to Android clients.`
    });
  };

  const handleResetToDefaults = async () => {
    const resetState: MasterState = {
      ...initialMasterState,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          adminEmail: user?.email || 'admin@daveboostz.com',
          action: 'RESET_DEFAULTS',
          details: 'Reset draft configuration to safe factory baseline.'
        },
        ...state.auditLogs
      ].slice(0, 50)
    };
    setState(resetState);
    setHasUnsavedChanges(true);
    await saveDraftState(resetState, user?.uid).catch(() => {});
    setBanner({ type: 'success', text: 'Reset draft configuration to factory baseline.' });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setLoginError('');
    setLoginNotice('');
    try {
      if (!isSupabaseConfigured) {
        setLoginError('Supabase client environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are required for authentication.');
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });
      if (error) throw error;
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Authentication failed. Check email and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setLoginError('');
    setLoginNotice('');
    try {
      if (!isSupabaseConfigured) {
        setLoginError('Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to send password recovery emails.');
        return;
      }
      const email = loginEmail.trim();
      if (!email) {
        setLoginError('Enter your administrator email address.');
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      setLoginNotice('Password recovery link sent. Check your inbox and open the link to set a new password.');
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Could not send password recovery email.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCompletePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginNotice('');
    if (newPassword.length < 8) {
      setLoginError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setAuthMode('login');
      setBanner({ type: 'success', text: 'Administrator password updated successfully.' });
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsAuthorizedAdmin(false);
    setAuthMode('login');
  };

  const handleUpdateUserAccount = async (
    uid: string,
    updates: Partial<Pick<RegisteredUserRecord, 'status' | 'role'>>
  ) => {
    await updateRegisteredUserAccount(uid, updates);
    setRegisteredUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, ...updates } : u)));
    await handleStateChange(
      (prev) => prev,
      false,
      {
        action: 'UPDATE_USER_ACCOUNT',
        details: `Updated user ${uid} (${Object.entries(updates).map(([k, v]) => `${k}=${v}`).join(', ')})`
      }
    );
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-zinc-300 text-sm">
        Verifying Supabase session and administrator allowlist...
      </div>
    );
  }

  if (authMode === 'update_password' && isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111115] border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Set New Password</h1>
            <p className="text-xs text-zinc-400 mt-1">Supabase Password Recovery</p>
          </div>

          <form onSubmit={handleCompletePasswordRecovery} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                {loginError}
              </div>
            )}
            {loginNotice && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                {loginNotice}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#111115] border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">DaveBoostz Admin</h1>
            <p className="text-xs text-zinc-400 mt-1">
              {authMode === 'forgot' ? 'Reset Administrator Password' : 'Authorized Supabase Administrator Sign-In'}
            </p>
          </div>

          {authMode === 'forgot' ? (
            <form onSubmit={handleSendPasswordReset} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                  {loginError}
                </div>
              )}
              {loginNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                  {loginNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@daveboostz.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Sending Reset Email...' : 'Send Password Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                  setLoginNotice('');
                }}
                className="w-full py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white inline-flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-300">
                  {loginError}
                </div>
              )}
              {loginNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                  {loginNotice}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@daveboostz.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setLoginError('');
                      setLoginNotice('');
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-zinc-500 mt-6">
            Public registration is disabled. Operator privileges require a provisioned row in{' '}
            <code className="font-mono text-zinc-400">public.admins</code>.
          </p>
        </div>
      </div>
    );
  }

  if (isSupabaseConfigured && !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111115] border border-red-500/30 rounded-xl p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="font-display text-xl font-bold text-white">Unauthorized Admin Account</h2>
          <p className="text-xs text-zinc-400">
            Signed in as <strong className="text-white">{user.email}</strong>, but no active allowlist row exists in{' '}
            <code className="text-red-400 font-mono">public.admins</code> for{' '}
            <code className="text-zinc-300 font-mono">{user.uid}</code>.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-[#09090B] text-zinc-100 font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userEmail={user.email}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        featureCount={state.features.length}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
        <Header
          activeTabLabel={TAB_LABELS[activeTab] || 'Control Center'}
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
          isPublishing={isPublishing}
          isSaving={isSaving}
          publishedVersion={state.publishedVersionNumber}
          lastPublishedAt={state.lastPublishedAt}
          hasUnsavedChanges={hasUnsavedChanges}
          onResetToDefaults={handleResetToDefaults}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenDownloads={() => setActiveTab('downloads')}
          supabaseConnected={isSupabaseConfigured}
          appVersion={state.release.latestVersion}
        />

        {banner && (
          <div
            className={`px-4 md:px-6 py-2.5 text-xs flex items-center justify-between border-b ${
              banner.type === 'error'
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{banner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              aria-label="Dismiss notification"
              className="p-1 hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-[#09090B] w-full max-w-none">
          {isLoadingRemote ? (
            <div className="space-y-4">
              <div className="h-32 rounded-xl bg-zinc-900/60 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-24 rounded-xl bg-zinc-900/60 animate-pulse" />
                <div className="h-24 rounded-xl bg-zinc-900/60 animate-pulse" />
                <div className="h-24 rounded-xl bg-zinc-900/60 animate-pulse" />
                <div className="h-24 rounded-xl bg-zinc-900/60 animate-pulse" />
              </div>
            </div>
          ) : (
            <Suspense
              fallback={
                <div className="py-12 text-center text-xs text-zinc-500">
                  Loading module...
                </div>
              }
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  state={state}
                  analytics={analytics}
                  analyticsLoading={analyticsLoading}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsManager
                  state={state}
                  analytics={analytics}
                  loading={analyticsLoading}
                  onRefresh={refreshAnalyticsAndUsers}
                />
              )}
              {activeTab === 'overlay' && (
                <OverlayManager
                  overlay={state.overlay}
                  disabled={isSaving || isPublishing}
                  onChange={(updated) =>
                    handleStateChange((prev) => ({ ...prev, overlay: updated }), true, {
                      action: 'UPDATE_OVERLAY',
                      details: `Updated overlay configuration (Master=${updated.masterEnabled ? 'ON' : 'OFF'}, Style=${updated.miniHudStyle}).`
                    })
                  }
                />
              )}
              {activeTab === 'features' && (
                <ComprehensiveFeatureManager
                  features={state.features}
                  disabled={isSaving || isPublishing}
                  onChange={(updated) =>
                    handleStateChange((prev) => ({ ...prev, features: updated }), true, {
                      action: 'UPDATE_FEATURES',
                      details: `Updated feature registry (${updated.filter((f) => f.enabled).length}/${updated.length} enabled).`
                    })
                  }
                />
              )}
              {activeTab === 'branding' && (
                <BrandingManager
                  config={state.config}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, config: updated }))}
                />
              )}
              {activeTab === 'images' && (
                <ImageManager
                  assets={state.imageAssets}
                  config={state.config}
                  games={state.games}
                  actorUid={user.uid}
                  onAssetsChange={(updated) =>
                    handleStateChange((prev) => ({ ...prev, imageAssets: updated }), true)
                  }
                  onAssignToLogo={(url) =>
                    handleStateChange((prev) => ({ ...prev, config: { ...prev.config, logoUrl: url } }), true)
                  }
                  onAssignToGameIcon={(gameId, url) =>
                    handleStateChange(
                      (prev) => ({
                        ...prev,
                        games: prev.games.map((g) => (g.id === gameId ? { ...g, iconUrl: url } : g))
                      }),
                      true
                    )
                  }
                  onAssignToGameBackground={(gameId, url) =>
                    handleStateChange(
                      (prev) => ({
                        ...prev,
                        games: prev.games.map((g) => (g.id === gameId ? { ...g, backgroundUrl: url } : g))
                      }),
                      true
                    )
                  }
                />
              )}
              {activeTab === 'content' && (
                <ContentManager
                  content={state.content}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, content: updated }))}
                  onRestorePrevious={() =>
                    handleStateChange((prev) => ({ ...prev, content: lastPublishedContent }))
                  }
                />
              )}
              {activeTab === 'games' && (
                <GamesManager
                  games={state.games}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, games: updated }), true)}
                />
              )}
              {activeTab === 'shizuku' && (
                <ShizukuManager
                  config={state.config}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, config: updated }))}
                />
              )}
              {activeTab === 'ads' && (
                <AdsManager
                  ads={state.ads}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, ads: updated }), true)}
                />
              )}
              {activeTab === 'updates' && (
                <UpdatesManager
                  release={state.release}
                  versionHistory={state.versionHistory}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, release: updated }))}
                />
              )}
              {activeTab === 'announcements' && (
                <AnnouncementsManager
                  announcements={state.announcements}
                  onChange={(updated) =>
                    handleStateChange(
                      (prev) => ({
                        ...prev,
                        announcements: updated,
                        maintenanceMode: updated.some((a) => a.maintenanceMode)
                      }),
                      true
                    )
                  }
                />
              )}
              {activeTab === 'support' && (
                <SupportManager
                  tickets={state.tickets}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, tickets: updated }), true)}
                />
              )}
              {activeTab === 'users' && (
                <UserManager
                  admins={state.adminUsers}
                  onChange={(updated) => handleStateChange((prev) => ({ ...prev, adminUsers: updated }), true)}
                  registeredUsers={registeredUsers}
                  usersLoading={usersLoading}
                  supabaseConnected={isSupabaseConfigured}
                  onRefreshUsers={refreshAnalyticsAndUsers}
                  onUpdateUserAccount={handleUpdateUserAccount}
                />
              )}
              {activeTab === 'workflow' && (
                <WorkflowPreview
                  state={state}
                  onPublish={handlePublish}
                  onRollback={handleRollback}
                />
              )}
              {activeTab === 'downloads' && <ZipDownloadCenter />}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
