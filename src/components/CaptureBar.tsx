import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle2, 
  HelpCircle, 
  Inbox, 
  AlertTriangle,
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import { Project, Thought } from '../types';

interface CaptureBarProps {
  onCapture: (content: string) => Promise<{ thought: Thought; analysis: any }>;
  projects: Project[];
  onConfirmPlacement: (thoughtId: string, projectIds: string[]) => Promise<void>;
  onCreateProjectFromSuggestion?: (name: string) => void;
}

export const CaptureBar: React.FC<CaptureBarProps> = ({
  onCapture,
  projects,
  onConfirmPlacement,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastCaptured, setLastCaptured] = useState<{ thought: Thought; analysis: any } | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await onCapture(content);
      setLastCaptured(res);
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickPlace = async (projectId: string) => {
    if (!lastCaptured) return;
    await onConfirmPlacement(lastCaptured.thought.id, [projectId]);
    setLastCaptured(prev => prev ? {
      ...prev,
      thought: { ...prev.thought, projectIds: [projectId], status: 'organized' }
    } : null);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/50 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 opacity-60"></div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Capture instantanée
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[10px]">Ctrl + Entrée</kbd>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Notez une pensée, une idée de fonctionnalité, une question, une hypothèse..."
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/70 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-3 bottom-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Analyse par l'agent...</span>
              </>
            ) : (
              <>
                <span>Capturer</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Live Agent Result Feedback */}
      {lastCaptured && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Case A: High Confidence Auto-Routed */}
          {lastCaptured.thought.confidence === 'high' && lastCaptured.thought.projectIds.length > 0 && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span>Organisé automatiquement</span>
                  <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">Forte confiance</span>
                </div>
                <p className="mt-1 text-slate-300">
                  Rattaché à : <span className="font-medium text-white">
                    {lastCaptured.thought.projectIds.map(id => projects.find(p => p.id === id)?.name).join(', ')}
                  </span>
                </p>
                {lastCaptured.thought.aiReasoning && (
                  <p className="mt-1 text-[11px] text-emerald-300/80 italic">
                    « {lastCaptured.thought.aiReasoning} »
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Case B: Medium Confidence / Multiple Possibilities */}
          {lastCaptured.thought.confidence === 'medium' && (
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-indigo-200">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-indigo-300">
                    Où souhaitez-vous placer cette idée ?
                  </div>
                  <p className="mt-0.5 text-slate-300 text-[11px]">
                    {lastCaptured.thought.clarificationQuestion || "L'agent identifie plusieurs projets potentiels pour cette pensée :"}
                  </p>
                  
                  {/* Candidates buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lastCaptured.thought.suggestedProjectIds?.map(projId => {
                      const proj = projects.find(p => p.id === projId);
                      if (!proj) return null;
                      return (
                        <button
                          key={projId}
                          onClick={() => handleQuickPlace(projId)}
                          className="px-3 py-1.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                        >
                          <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                          <span>{proj.name}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handleQuickPlace('')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all"
                    >
                      Garder dans l'Inbox
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Case C: Low Confidence / Inbox */}
          {lastCaptured.thought.confidence === 'low' && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-3">
              <Inbox className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-200">Enregistré dans l'Inbox</div>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  {lastCaptured.thought.aiReasoning || "L'agent a conservé cette idée générale. Elle émergera plus tard lorsqu'un contexte se dessinera."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
