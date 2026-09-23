import React, { useState } from 'react';
import { 
  Thought, 
  Project, 
  Relation, 
  ContradictionAlert, 
  EmergingCluster 
} from '../types';
import { 
  Compass, 
  AlertTriangle, 
  Sparkles, 
  Link as LinkIcon, 
  FolderPlus,
  GitMerge,
  Network,
  Filter
} from 'lucide-react';

interface ExploreViewProps {
  thoughts: Thought[];
  projects: Project[];
  relations: Relation[];
  contradictions: ContradictionAlert[];
  clusters: EmergingCluster[];
  onResolveContradiction: (id: string) => void;
  onCreateProjectFromCluster: (clusterId: string) => void;
  onMergeThoughts: (primaryId: string, secondaryId: string) => void;
  onSelectThought?: (thought: Thought) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  thoughts,
  projects,
  relations,
  contradictions,
  clusters,
  onResolveContradiction,
  onCreateProjectFromCluster,
  onMergeThoughts,
  onSelectThought
}) => {
  const [selectedRelationType, setSelectedRelationType] = useState<string>('all');
  const [graphMode, setGraphMode] = useState<'cards' | 'visual_map'>('cards');

  const unresolvedContradictions = contradictions.filter(c => !c.resolved);
  const activeClusters = clusters.filter(c => !c.dismissed);

  // Find similar relations for merge opportunities
  const duplicatePairs = relations.filter(r => r.type === 'similar_to' && r.confidence > 0.8);

  const filteredRelations = selectedRelationType === 'all'
    ? relations
    : relations.filter(r => r.type === selectedRelationType);

  // Helper for relation badge labels
  const getRelationTypeLabel = (type: string) => {
    switch (type) {
      case 'similar_to': return { label: 'Similaire à', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'linked_to': return { label: 'Lié à', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'depends_on': return { label: 'Dépend de', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'contradicts': return { label: 'Contredit', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'stems_from': return { label: 'Découle de', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'inspired_by': return { label: 'Inspiré par', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      default: return { label: 'En relation avec', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <Compass className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Graphe de Connaissances & Anti-Contradictions IA</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGraphMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  graphMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Vue Grille
              </button>
              <button
                onClick={() => setGraphMode('visual_map')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  graphMode === 'visual_map'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Carte Réseau 2D</span>
              </button>
            </div>
          </div>

          <p className="text-slate-400 text-sm max-w-3xl">
            L'agent surveille en permanence votre corpus pour faire émerger des connexions masquées, détecter les contradictions stratégiques avec vos décisions antérieures et vous suggérer la fusion d'idées similaires.
          </p>
        </div>
      </div>

      {/* SECTION 1: CONTRADICTIONS ALERTS */}
      {unresolvedContradictions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Contradictions Stratégiques Détectées ({unresolvedContradictions.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unresolvedContradictions.map(contra => {
              const thought = thoughts.find(t => t.id === contra.ideaId);
              return (
                <div key={contra.id} className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Incompatibilité de décision</span>
                    </span>
                    <button
                      onClick={() => onResolveContradiction(contra.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Ignorer / Résoudre
                    </button>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed font-medium">
                    {contra.explanation}
                  </p>

                  {thought && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Pensée concernée :</span>
                      <p className="text-indigo-300 font-semibold">{thought.title}</p>
                      <p className="text-slate-400 text-[11px] line-clamp-2">{thought.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: MERGE SIMILAR / DUPLICATE IDEAS */}
      {duplicatePairs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Opportunités de Fusion d'Idées Similaires ({duplicatePairs.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {duplicatePairs.map(pair => {
              const src = thoughts.find(t => t.id === pair.sourceId);
              const tgt = thoughts.find(t => t.id === pair.targetId);
              if (!src || !tgt) return null;

              return (
                <div key={pair.id} className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                      <GitMerge className="h-3.5 w-3.5" />
                      <span>Pensées très proches</span>
                    </span>
                    <button
                      onClick={() => onMergeThoughts(src.id, tgt.id)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1"
                    >
                      <span>Fusionner en 1 pensée</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pensée A :</span>
                      <p className="text-slate-200 font-medium line-clamp-2">{src.title}</p>
                    </div>
                    <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pensée B :</span>
                      <p className="text-slate-200 font-medium line-clamp-2">{tgt.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: AI EMERGING CLUSTERS */}
      {activeClusters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Projets Émergents Proposés par l'Agent ({activeClusters.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeClusters.map(cluster => (
              <div key={cluster.id} className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Émergence thématique</span>
                  </span>
                  <button
                    onClick={() => onCreateProjectFromCluster(cluster.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                    <span>Créer le projet</span>
                  </button>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{cluster.proposedName}</h3>
                  <p className="text-slate-300 text-xs mt-1">{cluster.reasoning}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <span>Inclus {cluster.ideaIds.length} pensée(s) en Inbox</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: KNOWLEDGE NETWORK RELATIONS MAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Graphe des Relations & Connexions Masquées ({filteredRelations.length})</h2>
          </div>

          {/* Relation Filter Selector */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Filtrer par lien :</span>
            <select
              value={selectedRelationType}
              onChange={(e) => setSelectedRelationType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les relations</option>
              <option value="similar_to">Similaire à</option>
              <option value="linked_to">Lié à</option>
              <option value="depends_on">Dépend de</option>
              <option value="contradicts">Contredit</option>
              <option value="stems_from">Découle de</option>
              <option value="inspired_by">Inspiré par</option>
            </select>
          </div>
        </div>

        {graphMode === 'visual_map' ? (
          <div className="p-6 bg-slate-900/90 border border-indigo-500/30 rounded-2xl min-h-[350px] flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
            <Network className="w-12 h-12 text-indigo-400 animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-white font-bold text-base">Visualiseur Réseau Interactif Actif</h3>
              <p className="text-slate-400 text-xs max-w-md">
                {filteredRelations.length} connexions sémantiques interconnectées.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl pt-2">
              {thoughts.slice(0, 8).map(t => (
                <span key={t.id} className="px-3 py-1.5 bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs rounded-xl font-medium shadow-sm">
                  {t.title}
                </span>
              ))}
            </div>
          </div>
        ) : filteredRelations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRelations.map(rel => {
              const source = thoughts.find(t => t.id === rel.sourceId);
              const target = thoughts.find(t => t.id === rel.targetId);
              if (!source || !target) return null;

              const relStyle = getRelationTypeLabel(rel.type);

              return (
                <div key={rel.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 border text-xs font-semibold rounded-lg ${relStyle.color}`}>
                      {relStyle.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Confiance : {Math.round(rel.confidence * 100)}%
                    </span>
                  </div>

                  {/* Connected pair */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Source :</span>
                      <p className="font-semibold text-slate-200 line-clamp-1">{source.title}</p>
                    </div>
                    <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Cible :</span>
                      <p className="font-semibold text-slate-200 line-clamp-1">{target.title}</p>
                    </div>
                  </div>

                  {rel.explanation && (
                    <p className="text-xs text-slate-400 italic">
                      « {rel.explanation} »
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
            Aucune relation trouvée pour ce filtre.
          </div>
        )}
      </div>

    </div>
  );
};
