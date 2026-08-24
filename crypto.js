import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

// Derive consistent 32-byte key from ENCRYPTION_KEY or secret
function getKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'affiliatego_super_secret_encryption_key_2026_secure!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt plain API key using AES-256-GCM
 */
export function encryptApiKey(plainText) {
  if (!plainText || typeof plainText !== 'string') return null;
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(plainText.trim(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    // Return iv:tag:ciphertext
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
}

/**
 * Decrypt ciphertext using AES-256-GCM
 */
export function decryptApiKey(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string') return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    
    const [ivHex, tagHex, cipherHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption error (tampered or invalid key):', err);
    return null;
  }
}
