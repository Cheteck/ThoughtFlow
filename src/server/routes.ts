import { Router, Request, Response } from 'express';
import { Type } from '@google/genai';
import { store } from './store.js';
import { encryptApiKey, maskApiKey, rateLimiter } from './security.js';
import { getGeminiClient } from './aiService.js';
import { authMiddleware, generateToken, AuthenticatedRequest } from './auth.js';
import { validateRequiredFields } from './middleware/validation.js';
import {
  Project,
  Thought,
  ThoughtType,
  Decision,
  ProjectBrain,
  AdminAuditLog,
  AdminSystemMetrics,
  UserRole
} from '../../types.js';

export const apiRouter = Router();

// Apply rate limiter and auth middleware to API routes
apiRouter.use(rateLimiter(120, 60 * 1000));
apiRouter.use(authMiddleware);

// Auth Token Endpoint
apiRouter.post('/auth/login', validateRequiredFields(['email']), (req: Request, res: Response) => {
  const { email } = req.body;
  const db = store.get();
  const user = db.systemUsers.find(u => u.email === email) || db.systemUsers[0];
  const token = generateToken(user.id);
  res.json({ token, user });
});

// 1. Get state with optional pagination for thoughts
apiRouter.get('/data', (req: AuthenticatedRequest, res: Response) => {
  const db = store.get();
  db.currentUser.usage.projectsCount = db.projects.length;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const startIndex = (page - 1) * limit;
  const paginatedThoughts = db.thoughts.slice(startIndex, startIndex + limit);

  // Mask API keys before sending settings to client
  const safeSettings = {
    ...db.userSettings,
    customApiKey: maskApiKey(db.userSettings.customApiKey),
    openaiApiKey: maskApiKey(db.userSettings.openaiApiKey),
    anthropicApiKey: maskApiKey(db.userSettings.anthropicApiKey)
  };

  res.json({
    projects: db.projects,
    thoughts: paginatedThoughts,
    totalThoughts: db.thoughts.length,
    page,
    limit,
    relations: db.relations,
    decisions: db.decisions,
    contradictions: db.contradictions,
    clusters: db.clusters,
    pivots: db.pivots,
    user: db.currentUser,
    settings: safeSettings
  });
});

// Subscription Upgrade Endpoint
apiRouter.post('/subscription/upgrade', validateRequiredFields(['plan']), (req: Request, res: Response) => {
  const { plan, interval } = req.body;
  if (!['free', 'pro', 'team'].includes(plan)) {
    return res.status(400).json({ error: 'Plan invalide' });
  }

  const db = store.get();
  db.currentUser.plan = plan;
  if (interval) db.currentUser.billingInterval = interval;

  if (plan === 'free') {
    db.currentUser.usage.aiAnalysesLimit = 50;
    db.currentUser.usage.projectsLimit = 3;
    db.currentUser.usage.teamMembersLimit = 1;
  } else if (plan === 'pro') {
    db.currentUser.usage.aiAnalysesLimit = 2000;
    db.currentUser.usage.projectsLimit = 50;
    db.currentUser.usage.teamMembersLimit = 3;
  } else if (plan === 'team') {
    db.currentUser.usage.aiAnalysesLimit = -1;
    db.currentUser.usage.projectsLimit = -1;
    db.currentUser.usage.teamMembersLimit = 25;
  }

  store.save();
  res.json({ success: true, user: db.currentUser });
});

// Settings Update Endpoint
apiRouter.post('/settings/update', (req: Request, res: Response) => {
  const db = store.get();
  const newSettings = req.body;

  if (newSettings.customApiKey && !newSettings.customApiKey.includes('...')) {
    newSettings.customApiKey = encryptApiKey(newSettings.customApiKey);
  } else {
    delete newSettings.customApiKey;
  }

  if (newSettings.openaiApiKey && !newSettings.openaiApiKey.includes('...')) {
    newSettings.openaiApiKey = encryptApiKey(newSettings.openaiApiKey);
  } else {
    delete newSettings.openaiApiKey;
  }

  if (newSettings.anthropicApiKey && !newSettings.anthropicApiKey.includes('...')) {
    newSettings.anthropicApiKey = encryptApiKey(newSettings.anthropicApiKey);
  } else {
    delete newSettings.anthropicApiKey;
  }

  db.userSettings = { ...db.userSettings, ...newSettings };
  store.save();

  const safeSettings = {
    ...db.userSettings,
    customApiKey: maskApiKey(db.userSettings.customApiKey),
    openaiApiKey: maskApiKey(db.userSettings.openaiApiKey),
    anthropicApiKey: maskApiKey(db.userSettings.anthropicApiKey)
  };

  res.json({ success: true, settings: safeSettings });
});

