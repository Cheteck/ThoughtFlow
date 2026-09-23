import {
  INITIAL_PROJECTS,
  INITIAL_THOUGHTS,
  INITIAL_RELATIONS,
  INITIAL_DECISIONS,
  INITIAL_CONTRADICTIONS,
  INITIAL_CLUSTERS
} from '../initialData.js';
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
  SystemUser,
  AdminAuditLog
} from '../types.js';
import { IDatabaseAdapter, JSONFileAdapter } from './dbAdapter.js';

export interface AppDatabase {
  projects: Project[];
  thoughts: Thought[];
  relations: Relation[];
  decisions: Decision[];
  contradictions: ContradictionAlert[];
  clusters: EmergingCluster[];
  pivots: ProjectPivot[];
  currentUser: UserProfile;
  systemUsers: SystemUser[];
  auditLogs: AdminAuditLog[];
  userSettings: AppSettings;
}

const defaultUser: UserProfile = {
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
};

const defaultSystemUsers: SystemUser[] = [
  {
    id: 'usr-1',
    name: 'Alexandre Mercer',
    email: 'alex.mercer@thoughtflow.ai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    plan: 'pro',
    status: 'active',
    lastActive: 'À l\'instant',
    analysesCount: 34,
    projectsCount: 3
  },
  {
    id: 'usr-2',
    name: 'Sophie Martin',
    email: 'sophie.m@startup-lab.fr',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    plan: 'free',
    status: 'active',
    lastActive: 'Il y a 10 min',
    analysesCount: 12,
    projectsCount: 1
  }
];

const defaultPivots: ProjectPivot[] = [
  {
    id: 'piv-1',
    projectId: 'proj-1',
    title: 'Pivot Modèle B2B vers B2C Freemium',
    description: "Incapacité d'obtenir des partenariats avec les chaînes de supermarchés au T1. Pivot vers une application B2C directe pour les particuliers.",
    previousVision: 'API B2B vendue aux supermarchés',
    newVision: 'Application B2C grand public Freemium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
  }
];

const defaultSettings: AppSettings = {
  aiProvider: 'google',
  aiModel: 'gemini-3.8-flash',
  autoClusterSensitivity: 'medium',
  emailNotifications: true,
  theme: 'dark',
  autoSynthesizeBrain: true,
  language: 'fr'
};

class Store {
  private adapter: IDatabaseAdapter;
  private db: AppDatabase;

  constructor(adapter?: IDatabaseAdapter) {
    this.adapter = adapter || new JSONFileAdapter();
    this.db = this.initStore();
  }

  private initStore(): AppDatabase {
    try {
      const loaded = this.adapter.load();
      return {
        projects: loaded.projects || [...INITIAL_PROJECTS],
        thoughts: loaded.thoughts || [...INITIAL_THOUGHTS],
        relations: loaded.relations || [...INITIAL_RELATIONS],
        decisions: loaded.decisions || [...INITIAL_DECISIONS],
        contradictions: loaded.contradictions || [...INITIAL_CONTRADICTIONS],
        clusters: loaded.clusters || [...INITIAL_CLUSTERS],
        pivots: loaded.pivots || defaultPivots,
        currentUser: loaded.currentUser || defaultUser,
        systemUsers: loaded.systemUsers || defaultSystemUsers,
        auditLogs: loaded.auditLogs || [],
        userSettings: loaded.userSettings || defaultSettings
      };
    } catch (err) {
      const initialDb: AppDatabase = {
        projects: [...INITIAL_PROJECTS],
        thoughts: [...INITIAL_THOUGHTS],
        relations: [...INITIAL_RELATIONS],
        decisions: [...INITIAL_DECISIONS],
        contradictions: [...INITIAL_CONTRADICTIONS],
        clusters: [...INITIAL_CLUSTERS],
        pivots: defaultPivots,
        currentUser: defaultUser,
        systemUsers: defaultSystemUsers,
        auditLogs: [],
        userSettings: defaultSettings
      };
      this.adapter.save(initialDb);
      return initialDb;
    }
  }

  public get(): AppDatabase {
    return this.db;
  }

  public save() {
    this.adapter.save(this.db);
  }
}

export const store = new Store();
