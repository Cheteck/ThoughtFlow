import React, { useState } from 'react';
import { ContradictionAlert, Decision, Thought } from '../types';
import { 
  Sparkles, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Scale, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface ArbitrateContradictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contradiction: ContradictionAlert | null;
  idea?: Thought;
  decision?: Decision;
  onResolve: (contradictionId: string) => void;
}

export const ArbitrateContradictionModal: React.FC<ArbitrateContradictionModalProps> = ({
  isOpen,
  onClose,
  contradiction,
  idea,
  decision,
  onResolve
}) => {
  const [resolution, setResolution] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !contradiction) return null;

  const handleRunArbitration = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/contradictions/ai-arbitrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contradictionId: contradiction.id })
      });

      if (res.ok) {
        const data = await res.json();
        setResolution(data.resolution);
      }
    } catch (e) {
      alert("Échec de l'arbitrage IA");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyResolution = () => {
    onResolve(contradiction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Arbitrage Stratégique par Gemini 3.8</h2>
              <p className="text-xs text-slate-400">
                Résolution assistée de conflit d'idées et de décisions.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Conflict Details */}
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
            <span className="font-bold text-amber-300 block flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Conflit Détecté
            </span>
            <p className="text-slate-200 leading-relaxed">{contradiction.explanation}</p>
          </div>

          {/* AI Arbitration Output */}
          {resolution ? (
            <div className="p-4 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Recommandation d'Arbitrage Équilibré</span>
              </div>
              <p className="text-slate-100 leading-relaxed text-xs">{resolution}</p>
            </div>
          ) : (
            <button
              disabled={isLoading}
              onClick={handleRunArbitration}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calcul du compromis optimal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Générer un compromis d'arbitrage IA</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold"
          >
            Fermer
          </button>

          {resolution && (
            <button
              onClick={handleApplyResolution}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marquer le conflit comme résolu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
