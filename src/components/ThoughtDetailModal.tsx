import React, { useState, useEffect } from 'react';
import { Thought, Project, ThoughtType } from '../types';
import { X, Sparkles, Folder, CheckCircle } from 'lucide-react';

interface ThoughtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  thought: Thought | null;
  projects: Project[];
  onSaveThought: (updatedThought: Partial<Thought> & { id: string }) => void;
}

export const ThoughtDetailModal: React.FC<ThoughtDetailModalProps> = ({
  isOpen,
  onClose,
  thought,
  projects,
  onSaveThought,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<ThoughtType>('idea');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  useEffect(() => {
    if (thought) {
      setTitle(thought.title);
      setContent(thought.content);
      setType(thought.type);
      setSelectedProjectIds(thought.projectIds || []);
    }
  }, [thought, isOpen]);

  if (!isOpen || !thought) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveThought({
      id: thought.id,
      title: title.trim(),
      content: content.trim(),
      type,
      projectIds: selectedProjectIds,
      status: selectedProjectIds.length > 0 ? 'organized' : 'inbox'
    });
    onClose();
  };

  const toggleProject = (projId: string) => {
    if (selectedProjectIds.includes(projId)) {
      setSelectedProjectIds(selectedProjectIds.filter(id => id !== projId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, projId]);
    }
  };

  const types: { value: ThoughtType; label: string }[] = [
    { value: 'idea', label: 'Idée' },
    { value: 'note', label: 'Note' },
    { value: 'question', label: 'Question' },
    { value: 'hypothesis', label: 'Hypothèse' },
    { value: 'decision', label: 'Décision' },
    { value: 'task', label: 'Tâche' },
    { value: 'reflection', label: 'Réflexion' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Editer la pensée</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contenu complet
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Type de pensée
            </label>
            <div className="flex flex-wrap gap-1.5">
              {types.map(t => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    type === t.value 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Projets associés (Appartient à 0, 1 ou plusieurs)</span>
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {projects.map(p => {
                const isSelected = selectedProjectIds.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleProject(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between border transition-all ${
                      isSelected 
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-3.5 w-3.5 text-slate-500" />
                      <span>{p.name}</span>
                    </div>
                    {isSelected && <CheckCircle className="h-4 w-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {thought.aiReasoning && (
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400 space-y-0.5">
              <span className="font-semibold text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Analyse de l'agent :
              </span>
              <p className="italic text-[11px]">{thought.aiReasoning}</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold rounded-xl shadow-md"
            >
              Enregistrer
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