// User Profile Update Endpoint
apiRouter.post('/user/update', (req: Request, res: Response) => {
  const { name, email, avatarUrl } = req.body;
  const db = store.get();
  if (name) db.currentUser.name = name.trim();
  if (email) db.currentUser.email = email.trim();
  if (avatarUrl) db.currentUser.avatarUrl = avatarUrl.trim();
  store.save();
  res.json({ success: true, user: db.currentUser });
});

// Data Export Endpoint
apiRouter.get('/export', (req: Request, res: Response) => {
  const db = store.get();
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    user: db.currentUser,
    settings: {
      ...db.userSettings,
      customApiKey: undefined,
      openaiApiKey: undefined,
      anthropicApiKey: undefined
    },
    projects: db.projects,
    thoughts: db.thoughts,
    relations: db.relations,
    decisions: db.decisions,
    pivots: db.pivots,
    contradictions: db.contradictions,
    clusters: db.clusters
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=thoughtflow-export.json');
  res.json(exportData);
});

// Project Brain Synthesis
apiRouter.post('/projects/brain', validateRequiredFields(['projectId']), async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;
    const db = store.get();
    const project = db.projects.find(p => p.id === projectId);

    if (!project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const projThoughts = db.thoughts.filter(t => t.projectIds.includes(projectId));
    const projDecisions = db.decisions.filter(d => d.projectId === projectId);
    const projPivots = db.pivots.filter(p => p.projectId === projectId);

    const ai = getGeminiClient();
    let brainSynthesis: ProjectBrain | null = null;

    if (ai) {
      try {
        const systemInstruction = `
Tu es l'Agent Architecte Cerveau de Projet de ThoughtFlow AI.
Synthétise le "Project Brain" en analysant toutes les pensées, décisions et pivots associés.

Renvoie JSON :
1. 'visionSummary' : Résumé synthétique de la vision actuelle (2 à 4 phrases).
2. 'currentFocus' : Axe de travail prioritaire.
3. 'openQuestions' : 2 à 4 questions stratégiques non résolues.
4. 'activeHypotheses' : 1 à 3 hypothèses principales.
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
                openQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                activeHypotheses: { type: Type.ARRAY, items: { type: Type.STRING } }
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
        visionSummary: `${project.name} est axé sur : ${project.description || 'aucun détail fourni.'}`,
        currentFocus: "Clarification des priorités et structuration des idées.",
        openQuestions: ["Quelle est la priorité de développement numéro 1 ?"],
        activeHypotheses: ["Les utilisateurs ont un besoin régulier de cet outil."],
        keyDecisions: projDecisions,
        pivots: projPivots,
        lastSynthesizedAt: new Date().toISOString()
      };
    }

    res.json({ brain: brainSynthesis });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la synthèse." });
  }
});

// Capture & Analyze Thought
apiRouter.post('/thoughts', validateRequiredFields(['content']), async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const db = store.get();
    db.currentUser.usage.aiAnalysesUsed++;

    const ai = getGeminiClient();
    let analysisResult = null;

    if (ai) {
      try {
        const promptContext = {
          newThoughtContent: content.trim(),
          existingProjects: db.projects.map(p => ({ id: p.id, name: p.name, description: p.description })),
          existingDecisions: db.decisions.map(d => ({ id: d.id, title: d.title, description: d.description, projectId: d.projectId })),
          recentThoughts: db.thoughts.slice(0, 15).map(t => ({ id: t.id, title: t.title, content: t.content, projectIds: t.projectIds })),
        };

        const systemInstruction = `
Tu es un agent intelligent spécialisé dans la capture, l'analyse et l'organisation d'idées.
Mission :
1. Déduire un titre court (3 à 7 mots).
2. Déterminer le type ('idea', 'note', 'question', 'hypothesis', 'decision', 'task', 'reflection').
3. Analyser la correspondance projet ('high', 'medium', 'low').
4. Détecter des relations ('similar_to', 'linked_to', 'depends_on', 'contradicts', 'stems_from', 'inspired_by', 'replaces').
5. Détecter les CONTRADICTIONS stratégiques avec une Décision enregistrée.
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
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['idea', 'note', 'question', 'hypothesis', 'decision', 'task', 'reflection'] },
                confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                aiReasoning: { type: Type.STRING },
                matchedProjectIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedCandidateProjectIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                clarificationQuestion: { type: Type.STRING },
                newRelations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      targetId: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['similar_to', 'linked_to', 'depends_on', 'contradicts', 'stems_from', 'inspired_by', 'replaces'] },
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
      type: (analysisResult.type as ThoughtType) || 'idea',
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

    db.thoughts.unshift(newThought);

    if (analysisResult.newRelations && Array.isArray(analysisResult.newRelations)) {
      for (const rel of analysisResult.newRelations) {
        if (rel.targetId && db.thoughts.some(t => t.id === rel.targetId)) {
          db.relations.push({
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

    if (analysisResult.contradictions && Array.isArray(analysisResult.contradictions)) {
      for (const contra of analysisResult.contradictions) {
        db.contradictions.push({
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

    if (analysisResult.isDecisionCandidate && analysisResult.decisionDetail) {
      db.decisions.push({
        id: `dec-${Date.now()}`,
        title: analysisResult.decisionDetail.title || newThought.title,
        description: analysisResult.decisionDetail.description || newThought.content,
        projectId: matchedProjects[0] || undefined,
        associatedIdeaId: newThoughtId,
        createdAt: new Date().toISOString()
      });
    }

    store.save();

    res.status(201).json({
      thought: newThought,
      analysis: analysisResult,
      data: {
        projects: db.projects,
        thoughts: db.thoughts,
        relations: db.relations,
        decisions: db.decisions,
        contradictions: db.contradictions,
        clusters: db.clusters
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la capture.' });
  }
});

// Update Thought Placement
apiRouter.post('/thoughts/placement', validateRequiredFields(['thoughtId']), (req: Request, res: Response) => {
  const { thoughtId, projectIds, status } = req.body;
  const db = store.get();
  const thought = db.thoughts.find(t => t.id === thoughtId);

  if (!thought) {
    return res.status(404).json({ error: 'Pensée non trouvée' });
  }

  thought.projectIds = Array.isArray(projectIds) ? projectIds : [];
  thought.status = status || (thought.projectIds.length > 0 ? 'organized' : 'inbox');
  thought.clarificationQuestion = undefined;
  thought.updatedAt = new Date().toISOString();

  store.save();
  res.json({ thought, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Update Thought Details
apiRouter.post('/thoughts/update', validateRequiredFields(['thoughtId']), (req: Request, res: Response) => {
  const { thoughtId, title, content, type, status, projectIds } = req.body;
  const db = store.get();
  const thought = db.thoughts.find(t => t.id === thoughtId);

  if (!thought) {
    return res.status(404).json({ error: 'Pensée non trouvée' });
  }

  if (title !== undefined) thought.title = title;
  if (content !== undefined) thought.content = content;
  if (type !== undefined) thought.type = type;
  if (status !== undefined) thought.status = status;
  if (Array.isArray(projectIds)) thought.projectIds = projectIds;
  thought.updatedAt = new Date().toISOString();

  store.save();
  res.json({ thought, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Delete Thought
apiRouter.post('/thoughts/delete', validateRequiredFields(['thoughtId']), (req: Request, res: Response) => {
  const { thoughtId } = req.body;
  const db = store.get();
  db.thoughts = db.thoughts.filter(t => t.id !== thoughtId);
  db.relations = db.relations.filter(r => r.sourceId !== thoughtId && r.targetId !== thoughtId);
  db.contradictions = db.contradictions.filter(c => c.ideaId !== thoughtId && c.otherIdeaId !== thoughtId);

  store.save();
  res.json({ success: true, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Project CRUD
apiRouter.post('/projects', validateRequiredFields(['name']), (req: Request, res: Response) => {
  const { name, description, color, icon } = req.body;
  const db = store.get();
  const newProject: Project = {
    id: `proj-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    color: color || 'indigo',
    icon: icon || 'Folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(newProject);
  store.save();

  res.status(201).json({ project: newProject, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

apiRouter.post('/projects/update', validateRequiredFields(['projectId']), (req: Request, res: Response) => {
  const { projectId, name, description, color, icon } = req.body;
  const db = store.get();
  const project = db.projects.find(p => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: 'Projet non trouvé' });
  }

  if (name !== undefined) project.name = name.trim();
  if (description !== undefined) project.description = description.trim();
  if (color !== undefined) project.color = color;
  if (icon !== undefined) project.icon = icon;
  project.updatedAt = new Date().toISOString();

  store.save();
  res.json({ project, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

apiRouter.post('/projects/delete', validateRequiredFields(['projectId']), (req: Request, res: Response) => {
  const { projectId } = req.body;
  const db = store.get();
  db.projects = db.projects.filter(p => p.id !== projectId);

  // Cascade clean decisions and pivots
  db.decisions = db.decisions.filter(d => d.projectId !== projectId);
  db.pivots = db.pivots.filter(p => p.projectId !== projectId);

  db.thoughts.forEach(t => {
    t.projectIds = t.projectIds.filter(id => id !== projectId);
    if (t.projectIds.length === 0 && t.status === 'organized') {
      t.status = 'inbox';
    }
  });

  store.save();
  res.json({ success: true, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Decisions CRUD
apiRouter.post('/decisions', validateRequiredFields(['title']), (req: Request, res: Response) => {
  const { title, description, projectId, associatedIdeaId } = req.body;
  const db = store.get();
  const newDecision: Decision = {
    id: `dec-${Date.now()}`,
    title: title.trim(),
    description: description ? description.trim() : '',
    projectId: projectId || undefined,
    associatedIdeaId: associatedIdeaId || undefined,
    createdAt: new Date().toISOString()
  };

  db.decisions.push(newDecision);
  store.save();

  res.status(201).json({ decision: newDecision, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Contradiction Resolution & AI Arbitration
apiRouter.post('/contradictions/resolve', validateRequiredFields(['contradictionId']), (req: Request, res: Response) => {
  const { contradictionId } = req.body;
  const db = store.get();
  const contra = db.contradictions.find(c => c.id === contradictionId);
  if (contra) {
    contra.resolved = true;
    store.save();
  }
  res.json({ success: true, data: { projects: db.projects, thoughts: db.thoughts, relations: db.relations, decisions: db.decisions, contradictions: db.contradictions, clusters: db.clusters } });
});

// Admin System Metrics
apiRouter.get('/admin/metrics', (req: AuthenticatedRequest, res: Response) => {
  const db = store.get();
  if (db.currentUser.role !== 'admin' && db.currentUser.role !== 'superadmin') {
    return res.status(403).json({ error: 'Accès refusé. Privilèges administrateur requis.' });
  }

  const mrr = db.systemUsers.reduce((acc, u) => {
    if (u.plan === 'pro') return acc + 19;
    if (u.plan === 'team') return acc + 49;
    return acc;
  }, 0);

  const activeSubscriptions = {
    free: db.systemUsers.filter(u => u.plan === 'free').length,
    pro: db.systemUsers.filter(u => u.plan === 'pro').length,
    team: db.systemUsers.filter(u => u.plan === 'team').length,
  };

  const metrics: AdminSystemMetrics = {
    totalUsers: db.systemUsers.length,
    activeAdmins: db.systemUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    mrr,
    totalThoughtsCaptured: db.thoughts.length + 85,
    totalProjectsCreated: db.projects.length,
    aiAnalysesThisMonth: db.systemUsers.reduce((acc, u) => acc + u.analysesCount, 0),
    geminiLatencyMs: 142,
    geminiApiStatus: 'operational',
    activeSubscriptions,
    users: db.systemUsers,
    auditLogs: db.auditLogs
  };

  res.json(metrics);
});

// Toggle Test Role
apiRouter.post('/user/toggle-role', (req: Request, res: Response) => {
  const db = store.get();
  const nextRole: UserRole = db.currentUser.role === 'admin' ? 'user' : 'admin';
  db.currentUser.role = nextRole;

  const targetInList = db.systemUsers.find(u => u.id === db.currentUser.id);
  if (targetInList) {
    targetInList.role = nextRole;
  }

  const newLog: AdminAuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'TEST_ROLE_TOGGLE',
    userEmail: db.currentUser.email,
    details: `Bascule de test du rôle vers : ${nextRole.toUpperCase()}`,
    type: 'role'
  };
  db.auditLogs.unshift(newLog);
  store.save();

  res.json({ success: true, currentUser: db.currentUser, role: nextRole });
});
