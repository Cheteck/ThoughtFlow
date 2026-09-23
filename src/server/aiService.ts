import { GoogleGenAI } from '@google/genai';
import { store } from './store.js';
import { decryptApiKey, anonymizePII } from './security.js';

export function getGeminiClient() {
  const db = store.get();
  const customKey = db.userSettings.customApiKey ? decryptApiKey(db.userSettings.customApiKey) : undefined;
  const apiKey = customKey || process.env.GEMINI_API_KEY;
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

export async function callUnifiedAI({
  prompt,
  systemInstruction,
  responseSchema,
  isJson = true,
  enablePiiFilter = true
}: {
  prompt: string;
  systemInstruction: string;
  responseSchema?: any;
  isJson?: boolean;
  enablePiiFilter?: boolean;
}): Promise<string | null> {
  const db = store.get();
  const provider = db.userSettings.aiProvider || 'google';
  const modelName = db.userSettings.aiModel || 'gemini-3.8-flash';

  const processedPrompt = enablePiiFilter ? anonymizePII(prompt) : prompt;

  // 1. OpenAI Provider
  if (provider === 'openai') {
    const rawKey = db.userSettings.openaiApiKey ? decryptApiKey(db.userSettings.openaiApiKey) : undefined;
    const apiKey = rawKey || process.env.OPENAI_API_KEY;
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
              { role: 'user', content: processedPrompt }
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
    const rawKey = db.userSettings.anthropicApiKey ? decryptApiKey(db.userSettings.anthropicApiKey) : undefined;
    const apiKey = rawKey || process.env.ANTHROPIC_API_KEY;
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
            messages: [{ role: 'user', content: processedPrompt }]
          })
        });
        if (response.ok) {
          const data = await response.json();
          return data.content?.[0]?.text || null;
        }
      } catch (e) {
        console.warn("Anthropic API call failed, falling back to Gemini:", e);
      }
    }
  }

  // 3. Ollama or Custom Endpoint
  if (provider === 'ollama' || provider === 'custom') {
    const endpoint = db.userSettings.customEndpoint || 'http://localhost:11434/v1';
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
            { role: 'user', content: processedPrompt }
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
  const rawKey = db.userSettings.customApiKey ? decryptApiKey(db.userSettings.customApiKey) : undefined;
  const apiKey = rawKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName.startsWith('gemini') ? modelName : 'gemini-3.8-flash',
      contents: processedPrompt,
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
