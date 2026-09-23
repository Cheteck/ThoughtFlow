import React, { useState, useEffect } from 'react';
import { Project, ProjectBrain, ProjectPivot, Decision, Thought } from '../types';
import { 
  Brain, 
  Sparkles, 
  HelpCircle, 
  Compass, 
  CheckCircle, 
  GitCommit, 
  Loader2, 
  Plus, 
  ArrowRight,
  TrendingUp,
  History,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface ProjectBrainViewProps {
  project: Project;
  thoughts: Thought[];
  decisions: Decision[];
  pivots: ProjectPivot[];
  onAddPivot: (pivotData: { projectId: string; title: string; description: string; previousVision: string; newVision: string }) => void;
  onAddThoughtFromQuestion: (questionText: string) => void;
}

export const ProjectBrainView: React.FC<ProjectBrainViewProps> = ({
  project,
  thoughts,
  decisions,
  pivots,
  onAddPivot,
  onAddThoughtFromQuestion
}) => {
  const [brain, setBrain] = useState<ProjectBrain | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(true);
  const [showPivotForm, setShowPivotForm] = useState(false);

  // Pivot form fields
  const [pivotTitle, setPivotTitle] = useState('');
  const [pivotDesc, setPivotDesc] = useState('');
  const [prevVision, setPrevVision] = useState('');
  const [newVision, setNewVision] = useState('');

  const projectPivots = pivots.filter(p => p.projectId === project.id);

  const fetchBrainSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/projects/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });
      if (res.ok) {
        const data = await res.json();
        setBrain(data.brain);
      }
    } catch (err) {
      console.error("Failed to load project brain:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    fetchBrainSynthesis();
  }, [project.id]);

  const handlePivotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pivotTitle.trim()) return;
    onAddPivot({
      projectId: project.id,
      title: pivotTitle.trim(),
      description: pivotDesc.trim(),
      previousVision: prevVision.trim(),
      newVision: newVision.trim()
    });
    setPivotTitle('');
    setPivotDesc('');
    setPrevVision('');
    setNewVision('');
    setShowPivotForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Project Brain Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Cerveau Synthétique du Projet</span>
                  <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] rounded-full uppercase font-bold tracking-wider">
                    Mémoire Évolutive
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Synthèse vivante de la trajectoire, des questions ouvertes, des hypothèses et des pivots historiques de {project.name}.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchBrainSynthesis}
            disabled={isSynthesizing}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isSynthesizing ? 'Recalcul...' : 'Régénérer la synthèse'}</span>
          </button>
        </div>
      </div>

      {isSynthesizing ? (
        <div className="p-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
          <Loader2 className="h-8 w-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-300 font-medium">L'agent analyse l'évolution de la pensée du projet...</p>
        </div>
      ) : brain ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column: Vision, Focus & Questions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vision & Trajectory Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider">
                <TrendingUp className="h-4 w-4" />
                <span>Vision Actuelle & Trajectoire</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {brain.visionSummary}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="font-semibold text-purple-400">Axe de travail actuel :</span>
                <span>{brain.currentFocus}</span>
              </div>
            </div>

            {/* Open Strategic Questions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4" />
                  <span>Questions Stratégiques Non Résolues</span>
                </div>
                <span className="text-xs text-slate-500">{brain.openQuestions.length} ouvertes</span>
              </div>

              <div className="space-y-2">
                {brain.openQuestions.map((q, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950 border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <p className="text-cyan-200 font-medium">{q}</p>
                    <button
                      onClick={() => onAddThoughtFromQuestion(q)}
                      className="px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60 rounded-lg text-[11px] font-semibold shrink-0 transition-colors"
                    >
                      + Explorer
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Hypotheses */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
                <Compass className="h-4 w-4" />
                <span>Hypothèses Clés en Cours</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {brain.activeHypotheses.map((h, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-purple-500/20 rounded-xl text-xs text-purple-200 font-medium">
                    ⚡ {h}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Side Column: Pivots Timeline & Key Decisions */}
          <div className="space-y-6">
            
            {/* Timeline of Pivots */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wider">
                  <GitCommit className="h-4 w-4" />
                  <span>Historique des Pivots</span>
                </div>
                <button
                  onClick={() => setShowPivotForm(!showPivotForm)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Pivot</span>
                </button>
              </div>

              {/* Pivot Form inline */}
              {showPivotForm && (
                <form onSubmit={handlePivotSubmit} className="p-3 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Titre du pivot (ex: Passage de B2B à B2C)..."
                    value={pivotTitle}
                    onChange={(e) => setPivotTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Ancienne vision..."
                    value={prevVision}
                    onChange={(e) => setPrevVision(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Nouvelle vision..."
                    value={newVision}
                    onChange={(e) => setNewVision(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300"
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPivotForm(false)}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-semibold"
                    >
                      Enregistrer le Pivot
                    </button>
                  </div>
                </form>
              )}

              {/* List of Pivots */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
                {projectPivots.length > 0 ? (
                  projectPivots.map((p, idx) => (
                    <div key={p.id} className="relative pl-7 space-y-1">
                      <div className="absolute left-2 top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-slate-900"></div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <h4 className="font-bold text-amber-200 text-xs">{p.title}</h4>
                      {p.description && <p className="text-slate-400 text-[11px]">{p.description}</p>}
                      {p.previousVision && (
                        <div className="mt-1 p-2 bg-slate-950 rounded-lg border border-slate-800 text-[10px] space-y-0.5">
                          <span className="text-rose-400 line-through block">Avant: {p.previousVision}</span>
                          <span className="text-emerald-400 block font-semibold">Après: {p.newVision}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic pl-7">Aucun pivot majeur enregistré pour le moment.</p>
                )}
              </div>
            </div>

            {/* Recorded Decisions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
                  <CheckCircle className="h-4 w-4" />
                  <span>Décisions Fermes</span>
                </div>
                <span className="text-xs text-slate-500">{decisions.length}</span>
              </div>

              <div className="space-y-2">
                {decisions.map(d => (
                  <div key={d.id} className="p-3 bg-slate-950 border border-emerald-500/20 rounded-xl text-xs space-y-0.5">
                    <span className="font-semibold text-emerald-300">{d.title}</span>
                    {d.description && <p className="text-slate-400 text-[11px]">{d.description}</p>}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
