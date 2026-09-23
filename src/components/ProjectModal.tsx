import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { X, Folder, Utensils, Mail, BookOpen, Sparkles, Code, Globe, Lightbulb } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: { id?: string; name: string; description: string; color: string; icon: string }) => void;
  editingProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProject,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [icon, setIcon] = useState('Folder');

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || '');
      setColor(editingProject.color || 'indigo');
      setIcon(editingProject.icon || 'Folder');
    } else {
      setName('');
      setDescription('');
      setColor('indigo');
      setIcon('Folder');
    }
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: editingProject?.id,
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
    });
    onClose();
  };

  const colors = [
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'cyan', bg: 'bg-cyan-500' },
  ];

  const icons = [
    { name: 'Folder', icon: Folder },
    { name: 'Utensils', icon: Utensils },
    { name: 'Mail', icon: Mail },
    { name: 'BookOpen', icon: BookOpen },
    { name: 'Sparkles', icon: Sparkles },
    { name: 'Code', icon: Code },
    { name: 'Globe', icon: Globe },
    { name: 'Lightbulb', icon: Lightbulb },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">
            {editingProject ? 'Editer le projet' : 'Nouveau Projet'}
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
              Nom du projet *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Application de recettes, Apprendre l'Espagnol..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Objectif
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brève explication du contexte..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Couleur d'accent
            </label>
            <div className="flex items-center gap-3">
              {colors.map(c => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`h-7 w-7 rounded-full ${c.bg} transition-transform ${
                    color === c.name ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Icône
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {icons.map(ic => {
                const IconComp = ic.icon;
                return (
                  <button
                    type="button"
                    key={ic.name}
                    onClick={() => setIcon(ic.name)}
                    className={`p-2 rounded-xl border transition-all ${
                      icon === ic.name 
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

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
