import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'thoughtflow-ai-secret-key-32bytes!!'; // 32 chars
const IV_LENGTH = 16;

export function encryptApiKey(text: string): string {
  if (!text || text.startsWith('enc:')) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `enc:${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptApiKey(text: string): string {
  if (!text || !text.startsWith('enc:')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption error:", err);
    return text;
  }
}

export function maskApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  const raw = key.startsWith('enc:') ? decryptApiKey(key) : key;
  if (raw.length <= 8) return '****';
  return `${raw.slice(0, 4)}...${raw.slice(-4)}`;
}

// PII Anonymization / Filter
export function anonymizePII(text: string): string {
  if (!text) return text;
  // Mask Emails
  let anonymized = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_PROTECTÉ]');
  // Mask French/US phone numbers
  anonymized = anonymized.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[TEL_PROTECTÉ]');
  // Mask Credit Card patterns
  anonymized = anonymized.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARTE_PROTECTÉE]');
  return anonymized;
}

// Rate Limiter
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests: number = 60, windowMs: number = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: 'Trop de requêtes. Veuillez patienter un instant avant de réessayer.'
      });
    }

    record.count++;
    next();
  };
}
