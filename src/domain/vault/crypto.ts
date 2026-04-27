import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const PREFIX = "vault:v1:";

function keyForUser(userId: string): Buffer {
  const secret =
    process.env.VAULT_ENCRYPTION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "saathi-local-demo-vault-secret";
  return scryptSync(secret, `saathi-vault:${userId}`, 32);
}

export function encryptVaultText(value: string | null | undefined, userId: string): string | null {
  if (!value) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyForUser(userId), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.from(
    JSON.stringify({
      iv: iv.toString("base64url"),
      tag: tag.toString("base64url"),
      ciphertext: ciphertext.toString("base64url"),
    }),
    "utf8",
  ).toString("base64url");
  return `${PREFIX}${payload}`;
}

export function decryptVaultText(value: string | null | undefined, userId: string): string | null {
  if (!value) return null;
  if (!value.startsWith(PREFIX)) return value;
  try {
    const payload = JSON.parse(Buffer.from(value.slice(PREFIX.length), "base64url").toString("utf8")) as {
      iv: string;
      tag: string;
      ciphertext: string;
    };
    const decipher = createDecipheriv(
      "aes-256-gcm",
      keyForUser(userId),
      Buffer.from(payload.iv, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(payload.tag, "base64url"));
    const clear = Buffer.concat([
      decipher.update(Buffer.from(payload.ciphertext, "base64url")),
      decipher.final(),
    ]);
    return clear.toString("utf8");
  } catch {
    return "[Vault decrypt failed]";
  }
}

export function isVaultEncrypted(value: string | null | undefined): boolean {
  return Boolean(value?.startsWith(PREFIX));
}
