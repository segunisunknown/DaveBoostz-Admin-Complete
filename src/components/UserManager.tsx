import React, { useState } from 'react';
import { AdminUserItem, RegisteredUserRecord } from '../types';
import { Users, Plus, Trash2, Shield, Search, RefreshCw, Ban, CheckCircle2 } from 'lucide-react';

interface UserManagerProps {
  admins: AdminUserItem[];
  onChange: (updated: AdminUserItem[]) => void;
  registeredUsers: RegisteredUserRecord[];
  usersLoading: boolean;
  supabaseConnected: boolean;
  onRefreshUsers: () => void;
  onUpdateUserAccount: (uid: string, updates: Partial<Pick<RegisteredUserRecord, 'status' | 'role'>>) => Promise<void>;
}

export const UserManager: React.FC<UserManagerProps> = ({
  admins,
  onChange,
  registeredUsers,
  usersLoading,
  supabaseConnected,
  onRefreshUsers,
  onUpdateUserAccount
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Super Admin' | 'Content Editor' | 'Support Agent'>('Content Editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (admins.some((a) => a.email.toLowerCase() === trimmed)) {
      setFeedback({ type: 'error', text: `${trimmed} is already in the admin directory.` });
      return;
    }

    const newAdmin: AdminUserItem = {
      id: `admin-${Date.now()}`,
      email: trimmed,
      role,
      addedAt: new Date().toISOString().split('T')[0]
    };

    onChange([...admins, newAdmin]);
    setEmail('');
    setFeedback({
      type: 'success',
      text: `Added ${trimmed} (${role}). Remember to also insert a row into public.admins (user_id, email, role) via Supabase SQL Editor to grant RLS write permissions.`
    });
  };

  const handleConfirmDelete = (id: string) => {
    onChange(admins.filter((a) => a.id !== id));
    setConfirmRemoveId(null);
    setFeedback({ type: 'success', text: 'Removed admin entry from directory.' });
  };

  const handleUserMutation = async (
    uid: string,
    updates: Partial<Pick<RegisteredUserRecord, 'status' | 'role'>>
  ) => {
    setUpdatingUid(uid);
    setFeedback(null);
    try {
      await onUpdateUserAccount(uid, updates);
      setFeedback({ type: 'success', text: 'Updated user account in Supabase PostgreSQL.' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to update user account.' });
    } finally {
      setUpdatingUid(null);
    }
  };

  const filteredUsers = registeredUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q) ||
      (u.deviceModel || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const selectedUser = registeredUsers.find((u) => u.uid === selectedUserUid) || null;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
          <Users className="w-5 h-5 text-red-500" />
          <span>Users & Administrator Access</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Administer registered application accounts (<code className="font-mono text-zinc-300">daveboostz_users</code>) and review authorized administrators (<code className="font-mono text-zinc-300">public.admins</code>). Privilege escalation is restricted to Supabase SQL Editor / service role.
        </p>
      </div>

      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg text-xs border ${
            feedback.type === 'error'
              ? 'bg-red-950/50 border-red-800 text-red-300'
              : 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Registered App Users Directory */}
      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Registered Application Users</h2>
            <p className="text-xs text-zinc-500 mt-0.5 tabular-nums">
              {supabaseConnected
                ? `${registeredUsers.length} records loaded from Supabase PostgreSQL`
                : 'Connect Supabase to inspect live registered accounts'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshUsers}
            disabled={usersLoading || !supabaseConnected}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 disabled:opacity-50 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
            <span>{usersLoading ? 'Loading...' : 'Refresh Users'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by email, UID, or device model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg self-start">
            {(['all', 'active', 'suspended'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="py-10 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            {supabaseConnected
              ? 'No matching user records found in daveboostz_users.'
              : 'Local Preview Mode: configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to query real registered accounts from Supabase PostgreSQL.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500">
                    <th className="py-2 pr-3 font-medium">User</th>
                    <th className="py-2 px-3 font-medium">App Version</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 pl-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.uid}
                      onClick={() => setSelectedUserUid(u.uid)}
                      className={`cursor-pointer transition-colors ${
                        selectedUserUid === u.uid ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'
                      }`}
                    >
                      <td className="py-2.5 pr-3">
                        <div className="font-medium text-zinc-100">{u.email}</div>
                        <div className="text-[11px] font-mono text-zinc-500 truncate max-w-[200px]">{u.uid}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-zinc-300">
                        {u.appVersion ? `v${u.appVersion}` : '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={u.status === 'active' ? 'text-emerald-400' : 'text-red-400'}>
                          {u.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          disabled={updatingUid === u.uid}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserMutation(u.uid, {
                              status: u.status === 'active' ? 'suspended' : 'active'
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
                        >
                          {u.status === 'active' ? (
                            <>
                              <Ban className="w-3 h-3 text-red-400" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Restore</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
              <div className="text-xs font-semibold text-white">User Account Details</div>
              {selectedUser ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Email</span>
                    <span className="text-zinc-200 font-medium">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">UID</span>
                    <span className="text-zinc-300 font-mono break-all">{selectedUser.uid}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Device & Version</span>
                    <span className="text-zinc-300">
                      {selectedUser.deviceModel || 'Unknown'} · v{selectedUser.appVersion || '—'}
                    </span>
                  </div>
                  <div>
                    <label className="text-zinc-500 block mb-1">App Tier Role</label>
                    <select
                      value={selectedUser.role}
                      disabled={updatingUid === selectedUser.uid}
                      onChange={(e) =>
                        handleUserMutation(selectedUser.uid, {
                          role: e.target.value as RegisteredUserRecord['role']
                        })
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="user">Standard User</option>
                      <option value="beta_tester">Beta Tester</option>
                    </select>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-1">
                    Last active: <span className="font-mono">{selectedUser.lastActiveAt || 'Unknown'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500">Select a user row to inspect device info and account controls.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Allowlist Reference & Directory */}
      <form onSubmit={handleAdd} className="bg-[#111115] border border-zinc-800/90 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Administrator Directory</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Track authorized operators. Actual PostgreSQL RLS write access requires a matching row in <code className="font-mono text-zinc-300">public.admins</code> created in the Supabase SQL Editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Admin Email</label>
            <input
              type="email"
              placeholder="operator@daveboostz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Operator Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminUserItem['role'])}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Content Editor">Content Editor</option>
              <option value="Support Agent">Support Agent</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Admin Entry</span>
        </button>
      </form>

      <div className="bg-[#111115] border border-zinc-800/90 rounded-xl divide-y divide-zinc-800/80">
        {admins.map((adm) => (
          <div key={adm.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{adm.email}</div>
                <div className="text-xs text-zinc-400 flex items-center gap-2 tabular-nums">
                  <span className="text-red-400">{adm.role}</span>
                  <span aria-hidden="true">·</span>
                  <span>Added {adm.addedAt}</span>
                </div>
              </div>
            </div>

            {confirmRemoveId === adm.id ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConfirmDelete(adm.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white"
                >
                  Confirm Remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemoveId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmRemoveId(adm.id)}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors"
                title="Remove admin entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManager;
