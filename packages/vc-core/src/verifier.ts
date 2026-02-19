import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { PublicKey } from '@solana/web3.js'
import { VerifiableCredential, VerifyResult } from './types'

/**
 * Verifies a Verifiable Credential:
 * 1. Validates required fields
 * 2. Verifies the Ed25519 signature against the issuer's public key
 * 3. Checks expiry date
 *
 * NOTE: On-chain revocation check is done by the API (packages/api)
 * to keep this package framework-agnostic.
 */
export async function verifyCredential(
  vc: VerifiableCredential,
  /** Issuer's base58 Ed25519 public key (32 bytes).
   *  Should be resolved from the DID document. */
  issuerPublicKeyBase58: string
): Promise<VerifyResult> {
  const errors: string[] = []

  // ── 1. Basic field validation ──────────────────────────────────────────────
  if (!vc['@context']?.includes('https://www.w3.org/2018/credentials/v1')) {
    errors.push('Missing required @context')
  }
  if (!vc.type?.includes('VerifiableCredential')) {
    errors.push('type must include VerifiableCredential')
  }
  if (!vc.issuer) errors.push('Missing issuer')
  if (!vc.issuanceDate) errors.push('Missing issuanceDate')
  if (!vc.proof?.proofValue) errors.push('Missing proof.proofValue')

  if (errors.length > 0) {
    return { valid: false, revoked: false, expired: false, errors }
  }

  // ── 2. Expiry check ────────────────────────────────────────────────────────
  const expired =
    vc.expirationDate != null && new Date(vc.expirationDate) < new Date()
  if (expired) errors.push('Credential has expired')

  // ── 3. Signature verification ──────────────────────────────────────────────
  try {
    const { proof, ...vcWithoutProof } = vc
    const payload = JSON.stringify(vcWithoutProof)
    const messageBytes = new TextEncoder().encode(payload)
    const sigBytes = bs58.decode(proof!.proofValue)
    const pubKeyBytes = new PublicKey(issuerPublicKeyBase58).toBytes()

    const signatureValid = nacl.sign.detached.verify(messageBytes, sigBytes, pubKeyBytes)
    if (!signatureValid) errors.push('Invalid cryptographic signature')
  } catch (e) {
    errors.push(`Signature verification error: ${(e as Error).message}`)
  }

  return {
    valid: errors.length === 0,
    revoked: false, // caller must check on-chain revocation registry
    expired,
    errors,
    credential: errors.length === 0 ? vc : undefined,
  }
}
