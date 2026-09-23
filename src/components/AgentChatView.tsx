import React, { useState, useRef, useEffect } from 'react';
import { AgentChatMessage } from '../types';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  Sparkles, 
  Lightbulb, 
  Folder, 
  CheckCircle, 
  Compass,
  ArrowRight
} from 'lucide-react';

interface AgentChatViewProps {
  onSendMessage: (msg: string) => Promise<{ reply: string; suggestedActions?: any[] }>;
  onSelectProject?: (projectId: string) => void;
  onCreateProjectModal?: () => void;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  onSendMessage,
  onSelectProject,
  onCreateProjectModal,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      content: "Bonjour ! Je suis votre Agent Architecte d'Idées. Je possède une vue globale sur l'ensemble de vos projets, décisions et pensées capturées. Que souhaitez-vous analyser ou retrouver aujourd'hui ?",
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: "Quelles idées ai-je sur l'apprentissage ?", action: 'view_project' },
        { label: "Synthétise mes décisions clés", action: 'view_project' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    const userMsg: AgentChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const result = await onSendMessage(query);
      const agentMsg: AgentChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        content: result.reply,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: result.suggestedActions
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'agent',
        content: "Désolé, une erreur s'est produite lors de la discussion avec l'agent.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const sampleQuestions = [
    "Quelles idées sont dans mon Inbox ?",
    "Y a-t-il des contradictions dans mes idées ?",
    "Quelles idées sont liées au projet de recettes ?",
    "Suggère-moi une nouvelle structure de projet."
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[750px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      
      {/* Agent Chat Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Agent Architecte d'Idées</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] rounded-full">Actif</span>
            </h2>
            <p className="text-slate-400 text-xs">Propulsé par Gemini 3.8 Flash • Analyse du contexte complet</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'agent' && (
              <div className="h-8 w-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div className={`max-w-[80%] space-y-2 ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none p-3.5 text-sm shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-2xl rounded-tl-none p-4 text-sm shadow-md'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Actionable buttons inside message */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {msg.suggestedActions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (act.action === 'view_project' && act.payload?.id && onSelectProject) {
                          onSelectProject(act.payload.id);
                        } else if (act.action === 'create_project' && onCreateProjectModal) {
                          onCreateProjectModal();
                        } else {
                          handleSend(act.label);
                        }
                      }}
                      className="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className={`text-[10px] ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                {msg.timestamp}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
              <span>Analyse et formulation de la réponse...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-medium text-slate-500 shrink-0">Exemples :</span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez une question à l'agent sur vos idées ou vos projets..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 shadow-md shadow-purple-600/20"
          >
            <span>Envoyer</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
