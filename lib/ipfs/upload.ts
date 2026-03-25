import PinataClient from "@pinata/sdk";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPinataClient(): PinataClient {
  return new PinataClient({
    pinataApiKey: requireEnv("PINATA_API_KEY"),
    pinataSecretApiKey: requireEnv("PINATA_SECRET"),
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface VerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    degree: string;
    institution: string;
    graduationYear: number;
    [key: string]: unknown;
  };
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------
async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 3, baseDelayMs = 500, label = "operation" } = {}
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1); // exponential backoff
        console.warn(
          `[IPFS] ${label} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms…`,
          lastError.message
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw new Error(
    `[IPFS] ${label} failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// ---------------------------------------------------------------------------
// IPFS operations
// ---------------------------------------------------------------------------

/**
 * Upload a Verifiable Credential JSON to IPFS via Pinata.
 * Retries up to 3 times with exponential backoff on transient failures.
 */
export async function uploadCredentialToIPFS(
  vc: VerifiableCredential
): Promise<string> {
  const pinata = getPinataClient();
  return withRetry(
    async () => {
      const result = await pinata.pinJSONToIPFS(vc, {
        pinataMetadata: { name: `credibly-vc-${Date.now()}` },
      });
      return result.IpfsHash;
    },
    { label: "uploadCredentialToIPFS" }
  );
}

/**
 * Fetch a Verifiable Credential from an IPFS gateway by CID.
 * Retries up to 3 times with exponential backoff on transient failures.
 */
export async function fetchCredentialFromIPFS(
  cid: string
): Promise<VerifiableCredential> {
  const gateway = requireEnv("NEXT_PUBLIC_IPFS_GATEWAY");
  return withRetry(
    async () => {
      const url = `${gateway}/${cid}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`IPFS fetch failed (${res.status}): ${res.statusText}`);
      }
      return res.json() as Promise<VerifiableCredential>;
    },
    { label: "fetchCredentialFromIPFS" }
  );
}

/**
 * Produce a deterministic SHA-256 hash of a Verifiable Credential
 * for on-chain anchoring.  Keys are sorted to guarantee consistency.
 */
export function hashVC(vc: VerifiableCredential): Buffer {
  const sorted = JSON.stringify(vc, Object.keys(vc).sort());
  return crypto.createHash("sha256").update(sorted).digest();
}
