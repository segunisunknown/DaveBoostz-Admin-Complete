import React from 'react';
import {
  LayoutDashboard,
  Palette,
  Image as ImageIcon,
  FileText,
  Gamepad2,
  Shield,
  ToggleLeft,
  Megaphone,
  Download,
  BellRing,
  MessageSquare,
  Workflow,
  Package,
  LogOut,
  X,
  Users,
  Layers,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userEmail?: string;
  isOpen?: boolean;
  onClose?: () => void;
  featureCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onLogout,
  userEmail,
  isOpen,
  onClose,
  featureCount
}) => {
  const navGroups = [
    {
      heading: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics & Telemetry', icon: BarChart3 },
        { id: 'users', label: 'Users & Access', icon: Users }
      ]
    },
    {
      heading: 'Android Remote Control',
      items: [
        { id: 'overlay', label: 'Overlay & HUD', icon: Layers },
        { id: 'features', label: `Feature Registry (${featureCount})`, icon: ToggleLeft },
        { id: 'games', label: 'Games Catalog', icon: Gamepad2 },
        { id: 'shizuku', label: 'Shizuku & Links', icon: Shield }
      ]
    },
    {
      heading: 'Content & Releases',
      items: [
        { id: 'content', label: 'Text & Strings', icon: FileText },
        { id: 'images', label: 'Icons & Assets', icon: ImageIcon },
        { id: 'branding', label: 'Branding & Theme', icon: Palette },
        { id: 'updates', label: 'App Releases', icon: Download },
        { id: 'announcements', label: 'Announcements', icon: BellRing },
        { id: 'ads', label: 'Ad Configuration', icon: Megaphone }
      ]
    },
    {
      heading: 'Operations',
      items: [
        { id: 'support', label: 'Support Tickets', icon: MessageSquare },
        { id: 'workflow', label: 'History & Preview', icon: Workflow },
        { id: 'downloads', label: 'ZIP Downloads', icon: Package }
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#0B0B0F] border-r border-zinc-800/90 flex flex-col shrink-0
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 px-5 border-b border-zinc-800/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-display text-white font-bold text-base tracking-tight block leading-none truncate">
                DaveBoostz
              </span>
              <span className="text-[11px] text-zinc-500 block mt-1 truncate">Admin Platform</span>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-2 text-zinc-400 hover:text-white lg:hidden rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.heading} className="space-y-1">
              <div className="px-3 pb-1 text-[11px] font-medium text-zinc-500">
                {group.heading}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-red-600/12 text-white border border-red-500/30'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/70 border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-red-500' : 'text-zinc-500'}`}
                    />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/90 bg-[#0D0D12]">
          <div className="mb-3 min-w-0">
            <div className="text-[11px] text-zinc-500">Signed in</div>
            <div className="text-xs font-medium text-zinc-200 truncate">
              {userEmail || 'admin@daveboostz.com'}
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
