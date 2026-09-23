import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  INITIAL_PROJECTS, 
  INITIAL_THOUGHTS, 
  INITIAL_RELATIONS, 
  INITIAL_DECISIONS, 
  INITIAL_CONTRADICTIONS, 
  INITIAL_CLUSTERS 
} from './src/initialData.js';
import { 
  Project, 
  Thought, 
  ThoughtType,
  Relation, 
  Decision, 
  ContradictionAlert, 
  EmergingCluster, 
  AgentChatMessage,
  ProjectPivot,
  ProjectBrain,
  DormantIdeaSuggestion,
  UserProfile,
  AppSettings,
  SystemUser,
  AdminAuditLog,
  AdminSystemMetrics,
  UserRole
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side in-memory store initialized with seed data
let projects: Project[] = [...INITIAL_PROJECTS];
let thoughts: Thought[] = [...INITIAL_THOUGHTS];
let relations: Relation[] = [...INITIAL_RELATIONS];
let decisions: Decision[] = [...INITIAL_DECISIONS];
let contradictions: ContradictionAlert[] = [...INITIAL_CONTRADICTIONS];
let clusters: EmergingCluster[] = [...INITIAL_CLUSTERS];

let pivots: ProjectPivot[] = [
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

let currentUser: UserProfile = {
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

let systemUsers: SystemUser[] = [
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
  },
  {
    id: 'usr-3',
    name: 'Thomas Dubois',
    email: 'thomas.dubois@venture.co',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    plan: 'team',
    status: 'active',
    lastActive: 'Il y a 2 heures',
    analysesCount: 184,
    projectsCount: 8
  },
  {
    id: 'usr-4',
    name: 'Élodie Leroy',
    email: 'elodie@tech-innov.io',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    plan: 'team',
    status: 'active',
    lastActive: 'Hier',
    analysesCount: 520,
    projectsCount: 12
  },
  {
    id: 'usr-5',
    name: 'Marc Laurent',
    email: 'marc.l@spamtrap.org',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    plan: 'free',
    status: 'suspended',
    lastActive: 'Il y a 5 jours',
    analysesCount: 49,
    projectsCount: 2
  }
];

let auditLogs: AdminAuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: 'ROLE_MODIFIED',
    userEmail: 'alex.mercer@thoughtflow.ai',
    details: 'Attribution du rôle Administrateur à Alexandre Mercer',
    type: 'role'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    action: 'SUBSCRIPTION_UPGRADE',
    userEmail: 'thomas.dubois@venture.co',
    details: 'Passage au forfait Team Brain (49€/mois)',
    type: 'subscription'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    action: 'GEMINI_MODEL_SWITCH',
    userEmail: 'system',
    details: 'Modèle par défaut basculé sur Gemini 3.8 Flash (latence 140ms)',
    type: 'ai'
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    action: 'USER_SUSPENDED',
    userEmail: 'marc.l@spamtrap.org',
    details: 'Compte suspendu pour tentative d\'abus de quota d\'analyses',
    type: 'security'
  }
];

let userSettings: AppSettings = {
  aiProvider: 'google',
  aiModel: 'gemini-3.8-flash',
  autoClusterSensitivity: 'medium',
  emailNotifications: true,
  theme: 'dark',
  autoSynthesizeBrain: true,
  language: 'fr'
};

