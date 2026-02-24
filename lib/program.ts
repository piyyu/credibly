import { Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idlFile from "../target/idl/credential_registry.json";

export const PROGRAM_ID = new PublicKey(idlFile.address);
export const PROGRAM_IDL: Idl = idlFile as any;

export const deriveCredentialPDA = (hashBuffer: Uint8Array): PublicKey => {
  if (hashBuffer.length !== 32) {
    throw new Error("Invalid hash length: A SHA-256 hash must be exactly 32 bytes (64 hex characters).");
  }
  return PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), Buffer.from(hashBuffer)],
    PROGRAM_ID
  )[0];
};

// ─── Credential type enum ─────────────────────────────────
export const CREDENTIAL_TYPES = [
  { value: 0, label: "Diploma" },
  { value: 1, label: "Certificate" },
  { value: 2, label: "Transcript" },
  { value: 3, label: "License" },
  { value: 4, label: "Other" },
] as const;

export type CredentialTypeValue = 0 | 1 | 2 | 3 | 4;

export function credentialTypeLabel(value: number): string {
  return CREDENTIAL_TYPES.find((t) => t.value === value)?.label ?? "Unknown";
}

// ─── Account data layout constants (Borsh, including 8-byte discriminator) ────
export const ACCOUNT_SIZE = 114; // total on-chain bytes
export const OFFSET_ISSUER = 8;
export const OFFSET_RECIPIENT = 40;
export const OFFSET_HASH = 72;
export const OFFSET_ISSUED_AT = 104;
export const OFFSET_CREDENTIAL_TYPE = 112;
export const OFFSET_REVOKED = 113;

/** Decode a raw Credential account buffer into a typed object. */
export function decodeCredentialAccount(data: Buffer | Uint8Array) {
  const issuer = new PublicKey(data.slice(OFFSET_ISSUER, OFFSET_RECIPIENT)).toBase58();
  const recipient = new PublicKey(data.slice(OFFSET_RECIPIENT, OFFSET_HASH)).toBase58();
  const hashBytes = data.slice(OFFSET_HASH, OFFSET_ISSUED_AT);
  const hash = Array.from(hashBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // issued_at is i64 little-endian
  const view = new DataView(new Uint8Array(data.slice(OFFSET_ISSUED_AT, OFFSET_CREDENTIAL_TYPE)).buffer);
  const issuedAt = Number(view.getBigInt64(0, true)); // little-endian

  const credentialType = data[OFFSET_CREDENTIAL_TYPE] as CredentialTypeValue;
  const revoked = data[OFFSET_REVOKED] === 1;

  return { issuer, recipient, hash, issuedAt, credentialType, revoked };
}

export type DecodedCredential = ReturnType<typeof decodeCredentialAccount>;

export type CredentialRegistry = {
  "address": "F4wFketKAQzZUTcHLET6QtRz9DYejhKVVdwwSLFcGB8C",
  "metadata": {
    "name": "credential_registry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
};
