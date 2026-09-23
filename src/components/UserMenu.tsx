import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, AppSettings } from '../types';
import { 
  User, 
  Settings, 
  CreditCard, 
  Sparkles, 
  LogOut, 
  ChevronDown, 
  Crown, 
  ShieldCheck, 
  Zap,
  BarChart3,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface UserMenuProps {
  user: UserProfile;
  onOpenSettings: () => void;
  onOpenPricing: () => void;
  onOpenAdmin?: () => void;
  onToggleRole?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onOpenSettings,
  onOpenPricing,
  onOpenAdmin,
  onToggleRole
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'team':
        return { label: 'Team Brain', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30 icon: Crown' };
      case 'pro':
        return { label: 'Pro Agent', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30 icon: Zap' };
      default:
        return { label: 'Free Starter', color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const badge = getPlanBadge(user.plan);

  // Usage percentage calculation
  const usageLimit = user.usage.aiAnalysesLimit;
  const usageUsed = user.usage.aiAnalysesUsed;
  const usagePercent = usageLimit === -1 ? 10 : Math.min(100, Math.round((usageUsed / usageLimit) * 100));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-left group"
      >
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all"
          />
          {user.plan !== 'free' && (
            <div className="absolute -top-1 -right-1 p-0.5 bg-amber-500 text-slate-950 rounded-full shadow-md">
              <Crown className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        <div className="hidden sm:block text-xs leading-tight pr-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span>{user.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{user.plan}</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
          
          {/* User Info Header */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <p className="font-bold text-sm text-slate-100 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {/* Quota Usage Bar */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3 text-indigo-400" />
                  <span>Analyses IA ce mois</span>
                </span>
                <span className="font-semibold text-slate-200">
                  {usageUsed} / {usageLimit === -1 ? '∞' : usageLimit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    usagePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-1 text-xs">
            {(user.role === 'admin' || user.role === 'superadmin') && onOpenAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAdmin();
                }}
                className="w-full p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg group-hover:bg-purple-500/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold block text-white">Centre Admin & Rôles</span>
                    <span className="text-[10px] text-purple-300 block">Gestion utilisateurs & métriques</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-500/30 text-purple-200 rounded-lg uppercase">
                  Admin
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenPricing();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-indigo-950/40 hover:text-indigo-300 text-slate-300 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block text-slate-100">Abonnement & Forfaits</span>
                  <span className="text-[10px] text-slate-400 block">Gérer votre formule SaaS</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-lg">
                {user.plan === 'free' ? 'Upgrade' : 'Gérer'}
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-slate-300 flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500/20">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block text-slate-100">Réglages & API Keys</span>
                  <span className="text-[10px] text-slate-400 block">IA, Thème, Export des données</span>
                </div>
              </div>
            </button>

            {onToggleRole && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onToggleRole();
                }}
                className="w-full p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 rounded-xl flex items-center justify-between transition-colors text-[11px] font-semibold"
              >
                <span>Changer Rôle Test (Rôle actuel : <strong>{user.role}</strong>)</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Footer logout / app status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>ThoughtFlow v2.4 SaaS</span>
            <button
              onClick={() => {
                alert("Déconnexion de la session de test ThoughtFlow AI.");
                setIsOpen(false);
              }}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
