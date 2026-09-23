import { Project, Thought, Relation, Decision, ContradictionAlert, EmergingCluster } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Application de recettes',
    description: 'App mobile & web pour générer et partager des recettes personnalisées selon les ingrédients du frigo.',
    color: 'emerald',
    icon: 'Utensils',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Newsletter Anti-Gaspillage',
    description: 'Publication hebdomadaire avec astuces anti-gaspillage alimentaire et recettes zéro déchet.',
    color: 'amber',
    icon: 'Mail',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Apprentissage de la Philosophie',
    description: 'Fiches de lecture, fiches synthétiques et carnets d réflexion sur la philosophie grecque et stoïcienne.',
    color: 'indigo',
    icon: 'BookOpen',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'dec-1',
    title: 'Focus B2C gratuit avec option Freemium',
    description: "L'application de recettes sera accessible à tous gratuitement avec des fonctionnalités premium optionnelles.",
    projectId: 'proj-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
  },
  {
    id: 'dec-2',
    title: 'Rythme de publication hebdomadaire',
    description: "La newsletter anti-gaspillage paraîtra chaque dimanche matin à 8h.",
    projectId: 'proj-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  }
];

export const INITIAL_THOUGHTS: Thought[] = [
  {
    id: 'thought-1',
    title: 'Générateur de recettes basé sur le reste du frigo',
    content: "Permettre à l'utilisateur de cocher les ingrédients restants (oeufs, tomates, crème) et générer 3 recettes instantanées.",
    type: 'idea',
    status: 'organized',
    projectIds: ['proj-1'],
    confidence: 'high',
    aiReasoning: "Clairement rattaché au projet 'Application de recettes'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    tags: ['ia', 'recettes', 'frigo']
  },
  {
    id: 'thought-2',
    title: 'Mode hors-ligne pour la cuisine',
    content: "Sauvegarder en local les recettes préférées pour pouvoir les consulter en cuisine sans réseau wifi.",
    type: 'hypothesis',
    status: 'organized',
    projectIds: ['proj-1'],
    confidence: 'high',
    aiReasoning: "Concerne l'expérience utilisateur dans la cuisine.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    tags: ['ux', 'offline']
  },
  {
    id: 'thought-3',
    title: 'Rubrique "Astuce de la semaine" zéro déchet',
    content: "Partager chaque dimanche 1 technique de conservation pour prolonger la durée des légumes frais.",
    type: 'idea',
    status: 'organized',
    projectIds: ['proj-2'],
    confidence: 'high',
    aiReasoning: "Directement aligné avec le projet 'Newsletter Anti-Gaspillage'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    tags: ['contenu', 'astuces']
  },
  {
    id: 'thought-4',
    title: 'Section "Restes de saison" croisée dans l\'app et la newsletter',
    content: "Utiliser les données des recettes les plus recherchées de l'app pour alimenter le sujet de la newsletter.",
    type: 'idea',
    status: 'organized',
    projectIds: ['proj-1', 'proj-2'], // Belonging to MULTIPLE projects
    confidence: 'high',
    aiReasoning: "L'agent a identifié une synergie directe entre l'application de recettes et la newsletter anti-gaspillage.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    tags: ['synergie', 'cross-platform']
  },
  {
    id: 'thought-5',
    title: 'Étudier les stoïciens (Épictète, Sénèque, Marc Aurèle)',
    content: "Faire des résumés comparatifs de la notion de contrôle et de la sérénité chez Sénèque et Épictète.",
    type: 'note',
    status: 'organized',
    projectIds: ['proj-3'],
    confidence: 'high',
    aiReasoning: "Rattaché à 'Apprentissage de la Philosophie'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    tags: ['stoïcisme', 'lecture']
  },
  {
    id: 'thought-6',
    title: 'Proposer un abonnement payant obligatoire à 9.99€/mois dès l\'inscription',
    content: "Monétiser directement l'accès à l'application de recettes dès le premier jour.",
    type: 'hypothesis',
    status: 'inbox',
    projectIds: [],
    confidence: 'medium',
    clarificationQuestion: "Attention : cette idée semble en contradiction avec votre décision 'Focus B2C gratuit avec option Freemium'. Souhaitez-vous quand même la rattaché à 'Application de recettes' ?",
    suggestedProjectIds: ['proj-1'],
    aiReasoning: "Contradiction potentielle détectée avec la décision dec-1.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    tags: ['monetisation', 'business']
  },
  {
    id: 'thought-7',
    title: 'Technique Pomodoro pour mes sessions d\'écriture',
    content: "Tester 25 min de concentration et 5 min de pause pour rédiger mes fiches et articles.",
    type: 'reflection',
    status: 'inbox',
    projectIds: [],
    confidence: 'low',
    aiReasoning: "Pensée générale de productivité personnelle. Conservée dans l'Inbox.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    tags: ['productivite']
  }
];

export const INITIAL_RELATIONS: Relation[] = [
  {
    id: 'rel-1',
    sourceId: 'thought-1',
    targetId: 'thought-4',
    type: 'stems_from',
    confidence: 0.9,
    explanation: "Le générateur de recettes est le socle de données réutilisé pour la rubrique de la newsletter.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'rel-2',
    sourceId: 'thought-3',
    targetId: 'thought-4',
    type: 'linked_to',
    confidence: 0.85,
    explanation: "Même thématique zéro déchet appliquée au contenu hebdomadaire.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'rel-3',
    sourceId: 'thought-6',
    targetId: 'thought-1',
    type: 'contradicts',
    confidence: 0.95,
    explanation: "Proposer un abonnement obligatoire contredit l'accès gratuit B2C.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

export const INITIAL_CONTRADICTIONS: ContradictionAlert[] = [
  {
    id: 'contra-1',
    ideaId: 'thought-6',
    decisionId: 'dec-1',
    explanation: "L'idée 'Abonnement payant obligatoire à 9.99€' contredit directement votre décision enregistrée 'Focus B2C gratuit avec option Freemium'.",
    severity: 'conflict',
    resolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

export const INITIAL_CLUSTERS: EmergingCluster[] = [
  {
    id: 'cluster-1',
    proposedName: 'Productivité & Méthodes de Travail',
    description: 'Regroupement potentiel d\'idées relatives à l\'organisation personnelle, Pomodoro et fiches de synthèse.',
    reasoning: 'L\'agent a détecté 3 idées récentes de réflexion sur les méthodes de travail qui ne sont rattachées à aucun projet.',
    ideaIds: ['thought-7'],
    dismissed: false
  }
];
