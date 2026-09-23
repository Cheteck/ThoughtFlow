import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Thought, 
  Relation, 
  Decision, 
  ContradictionAlert, 
  EmergingCluster,
  ProjectPivot,
  UserProfile,
  AppSettings,
  PlanType,
  ProjectMember
} from './types';
import { Navbar } from './components/Navbar';
import { CaptureBar } from './components/CaptureBar';
import { InboxView } from './components/InboxView';
import { ProjectsView } from './components/ProjectsView';
import { ExploreView } from './components/ExploreView';
import { AgentChatView } from './components/AgentChatView';
import { ProjectModal } from './components/ProjectModal';
import { ThoughtDetailModal } from './components/ThoughtDetailModal';
import { DecisionModal } from './components/DecisionModal';
import { SettingsModal } from './components/SettingsModal';
import { MonetizationModal } from './components/MonetizationModal';
import { AdminView } from './components/AdminView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { BatchCaptureModal } from './components/BatchCaptureModal';
import { TrashViewModal } from './components/TrashViewModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ProjectSharingModal } from './components/ProjectSharingModal';
import { ArbitrateContradictionModal } from './components/ArbitrateContradictionModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'projects' | 'explore' | 'agent' | 'admin'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain Store State
  const [projects, setProjects] = useState<Project[]>([]);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [contradictions, setContradictions] = useState<ContradictionAlert[]>([]);
  const [clusters, setClusters] = useState<EmergingCluster[]>([]);
  const [pivots, setPivots] = useState<ProjectPivot[]>([]);

  // User & Settings State
  const [user, setUser] = useState<UserProfile>({
    id: 'usr-1',
    name: 'Alexandre Mercer',
    email: 'alex.mercer@thoughtflow.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    plan: 'pro',
    billingInterval: 'monthly',
    usage: {
      aiAnalysesUsed: 34,
      aiAnalysesLimit: 2000,
      projectsCount: 3,
      projectsLimit: 50,
      teamMembersCount: 1,
      teamMembersLimit: 5
    },
    memberSince: '2026-01-15'
  });

  const [settings, setSettings] = useState<AppSettings>({
    aiProvider: 'google',
    aiModel: 'gemini-3.8-flash',
    autoClusterSensitivity: 'medium',
    emailNotifications: true,
    theme: 'dark',
    autoSynthesizeBrain: true,
    language: 'fr'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isThoughtModalOpen, setIsThoughtModalOpen] = useState(false);
  const [editingThought, setEditingThought] = useState<Thought | null>(null);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionProjectId, setDecisionProjectId] = useState<string | undefined>();

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  // Gap Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isBatchCaptureOpen, setIsBatchCaptureOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [arbitratingContradiction, setArbitratingContradiction] = useState<ContradictionAlert | null>(null);

  // Fetch state on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setThoughts(data.thoughts || []);
        setRelations(data.relations || []);
        setDecisions(data.decisions || []);
        setContradictions(data.contradictions || []);
        setClusters(data.clusters || []);
        setPivots(data.pivots || []);
        if (data.user) setUser(data.user);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load app data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Capture Thought
  const handleCaptureThought = async (content: string) => {
    const res = await fetch('/api/thoughts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) throw new Error("Failed to capture thought");

    const result = await res.json();
    if (result.data) {
      setProjects(result.data.projects);
      setThoughts(result.data.thoughts);
      setRelations(result.data.relations);
      setDecisions(result.data.decisions);
      setContradictions(result.data.contradictions);
      setClusters(result.data.clusters);
    }
    // Update usage count in local state
    setUser(prev => ({
      ...prev,
      usage: {
        ...prev.usage,
        aiAnalysesUsed: prev.usage.aiAnalysesUsed + 1
      }
    }));
    return { thought: result.thought, analysis: result.analysis };
  };

  // 2. Confirm Placement / Update Projects
  const handleConfirmPlacement = async (thoughtId: string, projectIds: string[]) => {
    const res = await fetch('/api/thoughts/placement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thoughtId, projectIds }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setThoughts(data.data.thoughts);
        setProjects(data.data.projects);
      }
    }
  };

  // 3. Edit Thought
  const handleSaveThought = async (updated: Partial<Thought> & { id: string }) => {
    const res = await fetch('/api/thoughts/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        thoughtId: updated.id,
        title: updated.title,
        content: updated.content,
        type: updated.type,
        status: updated.status,
        projectIds: updated.projectIds
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) setThoughts(data.data.thoughts);
    }
  };

  // 4. Delete Thought
  const handleDeleteThought = async (thoughtId: string) => {
    const res = await fetch('/api/thoughts/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thoughtId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setThoughts(data.data.thoughts);
        setRelations(data.data.relations);
        setContradictions(data.data.contradictions);
      }
    }
  };

  // 5. Save Project (Create / Update)
  const handleSaveProject = async (projData: { id?: string; name: string; description: string; color: string; icon: string }) => {
    const endpoint = projData.id ? '/api/projects/update' : '/api/projects';
    const body = projData.id 
      ? { projectId: projData.id, ...projData }
      : projData;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) setProjects(data.data.projects);
    }
  };

  // 6. Delete Project
  const handleDeleteProject = async (projectId: string) => {
    const res = await fetch('/api/projects/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setProjects(data.data.projects);
        setThoughts(data.data.thoughts);
      }
    }
  };

  // 7. Save Decision
  const handleSaveDecision = async (decData: { title: string; description: string; projectId: string }) => {
    const res = await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) setDecisions(data.data.decisions);
    }
  };

  // 8. Resolve Contradiction
  const handleResolveContradiction = async (contradictionId: string) => {
    const res = await fetch('/api/contradictions/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contradictionId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) setContradictions(data.data.contradictions);
    }
  };

  // 9. Convert Cluster to Project
  const handleCreateProjectFromCluster = async (clusterId: string) => {
    const res = await fetch('/api/clusters/create-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clusterId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setProjects(data.data.projects);
        setThoughts(data.data.thoughts);
        setClusters(data.data.clusters);
      }
    }
  };

  // 10. Add Pivot
  const handleAddPivot = async (pivotData: { projectId: string; title: string; description: string; previousVision: string; newVision: string }) => {
    const res = await fetch('/api/pivots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pivotData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.pivots) setPivots(data.pivots);
    }
  };

  // 11. Merge Thoughts
  const handleMergeThoughts = async (primaryId: string, secondaryId: string) => {
    const res = await fetch('/api/thoughts/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryId, secondaryId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        setThoughts(data.data.thoughts);
        setRelations(data.data.relations);
      }
    }
  };

  // 12. Agent Chat Send
  const handleAgentChatMessage = async (msg: string) => {
    const res = await fetch('/api/agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });

    if (res.ok) {
      return await res.json();
    }
    return { reply: "Impossible de joindre l'agent." };
  };

  // 13. Upgrade Subscription
  const handleUpgradePlan = async (plan: PlanType, interval: 'monthly' | 'yearly') => {
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, interval }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) setUser(data.user);
    }
  };

  // 14. Save Settings
  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const res = await fetch('/api/settings/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    }
  };

  // 15. Save User Profile
  const handleSaveProfile = async (profileData: { name: string; email: string; avatarUrl: string }) => {
    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) setUser(data.user);
    }
  };

  // 16. Toggle Test User Role (Admin <-> User)
  const handleToggleRole = async () => {
    try {
      const res = await fetch('/api/user/toggle-role', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.currentUser) {
          setUser(data.currentUser);
          if (data.role === 'user' && activeTab === 'admin') {
            setActiveTab('inbox');
          }
        }
      }
    } catch (e) {
      console.error("Failed to toggle role", e);
    }
  };

  // 17. Trash & Restoration Handlers
  const handleTrashThought = async (thoughtId: string) => {
    try {
      const res = await fetch('/api/thoughts/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thoughtId })
      });
      if (res.ok) {
        const data = await res.json();
        setThoughts(data.data.thoughts || []);
      }
    } catch (e) {
      console.error("Trash error", e);
    }
  };

  const handleRestoreThought = async (thoughtId: string) => {
    try {
      const res = await fetch('/api/thoughts/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thoughtId })
      });
      if (res.ok) {
        const data = await res.json();
        setThoughts(data.data.thoughts || []);
      }
    } catch (e) {
      console.error("Restore error", e);
    }
  };

  const handlePermanentDeleteThought = (thoughtId: string) => {
    handleDeleteThought(thoughtId);
  };

  const handleBatchCaptured = (newThoughts: Thought[]) => {
    fetchData();
  };

  const handleUpdateProjectMembers = (projectId: string, members: ProjectMember[]) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, members } : p));
  };

  // Filter thoughts by search query if set
  const activeThoughts = thoughts.filter(t => !t.deletedAt);
  const filteredThoughts = searchQuery.trim() 
    ? activeThoughts.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeThoughts;

  const inboxCount = activeThoughts.filter(t => t.projectIds.length === 0 || t.status === 'inbox').length;
  const contradictionCount = contradictions.filter(c => !c.resolved).length;
  const clusterCount = clusters.filter(c => !c.dismissed).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Chargement de votre espace de pensée...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inboxCount={inboxCount}
        contradictionCount={contradictionCount}
        clusterCount={clusterCount}
        onOpenCapture={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onToggleRole={handleToggleRole}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenBatchCapture={() => setIsBatchCaptureOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Fast Capture Component at top */}
        {activeTab !== 'admin' && (
          <CaptureBar
            onCapture={handleCaptureThought}
            projects={projects}
            onConfirmPlacement={handleConfirmPlacement}
          />
        )}

        {/* Tab View Switcher */}
        {activeTab === 'inbox' && (
          <InboxView
            thoughts={filteredThoughts}
            projects={projects}
            relations={relations}
            contradictions={contradictions}
            onUpdatePlacement={handleConfirmPlacement}
            onEditThought={(thought) => {
              setEditingThought(thought);
              setIsThoughtModalOpen(true);
            }}
            onDeleteThought={handleTrashThought}
            onOpenCapture={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            thoughts={filteredThoughts}
            decisions={decisions}
            relations={relations}
            contradictions={contradictions}
            pivots={pivots}
            onCreateProject={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
            onEditProject={(proj) => {
              setEditingProject(proj);
              setIsProjectModalOpen(true);
            }}
            onDeleteProject={handleDeleteProject}
            onUpdatePlacement={handleConfirmPlacement}
            onEditThought={(thought) => {
              setEditingThought(thought);
              setIsThoughtModalOpen(true);
            }}
            onDeleteThought={handleTrashThought}
            onCreateDecision={(projId) => {
              setDecisionProjectId(projId);
              setIsDecisionModalOpen(true);
            }}
            onAddPivot={handleAddPivot}
            onAddThoughtFromQuestion={(qText) => {
              handleCaptureThought(qText);
            }}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreView
            thoughts={filteredThoughts}
            projects={projects}
            relations={relations}
            contradictions={contradictions}
            clusters={clusters}
            onResolveContradiction={(contraId) => {
              const contra = contradictions.find(c => c.id === contraId);
              if (contra) {
                setArbitratingContradiction(contra);
              } else {
                handleResolveContradiction(contraId);
              }
            }}
            onCreateProjectFromCluster={handleCreateProjectFromCluster}
            onMergeThoughts={handleMergeThoughts}
          />
        )}

        {activeTab === 'agent' && (
          <AgentChatView
            onSendMessage={handleAgentChatMessage}
            onSelectProject={(projId) => {
              setActiveTab('projects');
            }}
            onCreateProjectModal={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            currentUser={user}
            onToggleMyRole={handleToggleRole}
          />
        )}

      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />

      <ThoughtDetailModal
        isOpen={isThoughtModalOpen}
        onClose={() => setIsThoughtModalOpen(false)}
        thought={editingThought}
        projects={projects}
        onSaveThought={handleSaveThought}
      />

      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        projects={projects}
        defaultProjectId={decisionProjectId}
        onSaveDecision={handleSaveDecision}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onSaveProfile={handleSaveProfile}
      />

      <MonetizationModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        user={user}
        onUpgradePlan={handleUpgradePlan}
      />

      {/* New Gap Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        thoughts={activeThoughts}
        projects={projects}
        onSelectThought={(t) => {
          setEditingThought(t);
          setIsThoughtModalOpen(true);
        }}
        onSelectProject={() => {
          setActiveTab('projects');
        }}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenBatchCapture={() => setIsBatchCaptureOpen(true)}
        onOpenImport={() => setIsImportExportOpen(true)}
        onOpenTrash={() => setIsTrashOpen(true)}
      />

      <BatchCaptureModal
        isOpen={isBatchCaptureOpen}
        onClose={() => setIsBatchCaptureOpen(false)}
        onBatchCaptured={handleBatchCaptured}
      />

      <TrashViewModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        thoughts={thoughts}
        projects={projects}
        onRestoreThought={handleRestoreThought}
        onPermanentDeleteThought={handlePermanentDeleteThought}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onDataImported={fetchData}
      />

      <ProjectSharingModal
        isOpen={!!sharingProject}
        onClose={() => setSharingProject(null)}
        project={sharingProject}
        onUpdateProjectMembers={handleUpdateProjectMembers}
      />

      <ArbitrateContradictionModal
        isOpen={!!arbitratingContradiction}
        onClose={() => setArbitratingContradiction(null)}
        contradiction={arbitratingContradiction}
        idea={thoughts.find(t => t.id === arbitratingContradiction?.ideaId)}
        decision={decisions.find(d => d.id === arbitratingContradiction?.decisionId)}
        onResolve={handleResolveContradiction}
      />

    </div>
  );
}
