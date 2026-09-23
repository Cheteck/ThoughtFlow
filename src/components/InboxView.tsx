import React from 'react';
import { Thought, Project, Relation, ContradictionAlert } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { Inbox, Sparkles, FolderPlus, ArrowRight, CheckCircle2 } from 'lucide-react';

interface InboxViewProps {
  thoughts: Thought[];
  projects: Project[];
  relations: Relation[];
  contradictions: ContradictionAlert[];
  onUpdatePlacement: (thoughtId: string, projectIds: string[]) => void;
  onEditThought: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
  onOpenCapture: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  thoughts,
  projects,
  relations,
  contradictions,
  onUpdatePlacement,
  onEditThought,
  onDeleteThought,
  onOpenCapture,
}) => {
  // Inbox thoughts: either projectIds is empty OR status is 'inbox'
  const inboxThoughts = thoughts.filter(t => t.projectIds.length === 0 || t.status === 'inbox');

  return (
    <div className="space-y-6">
      {/* Inbox Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <Inbox className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Inbox & Pensées non classées</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Toutes les nouvelles pensées capturées en attente de contextualisation ou gardées intentionnellement en boîte générale. L'agent analyse chaque entrée.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 text-indigo-300 rounded-xl font-medium text-xs">
              {inboxThoughts.length} pensée{inboxThoughts.length > 1 ? 's' : ''} en attente
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Inbox thoughts */}
      {inboxThoughts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {inboxThoughts.map(thought => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              projects={projects}
              relations={relations}
              allThoughts={thoughts}
              contradictions={contradictions}
              onUpdatePlacement={onUpdatePlacement}
              onEditThought={onEditThought}
              onDeleteThought={onDeleteThought}
            />
          ))}
        </div>
      ) : (
        /* Empty Inbox State */
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-100">Votre Inbox est complètement rangée !</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Toutes vos pensées ont été automatiquement répertoriées dans vos projets par l'agent ou rangées.
            </p>
          </div>
          <button
            onClick={onOpenCapture}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25"
          >
            <Sparkles className="h-4 w-4" />
            <span>Capturer une nouvelle idée</span>
          </button>
        </div>
      )}
    </div>
  );
};
