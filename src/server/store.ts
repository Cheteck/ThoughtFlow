import fs from 'fs';
import path from 'path';
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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'thoughtflow_db.json');

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
  private db: AppDatabase;

  constructor() {
    this.db = this.loadFromDisk();
  }

  private loadFromDisk(): AppDatabase {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          projects: parsed.projects || [...INITIAL_PROJECTS],
          thoughts: parsed.thoughts || [...INITIAL_THOUGHTS],
          relations: parsed.relations || [...INITIAL_RELATIONS],
          decisions: parsed.decisions || [...INITIAL_DECISIONS],
          contradictions: parsed.contradictions || [...INITIAL_CONTRADICTIONS],
          clusters: parsed.clusters || [...INITIAL_CLUSTERS],
          pivots: parsed.pivots || defaultPivots,
          currentUser: parsed.currentUser || defaultUser,
          systemUsers: parsed.systemUsers || defaultSystemUsers,
          auditLogs: parsed.auditLogs || [],
          userSettings: parsed.userSettings || defaultSettings
        };
      }
    } catch (err) {
      console.error("Failed to load DB from disk, initializing default store:", err);
    }

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

    this.saveToDisk(initialDb);
    return initialDb;
  }

  private saveToDisk(data: AppDatabase) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error("Failed to save DB to disk:", err);
    }
  }

  public get(): AppDatabase {
    return this.db;
  }

  public save() {
    this.saveToDisk(this.db);
  }
}

export const store = new Store();
