import React, { useState } from 'react';
import { UserProfile, AppSettings, AIProvider } from '../types';
import { 
  X, 
  Settings, 
  User, 
  Key, 
  Download, 
  Check, 
  Cpu, 
  Globe, 
  Sliders,
  FileJson,
  ShieldCheck,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  settings: AppSettings;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  onSaveProfile: (profile: { name: string; email: string; avatarUrl: string }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  onSaveSettings,
  onSaveProfile
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'apikeys' | 'preferences' | 'export'>('profile');

  // Local form states
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  const [aiProvider, setAiProvider] = useState<AIProvider>(settings.aiProvider || 'google');
  const [aiModel, setAiModel] = useState(settings.aiModel || 'gemini-3.8-flash');
  const [sensitivity, setSensitivity] = useState(settings.autoClusterSensitivity);
  const [customKey, setCustomKey] = useState(settings.customApiKey || '');
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey || '');
  const [customEndpoint, setCustomEndpoint] = useState(settings.customEndpoint || '');
  const [notifications, setNotifications] = useState(settings.emailNotifications);
  const [autoBrain, setAutoBrain] = useState(settings.autoSynthesizeBrain);
  const [piiAnonymization, setPiiAnonymization] = useState(settings.enablePiiAnonymization ?? true);
  const [theme, setTheme] = useState(settings.theme);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ name, email, avatarUrl });
    triggerSuccess();
  };

  const handleSettingsSave = () => {
    onSaveSettings({
      aiProvider,
      aiModel,
      autoClusterSensitivity: sensitivity,
      customApiKey: customKey,
      openaiApiKey: openaiKey,
      anthropicApiKey: anthropicKey,
      customEndpoint,
      emailNotifications: notifications,
      autoSynthesizeBrain: autoBrain,
      enablePiiAnonymization: piiAnonymization,
      theme
    });
    triggerSuccess();
  };

  const handleAccountPurge = async () => {
    try {
      const res = await fetch('/api/user/delete-account', { method: 'POST' });
      if (res.ok) {
        setPurgeSuccess(true);
        setShowPurgeConfirm(false);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      console.error("Failed to purge account:", e);
    }
  };

  const triggerSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExportData = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Paramètres & Configuration Workspace</h2>
              <p className="text-xs text-slate-400">Gérez vos préférences IA, la sécurité RGPD et l'exportation des données.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Tabs */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-56 p-3 bg-slate-950/40 border-r border-slate-800 space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profil & Compte</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Moteur & Modèle IA</span>
            </button>

            <button
              onClick={() => setActiveTab('apikeys')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'apikeys' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Clé API & BYOK</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'preferences' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Workspace & RGPD</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                activeTab === 'export' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export & Sauvegardes</span>
            </button>
          </div>

          {/* Main Tab Panel */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {saveSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Modifications enregistrées avec succès !</span>
              </div>
            )}

            {purgeSuccess && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Données supprimées avec succès. Rechargement de l'application...</span>
              </div>
            )}

            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white">Informations Personnelles</h3>
                  <p className="text-slate-400 text-[11px]">Mettez à jour vos identifiants d'utilisateur.</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Adresse Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">URL Avatar (Photo de profil)</label>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-slate-400">
                  <span>Membre depuis : <strong className="text-slate-200">{user.memberSince}</strong></span>
                  <span className="text-indigo-400 font-semibold uppercase">Forfait {user.plan}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Mettre à jour le profil
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: AI ENGINE PREFERENCES */}
            {activeTab === 'ai' && (
              <div className="space-y-5 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white">Fournisseur & Moteur d'Analyse IA</h3>
                  <p className="text-slate-400 text-[11px]">Basculez librement entre Google Gemini, OpenAI, Anthropic Claude ou votre modèle local (Ollama / Endpoint Custom).</p>
                </div>

                {/* Provider Selector */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-300">Fournisseur d'Intelligence Artificielle</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'google', name: 'Google AI', badge: 'Recommandé', desc: 'Gemini 3.8 Flash / Pro' },
                      { id: 'openai', name: 'OpenAI', badge: 'GPT-4o', desc: 'GPT-4o & o3-mini' },
                      { id: 'anthropic', name: 'Anthropic', badge: 'Claude 3.5', desc: 'Sonnet & Haiku' },
                      { id: 'ollama', name: 'Ollama / Local', badge: 'Custom', desc: 'Llama, Mistral, Local' }
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setAiProvider(p.id as AIProvider);
                          if (p.id === 'google') setAiModel('gemini-3.8-flash');
                          if (p.id === 'openai') setAiModel('gpt-4o-mini');
                          if (p.id === 'anthropic') setAiModel('claude-3-5-sonnet');
                          if (p.id === 'ollama') setAiModel('llama3.3');
                        }}
                        className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                          aiProvider === p.id 
                            ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-lg' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>{p.name}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">{p.badge}</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model Selector based on provider */}
                <div className="space-y-3 pt-1">
                  <label className="block font-semibold text-slate-300">Modèle sélectionné ({aiProvider.toUpperCase()})</label>
                  
                  {aiProvider === 'google' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAiModel('gemini-3.8-flash')}
                        className={`p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                          aiModel === 'gemini-3.8-flash'
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>Gemini 3.8 Flash</span>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">Ultra-Rapide</span>
                        </div>
                        <p className="text-[11px]">Capture continue et classement d'idées en temps réel.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiModel('gemini-3.8-pro')}
                        className={`p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                          aiModel === 'gemini-3.8-pro'
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>Gemini 3.8 Pro</span>
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">Raisonnement Pro</span>
                        </div>
                        <p className="text-[11px]">Résolution complexe des contradictions et analyse stratégique.</p>
                      </button>
                    </div>
                  )}

                  {aiProvider === 'openai' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast & Light' },
                        { id: 'gpt-4o', name: 'GPT-4o', tag: 'High Accuracy' },
                        { id: 'o3-mini', name: 'o3-mini', tag: 'Reasoning' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAiModel(m.id)}
                          className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                            aiModel === m.id 
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold text-white text-xs">{m.name}</div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">{m.tag}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {aiProvider === 'anthropic' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Excellente capacité de synthèse et rédaction.' },
                        { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', desc: 'Reponses concises et rapides.' }
                      ].map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAiModel(m.id)}
                          className={`p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                            aiModel === m.id 
                              ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold text-white">{m.name}</div>
                          <p className="text-[10px] text-slate-400">{m.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {aiProvider === 'ollama' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Ex: llama3.3, mistral-large, deepseek-r1"
                        value={aiModel}
                        onChange={(e) => setAiModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-500">Saisissez le nom exact du modèle hébergé sur votre serveur Ollama ou VLLM.</p>
                    </div>
                  )}
                </div>

                {/* Cluster Sensitivity */}
                <div className="space-y-2 pt-2">
                  <label className="block font-semibold text-slate-300">Sensibilité du clustering automatique (Projets émergents)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map(sens => (
                      <button
                        key={sens}
                        type="button"
                        onClick={() => setSensitivity(sens)}
                        className={`p-2.5 rounded-xl border text-center capitalize font-semibold transition-all ${
                          sensitivity === sens 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {sens === 'low' ? 'Prudente' : sens === 'medium' ? 'Équilibrée' : 'Agressive'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Synthesize Brain */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Synthèse automatique du Cerveau de Projet</span>
                    <span className="text-[11px] text-slate-400 block">Recalculer la trajectoire du projet après chaque décision ajoutée.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBrain}
                    onChange={(e) => setAutoBrain(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSettingsSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Enregistrer les préférences IA
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: API KEYS & MULTI-PROVIDER BYOK */}
            {activeTab === 'apikeys' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white">Gestion des Clés API & BYOK (Multi-Providers)</h3>
                  <p className="text-slate-400 text-[11px]">Configurez vos propres clés API chiffrées en AES-256 pour Google, OpenAI, Anthropic ou votre propre serveur local.</p>
                </div>

                {/* Google Key */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>Clé API Google AI (Gemini)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">AES-256 Encrypted</span>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* OpenAI Key */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>Clé API OpenAI (GPT-4o / o3)</span>
                    </div>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-proj-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Anthropic Key */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-amber-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      <span>Clé API Anthropic (Claude 3.5)</span>
                    </div>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Custom Ollama Endpoint */}
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-purple-400 font-semibold">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Endpoint Custom / Ollama Local URL</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/v1 ou https://my-custom-llm.com/v1"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSettingsSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Sauvegarder les clés API & Endpoints
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: PREFERENCES & WORKSPACE RGPD */}
            {activeTab === 'preferences' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white">Workspace & Conformité RGPD</h3>
                  <p className="text-slate-400 text-[11px]">Personnalisez la confidentialité des données et les paramètres globaux.</p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-slate-200 block">Anonymisation PII automatique (RGPD)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">Masquer automatiquement les numéros de téléphone, cartes bancaires et adresses email avant envoi aux LLM externes.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={piiAnonymization}
                      onChange={(e) => setPiiAnonymization(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-800"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-200 block">Notifications par Email</span>
                      <span className="text-[11px] text-slate-400 block">Alerte immédiate en cas de contradiction stratégique majeure.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                    />
                  </div>

                  {/* RGPD Right to be Forgotten Section */}
                  <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-400 font-semibold">
                        <Trash2 className="w-4 h-4" />
                        <span>Droit à l'Oubli RGPD (Article 17)</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Purgez immédiatement et définitivement l'intégralité de vos pensées, projets, décisions et graphes de données de nos serveurs.
                    </p>

                    {!showPurgeConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowPurgeConfirm(true)}
                        className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold rounded-xl border border-rose-500/40 transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Demander la purge définitive des données</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-rose-950 border border-rose-500/50 rounded-xl space-y-2">
                        <p className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>Confirmer la suppression irréversible ?</span>
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Cette action effacera immédiatement l'ensemble de votre base de données et ne pourra pas être annulée.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleAccountPurge}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            Oui, Tout Supprimer
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPurgeConfirm(false)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSettingsSave}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors"
                  >
                    Enregistrer le Workspace
                  </button>
                </div>
              </div>
            )}

            {/* TAB 5: EXPORT & BACKUP */}
            {activeTab === 'export' && (
              <div className="space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-white">Sauvegarde & Portabilité des Données</h3>
                  <p className="text-slate-400 text-[11px]">Téléchargez l'intégralité de votre graphe de pensées et de projets au format JSON standard.</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                    <FileJson className="w-5 h-5" />
                    <span>Exportation complète JSON</span>
                  </div>
                  <p className="text-slate-300">
                    Inclut tous les projets, pensées, décisions, pivots historiques, graphes de relations et cerveaux synthétisés.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger la sauvegarde (.json)</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
