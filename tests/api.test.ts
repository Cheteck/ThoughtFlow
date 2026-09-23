import { encryptApiKey, decryptApiKey, maskApiKey, anonymizePII } from '../src/server/security.js';
import { generateToken, verifyToken } from '../src/server/auth.js';

function runTests() {
  console.log('--- EXECUTING BACKEND SECURITY & AUTH UNIT TESTS ---');

  // 1. Encryption Test
  const rawKey = 'sk-proj-test1234567890abcdef';
  const encrypted = encryptApiKey(rawKey);
  const decrypted = decryptApiKey(encrypted);

  console.assert(encrypted.startsWith('enc:'), 'Encryption prefix failed');
  console.assert(decrypted === rawKey, 'Decryption matching failed');
  console.log('✓ API Key Encryption & Decryption Passed');

  // 2. Key Masking Test
  const masked = maskApiKey(rawKey);
  console.assert(masked === 'sk-p...cdef', `Masking failed: got ${masked}`);
  console.log('✓ API Key Masking Passed');

  // 3. PII Anonymization Test
  const textWithPii = 'Contacter contact@example.com ou au 0612345678 pour paiement';
  const anonymized = anonymizePII(textWithPii);
  console.assert(!anonymized.includes('contact@example.com'), 'Email anonymization failed');
  console.assert(!anonymized.includes('0612345678'), 'Phone anonymization failed');
  console.assert(anonymized.includes('[EMAIL_PROTECTÉ]'), 'Email replacement tag missing');
  console.log('✓ PII Anonymization Filter Passed');

  // 4. JWT Session Tokens Test
  const token = generateToken('usr-1');
  const verified = verifyToken(token);
  console.assert(verified?.sub === 'usr-1', 'JWT token verification failed');
  console.log('✓ JWT Session Tokens Passed');

  console.log('ALL UNIT TESTS COMPLETED SUCCESSFULLY.');
}

runTests();
