import React, { useState } from 'react';
import { 
  Zap, 
  FileText, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ListPlus
} from 'lucide-react';
import { Thought } from '../types';

interface BatchCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCaptured: (newThoughts: Thought[]) => void;
}

export const BatchCaptureModal: React.FC<BatchCaptureModalProps> = ({
  isOpen,
  onClose,
  onBatchCaptured
}) => {
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcess = async () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/thoughts/batch-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText })
      });

      if (res.ok) {
        const data = await res.json();
        onBatchCaptured(data.thoughts || []);
        setRawText('');
        onClose();
      } else {
        const err = await res.json();
        setError(err.error || 'Erreur lors de la segmentation.');
      }
    } catch (e) {
      setError('Impossible de joindre le serveur pour la segmentation IA.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingestion Multi-Pensées & Comptes-Rendus</h2>
              <p className="text-xs text-slate-400">
                Collez un compte-rendu de réunion ou un ramassis d'idées : Gemini 3.8 les découpera automatiquement.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Texte brut, Notes de réunion ou Brainstorming
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Exemple :\n- Décision : On bascule l'interface sur Gemini 3.8 Flash dès lundi.\n- Tâche : Valider les permissions Firebase pour la gestion des utilisateurs.\n- Idée : Ajouter un mode de comparaison de décisions concurrentes.\n- Question : Quel est le budget API mensuel cible ?`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
            />
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Gemini 3.8 Flash va créer des entrées individuelles avec types et tags déduits.</span>
            </span>
            <span className="font-mono text-[10px] text-slate-400">~150ms par segment</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 font-semibold"
          >
            Annuler
          </button>
          <button
            disabled={isProcessing || !rawText.trim()}
            onClick={handleProcess}
            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Segmentation IA en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Exécuter la Segmentation Multi-Pensées</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
