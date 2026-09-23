export type ThoughtType = 
  | 'idea' 
  | 'note' 
  | 'question' 
  | 'hypothesis' 
  | 'decision' 
  | 'task' 
  | 'reflection';

export type ThoughtStatus = 
  | 'captured' 
  | 'inbox' 
  | 'organized' 
  | 'exploring' 
  | 'validated' 
  | 'accepted' 
  | 'archived';

export type RelationType = 
  | 'similar_to' 
  | 'linked_to' 
  | 'depends_on' 
  | 'contradicts' 
  | 'stems_from' 
  | 'inspired_by' 
  | 'replaces';

export type PlacementConfidence = 'high' | 'medium' | 'low';

export interface ProjectMember {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  name?: string;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  isAutoSuggested?: boolean;
  members?: ProjectMember[];
  deletedAt?: string;
}

export interface Thought {
  id: string;
  title: string;
  content: string;
  type: ThoughtType;
  status: ThoughtStatus;
  projectIds: string[]; // Belongs to 0, 1 or multiple projects
  confidence: PlacementConfidence;
  clarificationQuestion?: string;
  suggestedProjectIds?: string[];
  aiReasoning?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  dueDate?: string;
  assigneeEmail?: string;
  deletedAt?: string;
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  confidence: number;
  explanation?: string;
  createdAt: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  associatedIdeaId?: string;
  createdAt: string;
}

export interface ContradictionAlert {
  id: string;
  ideaId: string;
  decisionId?: string;
  otherIdeaId?: string;
  explanation: string;
  severity: 'warning' | 'conflict';
  resolved: boolean;
  createdAt: string;
}

export interface EmergingCluster {
  id: string;
  proposedName: string;
  description: string;
  reasoning: string;
  ideaIds: string[];
  dismissed?: boolean;
}

export interface ProjectPivot {
  id: string;
  projectId: string;
  title: string;
  description: string;
  previousVision: string;
  newVision: string;
  createdAt: string;
}

export interface ProjectBrainVersion {
  id: string;
  versionNumber: number;
  visionSummary: string;
  currentFocus: string;
  synthesizedAt: string;
  changesSummary: string;
}

export interface ProjectBrain {
  projectId: string;
  visionSummary: string;
  currentFocus: string;
  openQuestions: string[];
  activeHypotheses: string[];
  keyDecisions: Decision[];
  pivots: ProjectPivot[];
  lastSynthesizedAt: string;
  history?: ProjectBrainVersion[];
}

export interface DormantIdeaSuggestion {
  id: string;
  ideaIds: string[];
  type: 'duplicate_merge' | 'dormant_revisit' | 'dead_idea';
  title: string;
  description: string;
  actionReasoning: string;
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: 'view_project' | 'create_project' | 'view_idea' | 'resolve_contradiction';
    payload?: any;
  }[];
}

export interface AnalysisResult {
  title: string;
  type: ThoughtType;
  confidence: PlacementConfidence;
  aiReasoning: string;
  matchedProjectIds: string[];
  suggestedCandidateProjectIds: string[];
  clarificationQuestion?: string;
  newRelations: {
    targetId: string;
    type: RelationType;
    confidence: number;
    explanation: string;
  }[];
  contradictions: {
    decisionId?: string;
    otherIdeaId?: string;
    explanation: string;
    severity: 'warning' | 'conflict';
  }[];
  isDecisionCandidate?: boolean;
  decisionDetail?: {
    title: string;
    description: string;
  };
}

// SaaS Monetization & Configuration Types
export type PlanType = 'free' | 'pro' | 'team';
export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  plan: PlanType;
  billingInterval: 'monthly' | 'yearly';
  usage: {
    aiAnalysesUsed: number;
    aiAnalysesLimit: number; // e.g. 50 for free, 2000 for pro, -1 for unlimited
    projectsCount: number;
    projectsLimit: number; // e.g. 3 for free, 50 for pro, -1 for team
    teamMembersCount: number;
    teamMembersLimit: number;
  };
  memberSince: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  plan: PlanType;
  status: 'active' | 'suspended';
  lastActive: string;
  analysesCount: number;
  projectsCount: number;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  action: string;
  userEmail: string;
  details: string;
  type: 'security' | 'role' | 'subscription' | 'ai' | 'system';
}

export interface AdminSystemMetrics {
  totalUsers: number;
  activeAdmins: number;
  mrr: number;
  totalThoughtsCaptured: number;
  totalProjectsCreated: number;
  aiAnalysesThisMonth: number;
  geminiLatencyMs: number;
  geminiApiStatus: 'operational' | 'degraded' | 'offline';
  activeSubscriptions: {
    free: number;
    pro: number;
    team: number;
  };
  users: SystemUser[];
  auditLogs: AdminAuditLog[];
}

export type AIProvider = 'google' | 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface AppSettings {
  aiProvider: AIProvider;
  aiModel: string;
  autoClusterSensitivity: 'low' | 'medium' | 'high';
  customApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  customEndpoint?: string;
  emailNotifications: boolean;
  theme: 'dark' | 'light' | 'system';
  autoSynthesizeBrain: boolean;
  language: 'fr' | 'en';
  enablePiiAnonymization?: boolean;
}

export interface PricingTier {
  id: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}
