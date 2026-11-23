import React, { useState } from 'react';
import { Announcement } from '../types';
import { BellRing, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface AnnouncementsManagerProps {
  announcements: Announcement[];
  onChange: (updated: Announcement[]) => void;
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({ announcements, onChange }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<'info' | 'warning' | 'maintenance'>('info');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMessage) return;

    const ann: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle,
      message: newMessage,
      type: newType,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      maintenanceMode: newType === 'maintenance'
    };

    onChange([ann, ...announcements]);
    setNewTitle('');
    setNewMessage('');
  };

  const handleDelete = (id: string) => {
    onChange(announcements.filter(a => a.id !== id));
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <BellRing className="w-6 h-6 text-red-500" />
          <span>Announcements & Maintenance Mode</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Broadcast important news, update alerts, or enable system maintenance mode to disable app features gracefully.
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Create New Announcement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Title</label>
            <input
              type="text"
              placeholder="Announcement title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Type</label>
            <select
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="info">Info / Notice</option>
              <option value="warning">Warning</option>
              <option value="maintenance">Maintenance Mode</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 uppercase mb-1">Message</label>
          <textarea
            rows={2}
            placeholder="Detailed message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
          />
        </div>

        <button
          type="submit"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h4 className="text-white font-bold text-base">{ann.title}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  ann.type === 'maintenance' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {ann.type}
                </span>
              </div>
              <p className="text-xs text-zinc-300">{ann.message}</p>
              <span className="text-[11px] text-zinc-500 block">Active from {ann.startDate} to {ann.endDate}</span>
            </div>

            <button
              onClick={() => handleDelete(ann.id)}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-red-600/20 text-zinc-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
