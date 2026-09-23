import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  SystemUser, 
  AdminAuditLog, 
  AdminSystemMetrics, 
  UserRole, 
  PlanType 
} from '../types';
import { 
  ShieldCheck, 
  Users, 
  BarChart3, 
  Lock, 
  Cpu, 
  Activity, 
  UserPlus, 
  Search, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Crown, 
  Zap, 
  DollarSign, 
  FileText, 
  Check, 
  LogOut,
  Sparkles
} from 'lucide-react';

interface AdminViewProps {
  currentUser: UserProfile;
  onToggleMyRole: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  onToggleMyRole
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'analytics' | 'audit' | 'flags'>('users');
  const [metrics, setMetrics] = useState<AdminSystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters for user management
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Success alert
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Feature Flags State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [requireByok, setRequireByok] = useState(false);
  const [defaultModel, setDefaultModel] = useState<'gemini-3.8-flash' | 'gemini-3.8-pro'>('gemini-3.8-flash');

  useEffect(() => {
    fetchAdminMetrics();
  }, []);

  const fetchAdminMetrics = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Erreur lors du chargement des données administrateur.');
      }
    } catch (e) {
      setErrorMsg('Impossible de joindre le serveur.');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle Changing User Role
  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(prev => prev ? {
          ...prev,
          users: data.users,
          auditLogs: data.auditLogs,
          activeAdmins: data.users.filter((u: SystemUser) => u.role === 'admin' || u.role === 'superadmin').length
        } : null);
        showToast(`Rôle de l'utilisateur mis à jour vers ${newRole.toUpperCase()}`);
      }
    } catch (err) {
      alert("Échec de la modification du rôle");
    }
  };

  // Handle Changing User Subscription Plan
  const handleChangePlan = async (userId: string, newPlan: PlanType) => {
    try {
      const res = await fetch('/api/admin/users/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPlan })
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(prev => prev ? {
          ...prev,
          users: data.users,
          auditLogs: data.auditLogs
        } : null);
        showToast(`Forfait mis à jour vers ${newPlan.toUpperCase()}`);
      }
    } catch (err) {
      alert("Échec de la modification du forfait");
    }
  };

  // Handle Account Suspension / Activation
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(prev => prev ? {
          ...prev,
          users: data.users,
          auditLogs: data.auditLogs
        } : null);
        showToast(`Statut du compte changé vers ${newStatus.toUpperCase()}`);
      }
    } catch (err) {
      alert("Échec du changement de statut");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm font-semibold">Chargement du Panneau d'Administration SaaS...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-8 bg-rose-950/40 border border-rose-500/30 rounded-2xl max-w-2xl mx-auto my-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <div>
          <h3 className="text-lg font-bold text-white">Accès Réservé aux Administrateurs</h3>
          <p className="text-xs text-rose-300 mt-1">{errorMsg}</p>
        </div>
        <button
          onClick={onToggleMyRole}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          Activer le Rôle Administrateur pour Test
        </button>
      </div>
    );
  }

  const filteredUsers = metrics?.users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">Centre de Contrôle Administration & Rôles</h1>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase rounded-full">
                  Admin Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gérez les privilèges d'accès, la gouvernance utilisateur, les forfaits SaaS et la télémétrie Gemini 3.8.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Role Toggle Test */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gemini 3.8 API : <strong>Opérationnel ({metrics?.geminiLatencyMs}ms)</strong></span>
          </div>

          <button
            onClick={onToggleMyRole}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            title="Passez temporairement du mode Admin au mode Utilisateur standard pour tester la visibilité"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Basculer en Mode User Standard</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Revenu Mensuel (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics?.mrr}€</div>
          <p className="text-[10px] text-emerald-400 font-semibold">+18% ce mois-ci</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Utilisateurs Totaux</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics?.totalUsers}</div>
          <p className="text-[10px] text-indigo-300">{metrics?.activeAdmins} Administrateurs</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Analyses IA Capturées</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics?.totalThoughtsCaptured}</div>
          <p className="text-[10px] text-purple-300">{metrics?.aiAnalysesThisMonth} requêtes ce mois</p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Projets & Pivots Totaux</span>
            <BarChart3 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{metrics?.totalProjectsCreated}</div>
          <p className="text-[10px] text-slate-400">Espaces de pensée actifs</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Gestion des Rôles & Utilisateurs ({metrics?.users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Santé Système & Ventes</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-3 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Journal d'Audit Sécurité ({metrics?.auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`px-4 py-3 font-semibold text-xs border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'flags'
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Feature Flags Plateforme</span>
        </button>
      </div>

      {/* TAB 1: USERS & ROLES MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium">Filtrer Rôle:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Admins</option>
                <option value="user">Utilisateurs</option>
              </select>

              <span className="text-slate-400 font-medium ml-2">Statut:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>

          {/* User Role Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Rôle Administrateur</th>
                    <th className="py-3 px-4">Forfait SaaS</th>
                    <th className="py-3 px-4">Statut Compte</th>
                    <th className="py-3 px-4">Analyses IA</th>
                    <th className="py-3 px-4">Dernière Activité</th>
                    <th className="py-3 px-4 text-right">Actions Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        {/* User Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelf && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                                    Vous
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none transition-all cursor-pointer ${
                              u.role === 'admin' || u.role === 'superadmin'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}
                          >
                            <option value="user">Utilisateur Standard</option>
                            <option value="admin">Administrateur App</option>
                          </select>
                        </td>

                        {/* Plan Selector */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.plan}
                            onChange={(e) => handleChangePlan(u.id, e.target.value as PlanType)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                              u.plan === 'team'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : u.plan === 'pro'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-slate-950 text-slate-400 border-slate-800'
                            }`}
                          >
                            <option value="free">Free Starter</option>
                            <option value="pro">Pro Agent (19€)</option>
                            <option value="team">Team Brain (49€)</option>
                          </select>
                        </td>

                        {/* Account Status Badge */}
                        <td className="py-3.5 px-4">
                          {u.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Actif</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              <span>Suspendu</span>
                            </span>
                          )}
                        </td>

                        {/* Usage Metrics */}
                        <td className="py-3.5 px-4 text-slate-300 font-mono">
                          {u.analysesCount} req.
                        </td>

                        {/* Last Active */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {u.lastActive}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                              isSelf
                                ? 'opacity-30 cursor-not-allowed text-slate-600'
                                : u.status === 'active'
                                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {u.status === 'active' ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM ANALYTICS & SUBSCRIPTION HEALTH */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Subscription Tier Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Répartition des Abonnements SaaS</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-purple-300">Team Brain (49€/m)</span>
                  <span className="text-white">{metrics?.activeSubscriptions.team} abonnés</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-300">Pro Agent (19€/m)</span>
                  <span className="text-white">{metrics?.activeSubscriptions.pro} abonnés</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-400">Free Starter (0€)</span>
                  <span className="text-white">{metrics?.activeSubscriptions.free} abonnés</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini AI Engine Health */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Performances du Moteur Gemini 3.8</span>
            </h3>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Statut SDK Server-side :</span>
                <span className="text-emerald-400 font-bold">@google/genai Prêt</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Temps de réponse moyen :</span>
                <span className="text-slate-200 font-mono font-bold">142 ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Taux de succès des synthèses :</span>
                <span className="text-emerald-400 font-bold">99.8%</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Journal d'Audit & Modifications de Sécurité</h3>
            <span className="text-xs text-slate-400">Mise à jour en temps réel</span>
          </div>

          <div className="space-y-2">
            {metrics?.auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    log.type === 'role' ? 'bg-purple-500/20 text-purple-300' :
                    log.type === 'subscription' ? 'bg-amber-500/20 text-amber-300' :
                    log.type === 'security' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">{log.details}</span>
                    <span className="text-[11px] text-slate-400">{log.userEmail} • {new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md uppercase">
                  {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white">Feature Flags & Configuration Globale</h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Mode Maintenance Système</span>
                <span className="text-[11px] text-slate-400 block">Restreindre temporairement l'accès aux administrateurs.</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
              />
            </div>

            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Exiger Clé BYOK Client</span>
                <span className="text-[11px] text-slate-400 block">Demander une clé Google AI Studio individuelle pour le forfait Free.</span>
              </div>
              <input
                type="checkbox"
                checked={requireByok}
                onChange={(e) => setRequireByok(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
