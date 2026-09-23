import React, { useState } from 'react';
import { Project, ProjectMember } from '../types';
import { 
  Users, 
  UserPlus, 
  Shield, 
  X, 
  Check, 
  Mail,
  Crown
} from 'lucide-react';

interface ProjectSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdateProjectMembers: (projectId: string, members: ProjectMember[]) => void;
}

export const ProjectSharingModal: React.FC<ProjectSharingModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProjectMembers
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'owner' | 'editor' | 'viewer'>('editor');
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen || !project) return null;

  const handleAddMember = async () => {
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch('/api/projects/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          memberEmail: newEmail.trim(),
          role: newRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateProjectMembers(project.id, data.project.members || []);
        setNewEmail('');
      }
    } catch (e) {
      alert("Échec de l'ajout du membre");
    } finally {
      setIsAdding(false);
    }
  };

  const members = project.members || [
    { email: 'alex.mercer@thoughtflow.ai', role: 'owner', name: 'Alexandre Mercer' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Partage & Membres - {project.name}</h2>
              <p className="text-xs text-slate-400">
                Gérez les permissions d'accès et la collaboration en équipe.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5">
          {/* Add member input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Inviter un coéquipier</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  placeholder="nom@entreprise.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="editor">Éditeur</option>
                <option value="viewer">Lecteur</option>
              </select>

              <button
                disabled={isAdding || !newEmail.trim()}
                onClick={handleAddMember}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1 shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inviter</span>
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Membres Actifs ({members.length})
            </span>
            <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
              {members.map((m, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-xs">
                      {m.email[0].toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 block">{m.name || m.email}</span>
                      <span className="text-[10px] text-slate-400">{m.email}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                    m.role === 'owner' 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : m.role === 'editor'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
