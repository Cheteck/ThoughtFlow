import React from 'react';
import { Thought, Project } from '../types';
import { 
  Trash2, 
  RotateCcw, 
  X, 
  FileText, 
  Folder, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface TrashViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  thoughts: Thought[];
  projects: Project[];
  onRestoreThought: (thoughtId: string) => void;
  onPermanentDeleteThought: (thoughtId: string) => void;
}

export const TrashViewModal: React.FC<TrashViewModalProps> = ({
  isOpen,
  onClose,
  thoughts,
  projects,
  onRestoreThought,
  onPermanentDeleteThought
}) => {
  if (!isOpen) return null;

  const deletedThoughts = thoughts.filter(t => !!t.deletedAt);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Corbeille & Restauration (Soft Delete)</h2>
              <p className="text-xs text-slate-400">
                Les éléments supprimés restent récupérables à tout moment.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trash Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {deletedThoughts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Trash2 className="w-10 h-10 mx-auto text-slate-700" />
              <p className="text-xs font-semibold">Votre corbeille est actuellement vide.</p>
            </div>
          ) : (
            deletedThoughts.map(t => (
              <div 
                key={t.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200 block line-clamp-1">{t.title}</span>
                    <span className="text-[10px] text-slate-500 block">
                      Supprimé le {new Date(t.deletedAt!).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onRestoreThought(t.id)}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurer</span>
                  </button>

                  <button
                    onClick={() => onPermanentDeleteThought(t.id)}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 font-semibold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Supprimer Définititement</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
