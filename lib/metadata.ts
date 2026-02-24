/**
 * Off-chain credential metadata — localStorage + optional IPFS pinning.
 * Metadata is keyed by the credential's SHA-256 hash.
 */

export interface CredentialMetadata {
  studentName: string;
  institution: string;
  title: string;
  ipfsCid?: string;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = "credibly-meta-";
const PINATA_JWT_KEY = "credibly-pinata-jwt";

// ─── Local Storage ───────────────────────────────────────────

/** Save metadata to localStorage. */
export function saveMetadata(hash: string, metadata: CredentialMetadata): void {
  if (typeof window === "undefined") return;
  const key = `${STORAGE_KEY_PREFIX}${hash}`;
  localStorage.setItem(key, JSON.stringify(metadata));
}

/** Get metadata from localStorage. */
export function getMetadata(hash: string): CredentialMetadata | null {
  if (typeof window === "undefined") return null;
  const key = `${STORAGE_KEY_PREFIX}${hash}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CredentialMetadata;
  } catch {
    return null;
  }
}

/** Get all stored metadata keyed by hash. */
export function getAllMetadata(): Record<string, CredentialMetadata> {
  if (typeof window === "undefined") return {};
  const result: Record<string, CredentialMetadata> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const hash = key.slice(STORAGE_KEY_PREFIX.length);
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          result[hash] = JSON.parse(raw);
        } catch {
          // skip corrupt entries
        }
      }
    }
  }
  return result;
}

// ─── Pinata JWT ──────────────────────────────────────────────

/** Save Pinata JWT to localStorage. */
export function setPinataJwt(jwt: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PINATA_JWT_KEY, jwt);
}

/** Get Pinata JWT from localStorage. */
export function getPinataJwt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PINATA_JWT_KEY);
}

/** Clear Pinata JWT. */
export function clearPinataJwt(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PINATA_JWT_KEY);
}

// ─── IPFS via Pinata ─────────────────────────────────────────

/** Upload metadata JSON to IPFS via Pinata. Returns the CID. */
export async function pinToIPFS(
  hash: string,
  metadata: CredentialMetadata
): Promise<string> {
  const jwt = getPinataJwt();
  if (!jwt) {
    throw new Error("Pinata JWT not configured. Add your API key in the IPFS settings.");
  }

  const body = {
    pinataContent: {
      credentialHash: hash,
      studentName: metadata.studentName,
      institution: metadata.institution,
      title: metadata.title,
      createdAt: metadata.createdAt,
      version: "1.0",
      schema: "credibly-metadata-v1",
    },
    pinataMetadata: {
      name: `credibly-${hash.slice(0, 16)}`,
    },
  };

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IPFS pin failed: ${errorText}`);
  }

  const result = await response.json();
  const cid: string = result.IpfsHash;

  // Update local metadata with CID
  metadata.ipfsCid = cid;
  saveMetadata(hash, metadata);

  return cid;
}

/** Fetch metadata from IPFS gateway by CID. */
export async function fetchFromIPFS(
  cid: string
): Promise<Record<string, unknown>> {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
  if (!response.ok) throw new Error("Failed to fetch from IPFS");
  return response.json();
}

/** Build a portable IPFS-compatible metadata JSON string. */
export function buildMetadataJSON(
  hash: string,
  metadata: CredentialMetadata
): string {
  return JSON.stringify(
    {
      credentialHash: hash,
      studentName: metadata.studentName,
      institution: metadata.institution,
      title: metadata.title,
      createdAt: metadata.createdAt,
      version: "1.0",
      schema: "credibly-metadata-v1",
    },
    null,
    2
  );
}
