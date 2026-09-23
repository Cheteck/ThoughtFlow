import React from 'react';
import { UserProfile } from '../types';
import { UserMenu } from './UserMenu';
import { 
  Inbox, 
  FolderKanban, 
  Compass, 
  Bot, 
  Plus, 
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Upload,
  Trash2,
  Command
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'inbox' | 'projects' | 'explore' | 'agent' | 'admin';
  setActiveTab: (tab: 'inbox' | 'projects' | 'explore' | 'agent' | 'admin') => void;
  inboxCount: number;
  contradictionCount: number;
  clusterCount: number;
  onOpenCapture: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onToggleRole?: () => void;
  onOpenCommandPalette: () => void;
  onOpenBatchCapture: () => void;
  onOpenImportExport: () => void;
  onOpenTrash: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  inboxCount,
  contradictionCount,
  clusterCount,
  onOpenCapture,
  searchQuery,
  setSearchQuery,
  user,
  onOpenSettings,
  onOpenPricing,
  onToggleRole,
  onOpenCommandPalette,
  onOpenBatchCapture,
  onOpenImportExport,
  onOpenTrash
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('inbox')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-[2px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                ThoughtFlow
              </span>
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                SaaS
              </span>
            </div>
          </div>

          {/* Command Palette Button / Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium transition-all group"
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rechercher ou exécuter...</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'inbox'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Inbox</span>
              {inboxCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
                  {inboxCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
              <span className="hidden sm:inline">Projets</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'explore'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span className="hidden sm:inline">Explorer</span>
              {(contradictionCount > 0 || clusterCount > 0) && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('agent')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'agent'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bot className="h-4 w-4 text-purple-400" />
              <span className="hidden sm:inline">Agent</span>
            </button>

            {(user.role === 'admin' || user.role === 'superadmin') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                    : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border border-purple-500/20'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-purple-300" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </nav>

          {/* Right side: Tools & Capture & User Menu */}
          <div className="flex items-center gap-1.5">
            {/* Quick Action Tools */}
            <button
              onClick={onOpenBatchCapture}
              className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/30 rounded-xl transition-all"
              title="Saisie Multi-Idées / Compte-rendu"
            >
              <Zap className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenImportExport}
              className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 rounded-xl transition-all"
              title="Import / Export"
            >
              <Upload className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenTrash}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 rounded-xl transition-all"
              title="Corbeille (Soft Delete)"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onOpenCapture}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0 ml-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">Capturer</span>
            </button>

            {/* User Profile Dropdown Menu */}
            <UserMenu
              user={user}
              onOpenSettings={onOpenSettings}
              onOpenPricing={onOpenPricing}
              onOpenAdmin={() => setActiveTab('admin')}
              onToggleRole={onToggleRole}
            />
          </div>

        </div>
      </div>
    </header>
  );
};