// Helper to initialize Gemini Client
function getGeminiClient() {
  const apiKey = userSettings.customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Unified Multi-Provider AI Engine Call Dispatcher
async function callUnifiedAI({
  prompt,
  systemInstruction,
  responseSchema,
  isJson = true
}: {
  prompt: string;
  systemInstruction: string;
  responseSchema?: any;
  isJson?: boolean;
}): Promise<string | null> {
  const provider = userSettings.aiProvider || 'google';
  const modelName = userSettings.aiModel || 'gemini-3.8-flash';

  // 1. OpenAI Provider
  if (provider === 'openai') {
    const apiKey = userSettings.openaiApiKey || process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelName.startsWith('gpt') || modelName.startsWith('o3') ? modelName : 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction + (isJson ? '\nIMPORTANT: Réponds EXCLUSIVEMENT sous forme d’objet JSON valide.' : '') },
              { role: 'user', content: prompt }
            ],
            response_format: isJson ? { type: 'json_object' } : undefined
          })
        });
        if (response.ok) {
          const data = await response.json();
          return data.choices?.[0]?.message?.content || null;
        }
      } catch (e) {
        console.warn("OpenAI API call failed, falling back to Gemini:", e);
      }
    }
  }

  // 2. Anthropic Provider
  if (provider === 'anthropic') {
    const apiKey = userSettings.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: modelName.startsWith('claude') ? modelName : 'claude-3-5-sonnet-20241022',
            max_tokens: 2048,
            system: systemInstruction + (isJson ? '\nIMPORTANT: Réponds EXCLUSIVEMENT sous forme de JSON valide.' : ''),
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          const text = data.content?.[0]?.text || null;
          return text;
        }
      } catch (e) {
        console.warn("Anthropic API call failed, falling back to Gemini:", e);
      }
    }
  }

  // 3. Ollama or Custom Endpoint
  if (provider === 'ollama' || provider === 'custom') {
    const endpoint = userSettings.customEndpoint || 'http://localhost:11434/v1';
    const baseUrl = endpoint.replace(/\/$/, '');
    const url = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName || 'llama3.3',
          messages: [
            { role: 'system', content: systemInstruction + (isJson ? '\nReturn valid JSON.' : '') },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      console.warn("Ollama / Custom Endpoint call failed, falling back to Gemini:", e);
    }
  }

  // 4. Default Google Gemini Provider (Primary or Fallback)
  const apiKey = userSettings.customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName.startsWith('gemini') ? modelName : 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: isJson ? 'application/json' : undefined,
        responseSchema: responseSchema || undefined
      }
    });
    return response.text || null;
  } catch (e) {
    console.error("Gemini API call failed:", e);
    return null;
  }
}

// ================= API ROUTES =================

// 1. Get full state
app.get('/api/data', (req, res) => {
  // Update usage project count dynamically
  currentUser.usage.projectsCount = projects.length;

  res.json({
    projects,
    thoughts,
    relations,
    decisions,
    contradictions,
    clusters,
    pivots,
    user: currentUser,
    settings: userSettings
  });
});

// 1.0.1 Subscription Upgrade Endpoint
app.post('/api/subscription/upgrade', (req, res) => {
  const { plan, interval } = req.body;
  if (!plan || !['free', 'pro', 'team'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  currentUser.plan = plan;
  if (interval) currentUser.billingInterval = interval;

  if (plan === 'free') {
    currentUser.usage.aiAnalysesLimit = 50;
    currentUser.usage.projectsLimit = 3;
    currentUser.usage.teamMembersLimit = 1;
  } else if (plan === 'pro') {
    currentUser.usage.aiAnalysesLimit = 2000;
    currentUser.usage.projectsLimit = 50;
    currentUser.usage.teamMembersLimit = 3;
  } else if (plan === 'team') {
    currentUser.usage.aiAnalysesLimit = -1; // unlimited
    currentUser.usage.projectsLimit = -1; // unlimited
    currentUser.usage.teamMembersLimit = 25;
  }

  res.json({ success: true, user: currentUser });
});

// 1.0.2 Settings Update Endpoint
app.post('/api/settings/update', (req, res) => {
  const newSettings = req.body;
  userSettings = { ...userSettings, ...newSettings };
  res.json({ success: true, settings: userSettings });
});

// 1.0.3 User Profile Update Endpoint
app.post('/api/user/update', (req, res) => {
  const { name, email, avatarUrl } = req.body;
  if (name) currentUser.name = name.trim();
  if (email) currentUser.email = email.trim();
  if (avatarUrl) currentUser.avatarUrl = avatarUrl.trim();
  res.json({ success: true, user: currentUser });
});

// 1.0.4 Data Export Endpoint
app.get('/api/export', (req, res) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    user: currentUser,
    settings: userSettings,
    projects,
    thoughts,
    relations,
    decisions,
    pivots,
    contradictions,
    clusters
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=thoughtflow-export.json');
  res.json(exportData);
});

// 1.1 Project Brain Synthesis Endpoint
app.post('/api/projects/brain', async (req, res) => {
  try {
    const { projectId } = req.body;
    const project = projects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projThoughts = thoughts.filter(t => t.projectIds.includes(projectId));
    const projDecisions = decisions.filter(d => d.projectId === projectId);
    const projPivots = pivots.filter(p => p.projectId === projectId);

    const ai = getGeminiClient();
    let brainSynthesis: ProjectBrain | null = null;

    if (ai) {
      try {
        const systemInstruction = `
Tu es l'Agent Architecte Cerveau de Projet de ThoughtFlow AI.
Ta tâche est de synthétiser le "Project Brain" (Cerveau du Projet) en analysant toutes les pensées, décisions, questions ouvertes et pivots historiques liés à ce projet.

Produis un objet JSON structuré :
1. 'visionSummary' : Résumé synthétique de la vision et de la trajectoire actuelle du projet (2 à 4 phrases).
2. 'currentFocus' : L'axe de travail prioritaire actuel.
3. 'openQuestions' : 2 à 4 questions stratégiques non résolues clés.
4. 'activeHypotheses' : 1 à 3 hypothèses principales en cours de vérification.
        `;

        const contextData = {
          projectName: project.name,
          projectDescription: project.description,
          thoughts: projThoughts.map(t => ({ title: t.title, content: t.content, type: t.type })),
          decisions: projDecisions.map(d => ({ title: d.title, description: d.description })),
          pivots: projPivots.map(p => ({ title: p.title, description: p.description, previous: p.previousVision, new: p.newVision }))
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: JSON.stringify(contextData),
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                visionSummary: { type: Type.STRING },
                currentFocus: { type: Type.STRING },
                openQuestions: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                },
                activeHypotheses: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ['visionSummary', 'currentFocus', 'openQuestions', 'activeHypotheses']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          brainSynthesis = {
            projectId,
            visionSummary: parsed.visionSummary,
            currentFocus: parsed.currentFocus,
            openQuestions: parsed.openQuestions || [],
            activeHypotheses: parsed.activeHypotheses || [],
            keyDecisions: projDecisions,
            pivots: projPivots,
            lastSynthesizedAt: new Date().toISOString()
          };
        }
      } catch (e) {
        console.error("Project brain synthesis error:", e);
      }
    }

    if (!brainSynthesis) {
      brainSynthesis = {
        projectId,
        visionSummary: `${project.name} est axé sur : ${project.description || 'aucun détail fournii.'}`,
        currentFocus: "Clarification des priorités et structuration des idées.",
        openQuestions: ["Quelle est la priorité de développement numéro 1 ?", "Comment mesurer le succès à court terme ?"],
        activeHypotheses: ["Les utilisateurs ont un besoin régulier de cet outil."],
        keyDecisions: projDecisions,
        pivots: projPivots,
        lastSynthesizedAt: new Date().toISOString()
      };
    }

    res.json({ brain: brainSynthesis });
  } catch (err) {
    console.error("Error in /api/projects/brain:", err);
    res.status(500).json({ error: "Server error synthesizing project brain." });
  }
});

