import React, { useState } from 'react';
import { Project, Thought, Decision, Relation, ContradictionAlert, ProjectPivot } from '../types';
import { ThoughtCard } from './ThoughtCard';
import { ProjectBrainView } from './ProjectBrainView';
import { 
  Folder, 
  FolderPlus, 
  Plus, 
  Utensils, 
  Mail, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Lightbulb, 
  HelpCircle,
  Brain,
  Edit,
  Trash2,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface ProjectsViewProps {
  projects: Project[];
  thoughts: Thought[];
  decisions: Decision[];
  relations: Relation[];
  contradictions: ContradictionAlert[];
  pivots: ProjectPivot[];
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdatePlacement: (thoughtId: string, projectIds: string[]) => void;
  onEditThought: (thought: Thought) => void;
  onDeleteThought: (thoughtId: string) => void;
  onCreateDecision: (projectId: string) => void;
  onAddPivot: (pivotData: { projectId: string; title: string; description: string; previousVision: string; newVision: string }) => void;
  onAddThoughtFromQuestion: (questionText: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  thoughts,
  decisions,
  relations,
  contradictions,
  pivots,
  onCreateProject,
  onEditProject,
  onDeleteProject,
  onUpdatePlacement,
  onEditThought,
  onDeleteThought,
  onCreateDecision,
  onAddPivot,
  onAddThoughtFromQuestion,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectSubTab, setProjectSubTab] = useState<'thoughts' | 'brain'>('thoughts');
  const [filterType, setFilterType] = useState<string>('all');

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Helper for project color styling
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/60';
      case 'amber':
        return 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:border-amber-500/60';
      case 'indigo':
        return 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/60';
      case 'purple':
        return 'border-purple-500/30 text-purple-400 bg-purple-500/10 hover:border-purple-500/60';
      case 'rose':
        return 'border-rose-500/30 text-rose-400 bg-rose-500/10 hover:border-rose-500/60';
      case 'cyan':
        return 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10 hover:border-cyan-500/60';
      default:
        return 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/60';
    }
  };

  // Helper to get Project Icon
  const getProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return Utensils;
      case 'Mail': return Mail;
      case 'BookOpen': return BookOpen;
      case 'Sparkles': return Sparkles;
      default: return Folder;
    }
  };

  // Filtered thoughts for detail view
  const projectThoughts = selectedProjectId
    ? thoughts.filter(t => t.projectIds.includes(selectedProjectId) && (filterType === 'all' || t.type === filterType))
    : [];

  const projectDecisions = selectedProjectId
    ? decisions.filter(d => d.projectId === selectedProjectId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      {!selectedProject ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Projets & Contextes</h1>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl">
              Chaque projet dispose de son propre **Cerveau de Projet (Project Brain)** synthétisant sa trajectoire, ses questions ouvertes et ses pivots historiques.
            </p>
          </div>

          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg transition-all"
          >
            <FolderPlus className="h-4 w-4" />
            <span>Nouveau projet</span>
          </button>
        </div>
      ) : (
        /* Selected Project Workspace Header */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à tous les projets</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditProject(selectedProject)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Editer le projet</span>
              </button>
              <button
                onClick={() => {
                  onDeleteProject(selectedProject.id);
                  setSelectedProjectId(null);
                }}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-2xl border ${getColorClasses(selectedProject.color)}`}>
              {React.createElement(getProjectIcon(selectedProject.icon), { className: 'h-6 w-6' })}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
              <p className="text-slate-300 text-sm">{selectedProject.description || "Aucune description de projet renseignée."}</p>
            </div>
          </div>

          {/* Sub-tabs inside selected project */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
            <button
              onClick={() => setProjectSubTab('thoughts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                projectSubTab === 'thoughts' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>Pensées ({thoughts.filter(t => t.projectIds.includes(selectedProject.id)).length})</span>
            </button>

            <button
              onClick={() => setProjectSubTab('brain')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                projectSubTab === 'brain' 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Brain className="h-4 w-4 text-purple-400" />
              <span>Cerveau de Projet (Brain)</span>
            </button>
          </div>

          {/* Filter tabs inside thoughts view */}
          {projectSubTab === 'thoughts' && (
            <div className="pt-2 flex items-center gap-2 overflow-x-auto">
              {['all', 'idea', 'question', 'hypothesis', 'decision', 'task', 'note'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    filterType === type 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {type === 'all' ? 'Toutes les pensées' : type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grid of Projects Overview OR Detailed Project Workspace */}
      {!selectedProject ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            const countThoughts = thoughts.filter(t => t.projectIds.includes(proj.id)).length;
            const countDecisions = decisions.filter(d => d.projectId === proj.id).length;
            const IconComp = getProjectIcon(proj.icon);

            return (
              <div
                key={proj.id}
                onClick={() => {
                  setSelectedProjectId(proj.id);
                  setProjectSubTab('thoughts');
                }}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${getColorClasses(proj.color)}`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {countThoughts} idée{countThoughts > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-lg group-hover:text-indigo-300 transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 mt-1">
                      {proj.description || 'Aucune description'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> {countDecisions} décision{countDecisions > 1 ? 's' : ''}
                  </span>
                  <span className="text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <Brain className="h-3.5 w-3.5" /> Cerveau →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : projectSubTab === 'brain' ? (
        /* Render Project Brain Synthesis Dashboard */
        <ProjectBrainView
          project={selectedProject}
          thoughts={thoughts.filter(t => t.projectIds.includes(selectedProject.id))}
          decisions={decisions.filter(d => d.projectId === selectedProject.id)}
          pivots={pivots}
          onAddPivot={onAddPivot}
          onAddThoughtFromQuestion={onAddThoughtFromQuestion}
        />
      ) : (
        /* Render project ideas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectThoughts.length > 0 ? (
            projectThoughts.map(thought => (
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
            ))
          ) : (
            <div className="col-span-full bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              Aucune idée ne correspond à ce filtre pour ce projet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
