import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, FileSpreadsheet, Heart, User, Sparkles, LogOut, RefreshCw, BarChart2 } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'planner' | 'reports' | 'automations';
  setActiveTab: (tab: 'dashboard' | 'planner' | 'reports' | 'automations') => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
}: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Workspace Dashboard',
      subtitle: 'Analytics & Shortcuts',
      icon: LayoutDashboard,
      color: 'text-[#6c8361]',
      bgColor: 'hover:bg-[#8ba180]/10',
      activeColor: 'bg-[#8ba180]/15 text-[#5a7350] border-[#8ba180]',
    },
    {
      id: 'planner' as const,
      label: 'Daily Planner Board',
      subtitle: 'Schedules, Tasks, Scribbles',
      icon: BookOpen,
      color: 'text-[#587c9c]',
      bgColor: 'hover:bg-[#add2ec]/10',
      activeColor: 'bg-[#add2ec]/15 text-[#2d4b68] border-[#add2ec]',
    },
    {
      id: 'reports' as const,
      label: 'Reports & Graphs',
      subtitle: 'Charts & Histories',
      icon: BarChart2,
      color: 'text-[#803138]',
      bgColor: 'hover:bg-[#ffdce0]/10',
      activeColor: 'bg-[#ffdce0]/15 text-[#803138] border-[#ffdce0]',
    },
    {
      id: 'automations' as const,
      label: 'Cloud & Google Sheets',
      subtitle: 'Synchronization & Backups',
      icon: FileSpreadsheet,
      color: 'text-[#ce5c65]',
      bgColor: 'hover:bg-[#fbdfe2]/10',
      activeColor: 'bg-[#fbdfe2]/15 text-[#cc5c65] border-[#fbdfe2]',
    },
  ];

  return (
    <aside
      className="w-full lg:w-72 bg-[#faf8f4] border-b lg:border-b-0 lg:border-r border-[#eadeca] p-5 flex flex-col justify-between shrink-0"
      id="workspace-sidebar"
    >
      <div id="sidebar-top-group">
        {/* Dynamic Logo Branding Header with botanical flair */}
        <div className="flex items-center gap-2.5 pb-6 border-b border-[#f3ebde] mb-6" id="sidebar-branding">
          <div className="w-9 h-9 bg-gradient-to-br from-[#8ba180] to-[#5a7350] rounded-xl flex items-center justify-center shadow-sm select-none" id="brand-avatar">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-architect font-bold text-[#564e43] uppercase tracking-wider leading-none">
              Niki's Workspace
            </h2>
            <span className="text-[10px] font-mono text-[#a1927c]">Botanical Organizer v2.0</span>
          </div>
        </div>

        {/* Dynamic User Profile Card */}
        <div className="mb-6" id="sidebar-user-card">
          {user ? (
            <div className="bg-white border border-[#eadeca] p-3 rounded-2xl flex items-center justify-between gap-3 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-8 h-8 rounded-full border border-[#e3d5c1]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#cbd5e1] border border-[#a1927c] text-xs flex items-center justify-center font-mono font-bold text-[#564e43]">
                    {(user.displayName || 'N')[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-[#564e43] truncate leading-tight">
                    {user.displayName || 'Niki'}
                  </h4>
                  <p className="text-[9px] font-mono text-[#a1927c] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-[#ad9e8d] hover:text-[#cc5c65] hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                title="Log Out Cloud Sync"
                id="sidebar-sign-out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-[#fcfbf9] border border-dashed border-[#eadeca] p-3.5 rounded-2xl text-center">
              <p className="text-[11px] font-mono text-[#847864] mb-2.5">
                ☁️ Save tasks & drawings with real-time Google Backups!
              </p>
              <button
                onClick={onSignIn}
                className="w-full flex items-center justify-center gap-2 bg-[#4a7a96] hover:bg-[#345c75] text-white text-[11px] font-mono py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                id="sidebar-sign-in"
              >
                <User className="w-3.5 h-3.5" />
                <span>Backup to Cloud</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection List */}
        <nav className="flex flex-col gap-1.5" id="sidebar-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3 rounded-xl border border-transparent transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden group ${
                  isActive ? item.activeColor : `text-[#6f6453] ${item.bgColor}`
                }`}
                id={`sidebar-tab-btn-${item.id}`}
              >
                {/* Active Slider Line */}
                {isActive && (
                  <motion.div
                    layoutId="activeSideIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-current"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  />
                )}
                
                <Icon className={`w-4.5 h-4.5 mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? '' : item.color}`} />
                
                <div>
                  <div className="text-xs font-bold font-architect uppercase tracking-wider leading-none">
                    {item.label}
                  </div>
                  <div className="text-[10px] font-mono text-[#9e907a] mt-1 leading-none">
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Decorative Botanical Details footer */}
      <div className="mt-8 pt-4 border-t border-[#f3ebde] text-center" id="sidebar-botanical-footer">
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#a1927c]">
          <span>Flow minded</span>
          <Heart className="w-3 h-3 text-[#be6b73] fill-[#be6b73]/10" />
          <span>Sip water</span>
        </div>
      </div>
    </aside>
  );
}