// 1.2 Pivot Creation
app.post('/api/pivots', (req, res) => {
  const { projectId, title, description, previousVision, newVision } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ error: 'ProjectId and Title required' });
  }

  const newPivot: ProjectPivot = {
    id: `piv-${Date.now()}`,
    projectId,
    title: title.trim(),
    description: description ? description.trim() : '',
    previousVision: previousVision || '',
    newVision: newVision || '',
    createdAt: new Date().toISOString()
  };

  pivots.unshift(newPivot);

  res.status(201).json({ pivot: newPivot, pivots });
});

// 1.3 Merge Duplicate Thoughts
app.post('/api/thoughts/merge', (req, res) => {
  const { primaryId, secondaryId } = req.body;
  const primary = thoughts.find(t => t.id === primaryId);
  const secondary = thoughts.find(t => t.id === secondaryId);

  if (!primary || !secondary) {
    return res.status(404).json({ error: 'Thoughts not found' });
  }

  // Combine content
  primary.content = `${primary.content}\n\n--- [Fusionné avec: ${secondary.title}] ---\n${secondary.content}`;
  
  // Combine project associations
  const combinedProjects = Array.from(new Set([...primary.projectIds, ...secondary.projectIds]));
  primary.projectIds = combinedProjects;
  primary.updatedAt = new Date().toISOString();

  // Remove secondary thought
  thoughts = thoughts.filter(t => t.id !== secondaryId);

  // Transfer relations
  relations.forEach(r => {
    if (r.sourceId === secondaryId) r.sourceId = primaryId;
    if (r.targetId === secondaryId) r.targetId = primaryId;
  });

  res.json({ success: true, primaryThought: primary, data: { projects, thoughts, relations, decisions, contradictions, clusters, pivots } });
});

