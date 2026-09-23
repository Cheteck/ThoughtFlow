import { Thought } from '../types.js';

export function calculateCosineSimilarity(textA: string, textB: string): number {
  const tokenize = (str: string) => str.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
  const wordsA = tokenize(textA);
  const wordsB = tokenize(textB);

  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();

  wordsA.forEach(w => freqA.set(w, (freqA.get(w) || 0) + 1));
  wordsB.forEach(w => freqB.set(w, (freqB.get(w) || 0) + 1));

  const allWords = new Set([...freqA.keys(), ...freqB.keys()]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allWords.forEach(w => {
    const valA = freqA.get(w) || 0;
    const valB = freqB.get(w) || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  });

  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function selectRelevantThoughts(query: string, thoughts: Thought[], k: number = 3): Thought[] {
  if (thoughts.length <= k) return thoughts;

  const scored = thoughts.map(t => ({
    thought: t,
    score: calculateCosineSimilarity(query, `${t.title} ${t.content}`)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map(s => s.thought);
}
