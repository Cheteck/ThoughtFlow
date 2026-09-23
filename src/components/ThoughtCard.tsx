import React, { useState } from 'react';
import { 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  Compass, 
  CheckCircle, 
  CheckSquare, 
  Brain,
  Folder,
  Tag,
  Sparkles,
  AlertTriangle,
  Link as LinkIcon,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Thought, Project, ThoughtType, Relation, Decision, ContradictionAlert } from '../types';

interface ThoughtCardProps {
  thought: Thought;
  projects: Project[];
  relations?: Relation[];
  allThoughts?: Thought[];
  contradictions?: ContradictionAlert[];
  onUpdatePlacement: (thoughtId: string, projectIds: string[]) => void;
  onEditThought: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
  onSelectThought?: (thought: Thought) => void;
}

export const ThoughtCard: React.FC<ThoughtCardProps> = ({
  thought,
  projects,
  relations = [],
  allThoughts = [],
  contradictions = [],
  onUpdatePlacement,
  onEditThought,
  onDeleteThought,
  onSelectThought
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  // Helper for type badges
  const getTypeBadge = (type: ThoughtType) => {
    switch (type) {
      case 'idea':
        return { label: 'Idée', icon: Lightbulb, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' };
      case 'note':
        return { label: 'Note', icon: FileText, color: 'text-slate-300 bg-slate-400/10 border-slate-400/30' };
      case 'question':
        return { label: 'Question', icon: HelpCircle, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' };
      case 'hypothesis':
        return { label: 'Hypothèse', icon: Compass, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
      case 'decision':
        return { label: 'Décision', icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
      case 'task':
        return { label: 'Tâche', icon: CheckSquare, color: 'text-rose-400 bg-rose-400/10 border-rose-400/30' };
      case 'reflection':
        return { label: 'Réflexion', icon: Brain, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' };
      default:
        return { label: 'Pensée', icon: Lightbulb, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' };
    }
  };

  const typeInfo = getTypeBadge(thought.type);
  const TypeIcon = typeInfo.icon;

  const assignedProjects = projects.filter(p => thought.projectIds.includes(p.id));
  const relatedLinks = relations.filter(r => r.sourceId === thought.id || r.targetId === thought.id);
  const activeContradictions = contradictions.filter(c => c.ideaId === thought.id && !c.resolved);

  const toggleProjectAssignment = (projectId: string) => {
    let newProjectIds: string[];
    if (thought.projectIds.includes(projectId)) {
      newProjectIds = thought.projectIds.filter(id => id !== projectId);
    } else {
      newProjectIds = [...thought.projectIds, projectId];
    }
    onUpdatePlacement(thought.id, newProjectIds);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-950/40 transition-all group flex flex-col justify-between">
      <div>
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${typeInfo.color}`}>
              <TypeIcon className="h-3.5 w-3.5" />
              <span>{typeInfo.label}</span>
            </span>

            {/* AI Confidence badge */}
            {thought.confidence && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                thought.confidence === 'high' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : thought.confidence === 'medium'
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {thought.confidence === 'high' ? 'Auto-placé' : thought.confidence === 'medium' ? 'Confiance moyenne' : 'Inbox'}
              </span>
            )}

            {/* Contradiction Warning Badge */}
            {activeContradictions.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-medium rounded-md animate-pulse">
                <AlertTriangle className="h-3 w-3 text-amber-400" />
                <span>Contradiction</span>
              </span>
            )}
          </div>

          {/* Action Menu Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditThought(thought)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg text-xs"
              title="Modifier"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDeleteThought(thought.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Content */}
        <h3 
          onClick={() => onSelectThought && onSelectThought(thought)}
          className="font-semibold text-slate-100 text-base mb-1.5 cursor-pointer hover:text-indigo-300 transition-colors line-clamp-2"
        >
          {thought.title}
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap line-clamp-4">
          {thought.content}
        </p>

        {/* Contradiction Box if present */}
        {activeContradictions.length > 0 && (
          <div className="mb-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            <div className="font-semibold flex items-center gap-1.5 text-amber-300 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Avertissement de l'agent :</span>
            </div>
            <p className="text-amber-200/90 text-[11px] leading-normal">
              {activeContradictions[0].explanation}
            </p>
          </div>
        )}

        {/* Project Belonging Tags */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium text-[11px] text-slate-400">
              <Folder className="h-3.5 w-3.5 text-slate-500" /> Projets associés ({assignedProjects.length})
            </span>
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium hover:underline flex items-center gap-1"
            >
              <span>Gérer</span>
              {showProjectSelector ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {assignedProjects.length > 0 ? (
              assignedProjects.map(proj => (
                <span
                  key={proj.id}
                  className="px-2.5 py-1 bg-indigo-950/60 text-indigo-200 border border-indigo-500/30 text-xs font-medium rounded-lg flex items-center gap-1"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                  <span>{proj.name}</span>
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 bg-slate-950/60 text-slate-400 border border-slate-800 text-xs rounded-lg italic">
                📥 Dans Inbox generale
              </span>
            )}
          </div>

          {/* Project Multi-select Dropdown */}
          {showProjectSelector && (
            <div className="mt-2 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 animate-in fade-in duration-200">
              <p className="text-[11px] text-slate-400 font-medium mb-1">Sélectionnez 1 ou plusieurs projets :</p>
              {projects.map(proj => {
                const isSelected = thought.projectIds.includes(proj.id);
                return (
                  <button
                    key={proj.id}
                    onClick={() => toggleProjectAssignment(proj.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{proj.name}</span>
                    {isSelected && <CheckCircle className="h-3.5 w-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Agent Reasoning & Relations snippet */}
        {thought.aiReasoning && (
          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-start gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="italic line-clamp-2">Agent: « {thought.aiReasoning} »</span>
          </div>
        )}
      </div>

      {/* Footer info: date */}
      <div className="mt-3 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
        <span>{new Date(thought.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        {relatedLinks.length > 0 && (
          <span className="flex items-center gap-1 text-indigo-400 font-medium">
            <LinkIcon className="h-3 w-3" /> {relatedLinks.length} lien{relatedLinks.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