// 2. Capture & Analyze Thought
app.post('/api/thoughts', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content is required.' });
    }

    // Increment AI usage counter
    currentUser.usage.aiAnalysesUsed++;

    const ai = getGeminiClient();
    let analysisResult = null;

    if (ai) {
      try {
        const promptContext = {
          newThoughtContent: content.trim(),
          existingProjects: projects.map(p => ({ id: p.id, name: p.name, description: p.description })),
          existingDecisions: decisions.map(d => ({ id: d.id, title: d.title, description: d.description, projectId: d.projectId })),
          recentThoughts: thoughts.slice(0, 15).map(t => ({ id: t.id, title: t.title, content: t.content, projectIds: t.projectIds })),
        };

        const systemInstruction = `
Tu es un agent intelligent spécialisé dans la capture, l'analyse et l'organisation d'idées, pensées et notes pour un utilisateur.
Ta mission :
1. Déduire un titre court et pertinent (3 à 7 mots).
2. Déterminer le type de pensée : 'idea', 'note', 'question', 'hypothesis', 'decision', 'task', ou 'reflection'.
3. Analyser la correspondance avec les projets existants :
   - Confiance HAUTE ('high') : L'idée appartient clairement à 1 ou plusieurs projets (renvoie 'matchedProjectIds').
   - Confiance MOYENNE ('medium') : L'idée pourrait concerner 2 ou 3 projets, ou l'attribution est plausible mais nécessite validation (renvoie 'suggestedCandidateProjectIds' et pose une 'clarificationQuestion' amicale).
   - Confiance BASSE ('low') : Aucun projet ne correspond de façon évidente ou c'est une idée trop générale (conserve en Inbox, propose 'suggestedCandidateProjectIds' si pertinent).
4. Détecter des relations potentielles avec les pensées existantes ('similar_to', 'linked_to', 'depends_on', 'contradicts', 'stems_from', 'inspired_by', 'replaces').
5. Détecter s'il y a une CONTRADICTION flagrante avec une Décision enregistrée de l'utilisateur. Si oui, explique pourquoi.
6. Si l'utilisateur exprime une décision ferme (ex: "J'ai décidé que..."), indique 'isDecisionCandidate': true.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: JSON.stringify(promptContext),
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Titre concis' },
                type: { 
                  type: Type.STRING, 
                  enum: ['idea', 'note', 'question', 'hypothesis', 'decision', 'task', 'reflection'] 
                },
                confidence: { 
                  type: Type.STRING, 
                  enum: ['high', 'medium', 'low'] 
                },
                aiReasoning: { type: Type.STRING, description: "Explication courte de la décision d'organisation de l'agent" },
                matchedProjectIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "IDs des projets à forte correspondance" 
                },
                suggestedCandidateProjectIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "IDs des projets potentiels si confiance moyenne/basse" 
                },
                clarificationQuestion: { 
                  type: Type.STRING, 
                  description: "Question amicale si besoin de confirmation de l'utilisateur" 
                },
                newRelations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      targetId: { type: Type.STRING },
                      type: { 
                        type: Type.STRING, 
                        enum: ['similar_to', 'linked_to', 'depends_on', 'contradicts', 'stems_from', 'inspired_by', 'replaces'] 
                      },
                      confidence: { type: Type.NUMBER },
                      explanation: { type: Type.STRING }
                    },
                    required: ['targetId', 'type', 'confidence', 'explanation']
                  }
                },
                contradictions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      decisionId: { type: Type.STRING },
                      otherIdeaId: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      severity: { type: Type.STRING, enum: ['warning', 'conflict'] }
                    },
                    required: ['explanation', 'severity']
                  }
                },
                isDecisionCandidate: { type: Type.BOOLEAN },
                decisionDetail: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              },
              required: ['title', 'type', 'confidence', 'aiReasoning', 'matchedProjectIds', 'suggestedCandidateProjectIds', 'newRelations', 'contradictions']
            }
          }
        });

        if (response.text) {
          analysisResult = JSON.parse(response.text);
        }
      } catch (err) {
        console.error("Gemini analysis error:", err);
      }
    }

    // Fallback if AI not available or failed
    if (!analysisResult) {
      analysisResult = {
        title: content.slice(0, 40) + (content.length > 40 ? '...' : ''),
        type: 'idea',
        confidence: 'low',
        aiReasoning: 'Pensée capturée directement dans l\'Inbox.',
        matchedProjectIds: [],
        suggestedCandidateProjectIds: [],
        newRelations: [],
        contradictions: []
      };
    }

    const newThoughtId = `thought-${Date.now()}`;
    const matchedProjects = analysisResult.confidence === 'high' ? (analysisResult.matchedProjectIds || []) : [];
    const status = matchedProjects.length > 0 ? 'organized' : 'inbox';

    const newThought: Thought = {
      id: newThoughtId,
      title: analysisResult.title || content.slice(0, 30),
      content: content.trim(),
      type: analysisResult.type || 'idea',
      status,
      projectIds: matchedProjects,
      confidence: analysisResult.confidence || 'low',
      clarificationQuestion: analysisResult.clarificationQuestion || undefined,
      suggestedProjectIds: analysisResult.suggestedCandidateProjectIds || [],
      aiReasoning: analysisResult.aiReasoning,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };

    thoughts.unshift(newThought);

    // Save relations if any
    if (analysisResult.newRelations && Array.isArray(analysisResult.newRelations)) {
      for (const rel of analysisResult.newRelations) {
        if (rel.targetId && thoughts.some(t => t.id === rel.targetId)) {
          relations.push({
            id: `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sourceId: newThoughtId,
            targetId: rel.targetId,
            type: rel.type || 'linked_to',
            confidence: rel.confidence || 0.8,
            explanation: rel.explanation,
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // Save contradictions if any
    if (analysisResult.contradictions && Array.isArray(analysisResult.contradictions)) {
      for (const contra of analysisResult.contradictions) {
        contradictions.push({
          id: `contra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ideaId: newThoughtId,
          decisionId: contra.decisionId || undefined,
          otherIdeaId: contra.otherIdeaId || undefined,
          explanation: contra.explanation,
          severity: contra.severity || 'warning',
          resolved: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Save decision if candidate
    if (analysisResult.isDecisionCandidate && analysisResult.decisionDetail) {
      decisions.push({
        id: `dec-${Date.now()}`,
        title: analysisResult.decisionDetail.title || newThought.title,
        description: analysisResult.decisionDetail.description || newThought.content,
        projectId: matchedProjects[0] || undefined,
        associatedIdeaId: newThoughtId,
        createdAt: new Date().toISOString()
      });
    }

    res.status(201).json({
      thought: newThought,
      analysis: analysisResult,
      data: { projects, thoughts, relations, decisions, contradictions, clusters }
    });
  } catch (error) {
    console.error("Error in /api/thoughts:", error);
    res.status(500).json({ error: 'Internal server error while capturing thought.' });
  }
});

// 3. Update Placement / Assign Projects
app.post('/api/thoughts/placement', (req, res) => {
  const { thoughtId, projectIds, status } = req.body;
  const thought = thoughts.find(t => t.id === thoughtId);

  if (!thought) {
    return res.status(404).json({ error: 'Thought not found' });
  }

  thought.projectIds = Array.isArray(projectIds) ? projectIds : [];
  thought.status = status || (thought.projectIds.length > 0 ? 'organized' : 'inbox');
  thought.clarificationQuestion = undefined;
  thought.updatedAt = new Date().toISOString();

  res.json({ thought, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 4. Update Thought details
app.post('/api/thoughts/update', (req, res) => {
  const { thoughtId, title, content, type, status, projectIds } = req.body;
  const thought = thoughts.find(t => t.id === thoughtId);

  if (!thought) {
    return res.status(404).json({ error: 'Thought not found' });
  }

  if (title !== undefined) thought.title = title;
  if (content !== undefined) thought.content = content;
  if (type !== undefined) thought.type = type;
  if (status !== undefined) thought.status = status;
  if (Array.isArray(projectIds)) thought.projectIds = projectIds;
  thought.updatedAt = new Date().toISOString();

  res.json({ thought, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 5. Delete Thought
app.post('/api/thoughts/delete', (req, res) => {
  const { thoughtId } = req.body;
  thoughts = thoughts.filter(t => t.id !== thoughtId);
  relations = relations.filter(r => r.sourceId !== thoughtId && r.targetId !== thoughtId);
  contradictions = contradictions.filter(c => c.ideaId !== thoughtId && c.otherIdeaId !== thoughtId);

  res.json({ success: true, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 6. Create or Edit Project
app.post('/api/projects', (req, res) => {
  const { name, description, color, icon } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    color: color || 'indigo',
    icon: icon || 'Folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);

  res.status(201).json({ project: newProject, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

app.post('/api/projects/update', (req, res) => {
  const { projectId, name, description, color, icon } = req.body;
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description.trim();
  if (color !== undefined) project.color = color;
  if (icon !== undefined) project.icon = icon;
  project.updatedAt = new Date().toISOString();

  res.json({ project, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

app.post('/api/projects/delete', (req, res) => {
  const { projectId } = req.body;
  projects = projects.filter(p => p.id !== projectId);
  
  // Remove project association from thoughts
  thoughts.forEach(t => {
    t.projectIds = t.projectIds.filter(id => id !== projectId);
    if (t.projectIds.length === 0 && t.status === 'organized') {
      t.status = 'inbox';
    }
  });

  res.json({ success: true, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 7. Decisions CRUD
app.post('/api/decisions', (req, res) => {
  const { title, description, projectId, associatedIdeaId } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title required' });
  }

  const newDecision: Decision = {
    id: `dec-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    projectId: projectId || undefined,
    associatedIdeaId: associatedIdeaId || undefined,
    createdAt: new Date().toISOString()
  };

  decisions.push(newDecision);

  res.status(201).json({ decision: newDecision, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 8. Resolve & Arbitrate Contradictions with AI
app.post('/api/contradictions/resolve', (req, res) => {
  const { contradictionId } = req.body;
  const contra = contradictions.find(c => c.id === contradictionId);
  if (contra) {
    contra.resolved = true;
  }
  res.json({ success: true, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

app.post('/api/contradictions/ai-arbitrate', async (req, res) => {
  try {
    const { contradictionId } = req.body;
    const contra = contradictions.find(c => c.id === contradictionId);
    if (!contra) {
      return res.status(404).json({ error: 'Contradiction non trouvée' });
    }

    const idea = thoughts.find(t => t.id === contra.ideaId);
    const decision = decisions.find(d => d.id === contra.decisionId);
    const otherIdea = thoughts.find(t => t.id === contra.otherIdeaId);

    const ai = getGeminiClient();
    let proposedResolution = "Recommandation : Créer une variante expérimentale tout en maintenant la décision d'origine pour éviter tout risque opérationnel.";

    if (ai) {
      try {
        const promptContext = {
          explanation: contra.explanation,
          ideaTitle: idea?.title,
          ideaContent: idea?.content,
          decisionTitle: decision?.title,
          decisionDescription: decision?.description,
          otherIdeaTitle: otherIdea?.title
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Analyse ce conflit stratégique et propose un compromis structuré clair (3 phrases max en français) avec une recommandation d'action explicite : ${JSON.stringify(promptContext)}`
        });

        if (response.text) {
          proposedResolution = response.text.trim();
        }
      } catch (e) {
        console.error("Arbitration error:", e);
      }
    }

    res.json({ success: true, resolution: proposedResolution, contradiction: contra, idea, decision });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'arbitrage IA' });
  }
});

// 8.1 Batch Capture / Multi-Thought Segmenter
app.post('/api/thoughts/batch-capture', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Texte requis' });
    }

    let extractedItems: { title: string; content: string; type: ThoughtType }[] = [];

    try {
      const systemInstruction = `
Tu es un agent d'ingestion de comptes-rendus de réunion et notes brutes.
Découpe le texte fourni en plusieurs unités de pensée distinctes (idées, tâches, décisions, questions, hypothèses).
Renvoie un tableau JSON d'objets :
- 'title': Titre court (3 à 7 mots)
- 'content': Détail de la note ou tâche
- 'type': 'idea', 'task', 'decision', 'question', 'hypothesis', 'note'
      `;

      const responseText = await callUnifiedAI({
        prompt: rawText,
        systemInstruction,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['idea', 'task', 'decision', 'question', 'hypothesis', 'note'] }
            },
            required: ['title', 'content', 'type']
          }
        }
      });

      if (responseText) {
        extractedItems = JSON.parse(responseText);
      }
    } catch (e) {
      console.error("Batch extraction error:", e);
    }

    if (!extractedItems || !Array.isArray(extractedItems) || extractedItems.length === 0) {
      // Fallback simple line splitting
      const lines = rawText.split('\n').filter((l: string) => l.trim().length > 5);
      extractedItems = lines.map((l: string) => ({
        title: l.slice(0, 35) + '...',
        content: l,
        type: (l.toLowerCase().includes('décid') ? 'decision' : l.toLowerCase().includes('todo') ? 'task' : 'idea') as ThoughtType
      }));
    }

    const createdThoughts: Thought[] = [];
    for (const item of extractedItems) {
      const newT: Thought = {
        id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: item.title,
        content: item.content,
        type: item.type || 'idea',
        status: 'inbox',
        projectIds: [],
        confidence: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      thoughts.unshift(newT);
      createdThoughts.push(newT);
    }

    currentUser.usage.aiAnalysesUsed += extractedItems.length;

    res.status(201).json({ success: true, count: createdThoughts.length, thoughts: createdThoughts, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du traitement multi-pensées' });
  }
});

// 8.2 Soft Delete / Trash & Restore
app.post('/api/thoughts/trash', (req, res) => {
  const { thoughtId } = req.body;
  const thought = thoughts.find(t => t.id === thoughtId);
  if (thought) {
    thought.deletedAt = new Date().toISOString();
  }
  res.json({ success: true, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

app.post('/api/thoughts/restore', (req, res) => {
  const { thoughtId } = req.body;
  const thought = thoughts.find(t => t.id === thoughtId);
  if (thought) {
    thought.deletedAt = undefined;
  }
  res.json({ success: true, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 8.3 Data Import Endpoint (JSON & Markdown)
app.post('/api/import', (req, res) => {
  try {
    const { format, data } = req.body;
    if (!data) return res.status(400).json({ error: 'Données absentes' });

    let importedCount = 0;

    if (format === 'json') {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (Array.isArray(parsed.thoughts)) {
        for (const t of parsed.thoughts) {
          if (t.title && !thoughts.some(ex => ex.id === t.id)) {
            thoughts.unshift({
              ...t,
              id: t.id || `thought-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              createdAt: t.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            importedCount++;
          }
        }
      }
      if (Array.isArray(parsed.projects)) {
        for (const p of parsed.projects) {
          if (p.name && !projects.some(ex => ex.id === p.id)) {
            projects.push({ ...p, id: p.id || `proj-${Date.now()}` });
          }
        }
      }
    } else if (format === 'markdown') {
      // Split markdown by headings
      const sections = (data as string).split(/^#+\s+/m).filter(s => s.trim().length > 0);
      for (const section of sections) {
        const lines = section.trim().split('\n');
        const title = lines[0].slice(0, 60);
        const content = lines.slice(1).join('\n').trim() || title;
        thoughts.unshift({
          id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title,
          content,
          type: 'note',
          status: 'inbox',
          projectIds: [],
          confidence: 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        importedCount++;
      }
    }

    res.json({ success: true, importedCount, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
  } catch (err) {
    res.status(400).json({ error: 'Format de fichier ou syntaxe invalide' });
  }
});

// 8.4 Project Member Management (Team Brain)
app.post('/api/projects/members', (req, res) => {
  const { projectId, memberEmail, role } = req.body;
  const project = projects.find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: 'Projet non trouvé' });

  if (!project.members) project.members = [];
  const existing = project.members.find(m => m.email === memberEmail);
  if (existing) {
    existing.role = role || 'editor';
  } else {
    project.members.push({
      email: memberEmail,
      role: role || 'editor',
      name: memberEmail.split('@')[0],
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberEmail)}&background=random`
    });
  }

  res.json({ success: true, project, projects });
});

// 9. Convert Emerging Cluster to Project
app.post('/api/clusters/create-project', (req, res) => {
  const { clusterId, color, icon } = req.body;
  const cluster = clusters.find(c => c.id === clusterId);

  if (!cluster) {
    return res.status(404).json({ error: 'Cluster not found' });
  }

  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: cluster.proposedName,
    description: cluster.description || cluster.reasoning,
    color: color || 'purple',
    icon: icon || 'Sparkles',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.push(newProject);

  // Assign project to cluster thoughts
  cluster.ideaIds.forEach(ideaId => {
    const t = thoughts.find(th => th.id === ideaId);
    if (t) {
      if (!t.projectIds.includes(newProject.id)) {
        t.projectIds.push(newProject.id);
      }
      t.status = 'organized';
    }
  });

  cluster.dismissed = true;

  res.json({ project: newProject, data: { projects, thoughts, relations, decisions, contradictions, clusters } });
});

// 10. Agent Chat Endpoint
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: "Désolé, la clé API Gemini n'est pas disponible pour l'instant dans l'environnement.",
        suggestedActions: []
      });
    }

    const systemInstruction = `
Tu es l'Agent Architecte de pensée de ThoughtFlow AI.
Tu possèdes une vue globale sur tout le corpus de l'utilisateur : ses Projets, ses Idées/Pensées, ses Décisions, ses Relations, ses Contradictions et les Regroupements émergents.

Ton rôle :
- Répondre avec grande précision, empathie et pertinence en français.
- Synthétiser, retrouver des connexions, expliquer l'organisation actuelle.
- Proposer des conseils d'organisation, identifier des questions non résolues ou des opportunités.
- Si pertinent, inclure dans la réponse JSON des 'suggestedActions' permettant à l'IHM d'afficher des boutons d'action rapides (ex: 'view_project', 'create_project', 'view_idea', 'resolve_contradiction').

Structure JSON attendue :
{
  "reply": "Ta réponse textuelle détaillée et bien structurée en markdown",
  "suggestedActions": [
    {
      "label": "Titre du bouton",
      "action": "view_project" | "create_project" | "view_idea" | "resolve_contradiction",
      "payload": { "id": "proj-1" }
    }
  ]
}
    `;

    const fullContext = {
      userQuestion: message,
      chatHistory: history || [],
      currentProjects: projects,
      currentThoughts: thoughts,
      currentDecisions: decisions,
      currentRelations: relations,
      currentContradictions: contradictions.filter(c => !c.resolved),
      currentClusters: clusters.filter(c => !c.dismissed)
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: JSON.stringify(fullContext),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            suggestedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  action: { type: Type.STRING, enum: ['view_project', 'create_project', 'view_idea', 'resolve_contradiction'] },
                  payload: { 
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING }
                    }
                  }
                },
                required: ['label', 'action']
              }
            }
          },
          required: ['reply']
        }
      }
    });

    let result = { reply: "Je suis désolé, je n'ai pas pu analyser la demande.", suggestedActions: [] };
    if (response.text) {
      try {
        result = JSON.parse(response.text);
      } catch (e) {
        result = { reply: response.text, suggestedActions: [] };
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in /api/agent/chat:", error);
    res.status(500).json({ error: "Erreur serveur lors de la discussion avec l'agent." });
  }
});

// 11. Admin System & Role Management Endpoints
app.get('/api/admin/metrics', (req, res) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé. Privilèges administrateur requis.' });
  }

  // Calculate MRR
  const mrr = systemUsers.reduce((acc, u) => {
    if (u.plan === 'pro') return acc + 19;
    if (u.plan === 'team') return acc + 49;
    return acc;
  }, 0);

  const activeSubscriptions = {
    free: systemUsers.filter(u => u.plan === 'free').length,
    pro: systemUsers.filter(u => u.plan === 'pro').length,
    team: systemUsers.filter(u => u.plan === 'team').length,
  };

  const metrics: AdminSystemMetrics = {
    totalUsers: systemUsers.length,
    activeAdmins: systemUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    mrr,
    totalThoughtsCaptured: thoughts.length + 85, // include baseline system count
    totalProjectsCreated: projects.length,
    aiAnalysesThisMonth: systemUsers.reduce((acc, u) => acc + u.analysesCount, 0),
    geminiLatencyMs: 142,
    geminiApiStatus: 'operational',
    activeSubscriptions,
    users: systemUsers,
    auditLogs
  };

  res.json(metrics);
});

// Update User Role
app.post('/api/admin/users/role', (req, res) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const { userId, newRole } = req.body;
  if (!userId || !newRole) {
    return res.status(400).json({ error: 'userId and newRole required' });
  }

  const targetUser = systemUsers.find(u => u.id === userId);
  if (targetUser) {
    const oldRole = targetUser.role;
    targetUser.role = newRole as UserRole;

    if (targetUser.id === currentUser.id) {
      currentUser.role = newRole as UserRole;
    }

    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ROLE_MODIFIED',
      userEmail: targetUser.email,
      details: `Rôle modifié de ${oldRole.toUpperCase()} vers ${newRole.toUpperCase()}`,
      type: 'role'
    };
    auditLogs.unshift(newLog);

    res.json({ success: true, user: targetUser, users: systemUsers, auditLogs, currentUser });
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

// Override User Plan Subscription
app.post('/api/admin/users/plan', (req, res) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const { userId, newPlan } = req.body;
  const targetUser = systemUsers.find(u => u.id === userId);
  if (targetUser) {
    const oldPlan = targetUser.plan;
    targetUser.plan = newPlan;

    if (targetUser.id === currentUser.id) {
      currentUser.plan = newPlan;
    }

    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'ADMIN_SUBSCRIPTION_OVERRIDE',
      userEmail: targetUser.email,
      details: `Forfait modifié manuellement de ${oldPlan.toUpperCase()} vers ${newPlan.toUpperCase()}`,
      type: 'subscription'
    };
    auditLogs.unshift(newLog);

    res.json({ success: true, user: targetUser, users: systemUsers, auditLogs, currentUser });
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

// Update User Account Status (Suspend/Activate)
app.post('/api/admin/users/status', (req, res) => {
  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }

  const { userId, newStatus } = req.body;
  const targetUser = systemUsers.find(u => u.id === userId);
  if (targetUser) {
    targetUser.status = newStatus;

    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: newStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_ACTIVATED',
      userEmail: targetUser.email,
      details: `Statut du compte changé vers ${newStatus.toUpperCase()}`,
      type: 'security'
    };
    auditLogs.unshift(newLog);

    res.json({ success: true, user: targetUser, users: systemUsers, auditLogs });
  } else {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
  }
});

// Toggle Current User Role (Testing endpoint)
app.post('/api/user/toggle-role', (req, res) => {
  const nextRole: UserRole = currentUser.role === 'admin' ? 'user' : 'admin';
  currentUser.role = nextRole;

  const targetInList = systemUsers.find(u => u.id === currentUser.id);
  if (targetInList) {
    targetInList.role = nextRole;
  }

  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TEST_ROLE_TOGGLE',
    userEmail: currentUser.email,
    details: `Bascule de test du rôle vers : ${nextRole.toUpperCase()}`,
    type: 'role'
  };
  auditLogs.unshift(newLog);

  res.json({ success: true, currentUser, role: nextRole });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount Vite middleware in dev, serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ThoughtFlow AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
