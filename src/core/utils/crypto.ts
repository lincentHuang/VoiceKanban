import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const DEFAULT_SECRET = process.env.ENCRYPTION_SECRET || "voicekanban-super-secret-key-32b!";

function getSecretKey(secret?: string): Buffer {
  const s = secret || DEFAULT_SECRET;
  return crypto.createHash("sha256").update(String(s)).digest();
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt plaintext string with AES-256-GCM
 */
export function encryptData(text: string, secret?: string): EncryptedData {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getSecretKey(secret);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    ciphertext: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag,
  };
}

/**
 * Decrypt ciphertext with AES-256-GCM
 */
export function decryptData(encrypted: EncryptedData, secret?: string): string {
  const key = getSecretKey(secret);
  const iv = Buffer.from(encrypted.iv, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"));

  let decrypted = decipher.update(encrypted.ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
