import React, { useState, useEffect } from 'react';
import { Thought, Project } from '../types';
import { 
  Search, 
  Sparkles, 
  Folder, 
  Plus, 
  FileText, 
  Inbox, 
  Compass, 
  Bot, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  Zap,
  X
} from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  thoughts: Thought[];
  projects: Project[];
  onSelectThought: (thought: Thought) => void;
  onSelectProject: (projectId: string) => void;
  onNavigateTab: (tab: 'inbox' | 'projects' | 'explore' | 'agent' | 'admin') => void;
  onOpenBatchCapture: () => void;
  onOpenImport: () => void;
  onOpenTrash: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  thoughts,
  projects,
  onSelectThought,
  onSelectProject,
  onNavigateTab,
  onOpenBatchCapture,
  onOpenImport,
  onOpenTrash
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeThoughts = thoughts.filter(t => !t.deletedAt);
  const filteredThoughts = activeThoughts.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.content.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProjects = projects.filter(p => 
    !p.deletedAt && (
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.description.toLowerCase().includes(query.toLowerCase())
    )
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="relative border-b border-slate-800 p-3.5 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher une idée, projet, ou exécuter une commande (Cmd+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => { onClose(); onOpenBatchCapture(); }}
            className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl flex items-center gap-2 font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">Saisie Multi-Idées IA</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenImport(); }}
            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl flex items-center gap-2 font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Importer JSON / MD</span>
          </button>

          <button
            onClick={() => { onClose(); onNavigateTab('explore'); }}
            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl flex items-center gap-2 font-semibold transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Matrice Explore</span>
          </button>

          <button
            onClick={() => { onClose(); onOpenTrash(); }}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2 font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">Corbeille Notes</span>
          </button>
        </div>

        {/* Content Results */}
        <div className="p-3 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 block">
                Projets correspondant ({filteredProjects.length})
              </span>
              {filteredProjects.map(p => (
                <button
                  key={p.id}
                  onClick={() => { onClose(); onSelectProject(p.id); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg group-hover:bg-indigo-500/30">
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">{p.name}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{p.description}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono">
                    Ouvrir
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Thoughts Section */}
          {filteredThoughts.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 block">
                Pensées & Notes ({filteredThoughts.length})
              </span>
              {filteredThoughts.map(t => (
                <button
                  key={t.id}
                  onClick={() => { onClose(); onSelectThought(t); }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-800 text-slate-300 rounded-lg group-hover:bg-slate-700">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">{t.title}</span>
                      <span className="text-[11px] text-slate-400 line-clamp-1">{t.content}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-800 rounded-md">
                    {t.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && filteredThoughts.length === 0 && query.trim().length > 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              Aucun résultat pour "{query}". Essayez une autre recherche.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">↑↓</kbd> Naviguer</span>
            <span><kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">Enter</kbd> Sélectionner</span>
          </div>
          <span>ThoughtFlow AI Power Palette</span>
        </div>
      </div>
    </div>
  );
};
