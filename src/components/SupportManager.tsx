import React, { useState } from 'react';
import { SupportTicket } from '../types';
import { MessageSquare, Send } from 'lucide-react';

interface SupportManagerProps {
  tickets: SupportTicket[];
  onChange: (updated: SupportTicket[]) => void;
}

export const SupportManager: React.FC<SupportManagerProps> = ({ tickets, onChange }) => {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const handleReply = (id: string) => {
    const text = replyText[id];
    if (!text) return;

    onChange(tickets.map(t => t.id === id ? { ...t, adminReply: text, status: 'resolved' } : t));
    setReplyText({ ...replyText, [id]: '' });
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-red-500" />
          <span>User Support Tickets</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Review customer inquiries, device diagnostics, and reply directly to support requests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-white font-bold text-base">{ticket.subject}</h3>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    ticket.status === 'open' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    · {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  From <strong className="text-zinc-200">{ticket.userEmail}</strong> • Device: {ticket.deviceInfo}
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">{ticket.createdAt}</span>
            </div>

            <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800 text-sm text-zinc-300">
              {ticket.message}
            </div>

            {ticket.adminReply ? (
              <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/30 text-sm text-red-300 space-y-1">
                <span className="text-xs font-semibold text-red-400 block">Admin Reply:</span>
                <p>{ticket.adminReply}</p>
              </div>
            ) : (
              <div className="flex space-x-3 pt-2">
                <input
                  type="text"
                  placeholder="Type reply to user..."
                  value={replyText[ticket.id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500"
                />
                <button
                  onClick={() => handleReply(ticket.id)}
                  className="flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Reply</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
