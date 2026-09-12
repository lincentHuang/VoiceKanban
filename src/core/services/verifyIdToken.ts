import { X509Certificate, createVerify } from "crypto";

/**
 * Server-side Firebase ID token verification without the firebase-admin SDK.
 *
 * firebase-admin would need a service account credential and a much heavier dependency;
 * all that is actually required here is validating the RS256 signature against Google's
 * published public certificates and checking the standard claims. Keeping it dependency-free
 * means no extra env vars beyond the NEXT_PUBLIC_FIREBASE_PROJECT_ID the app already has.
 *
 * Requires the Node.js runtime (not Edge) for the crypto APIs used below.
 */

const CERT_URL =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

/** Tolerance for clock drift between Google's signing servers and this instance. */
const CLOCK_SKEW_SEC = 60;

export interface VerifiedToken {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  /** "google.com", "password", "anonymous", ... */
  signInProvider: string | null;
}

let certCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getGoogleCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expiresAt > now) return certCache.certs;

  const res = await fetch(CERT_URL);
  if (!res.ok) throw new Error(`Failed to fetch Google signing certificates: ${res.status}`);
  const certs = (await res.json()) as Record<string, string>;

  // Google tells us how long the certs stay valid; fall back to an hour if the header is absent.
  const cacheControl = res.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] ?? 3600);
  certCache = { certs, expiresAt: now + maxAge * 1000 };

  return certs;
}

function decodeSegment(segment: string): any {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

/**
 * Verifies a Firebase ID token and returns its claims, or null when the token is
 * missing, malformed, expired, or not signed for this Firebase project.
 */
export async function verifyFirebaseIdToken(token: string | null): Promise<VerifiedToken | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!token || !projectId) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const header = decodeSegment(headerB64);
    if (header.alg !== "RS256" || !header.kid) return null;

    const certs = await getGoogleCerts();
    const certPem = certs[header.kid];
    if (!certPem) return null;

    const publicKey = new X509Certificate(certPem).publicKey;
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    if (!verifier.verify(publicKey, Buffer.from(signatureB64, "base64url"))) return null;

    const payload = decodeSegment(payloadB64);
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.aud !== projectId) return null;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload.exp !== "number" || payload.exp <= nowSec - CLOCK_SKEW_SEC) return null;
    if (typeof payload.iat !== "number" || payload.iat > nowSec + CLOCK_SKEW_SEC) return null;
    if (typeof payload.sub !== "string" || !payload.sub || payload.sub.length > 128) return null;

    return {
      uid: payload.sub,
      email: typeof payload.email === "string" ? payload.email : null,
      emailVerified: payload.email_verified === true,
      signInProvider: payload.firebase?.sign_in_provider ?? null,
    };
  } catch (error) {
    console.warn("ID token verification failed:", error);
    return null;
  }
}

/** Pulls the bearer token out of an Authorization header. */
export function getBearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
