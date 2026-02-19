import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { VerifiableCredential, CredentialProof, CredentialSubject } from './types'

const VC_CONTEXT = [
  'https://www.w3.org/2018/credentials/v1',
  'https://w3id.org/security/suites/ed25519-2020/v1',
]

export interface IssueCredentialParams {
  /** Institution's DID, e.g. did:sol:AbcXyz123... */
  issuerDid: string
  /** Institution's raw Ed25519 secret key (64 bytes) */
  issuerSecretKey: Uint8Array
  /** Student's wallet address (used to build their DID) */
  studentWalletAddress: string
  credentialSubject: Omit<CredentialSubject, 'id'>
  /** On-chain mint address of the cNFT representing this credential */
  mintAddress: string
}

/**
 * Issues a signed W3C Verifiable Credential.
 * The credential payload is signed with the institution's Ed25519 key.
 */
export function issueCredential(params: IssueCredentialParams): VerifiableCredential {
  const {
    issuerDid,
    issuerSecretKey,
    studentWalletAddress,
    credentialSubject,
    mintAddress,
  } = params

  const now = new Date().toISOString()
  const credentialId = `urn:credibly:vc:${mintAddress}`

  const vc: VerifiableCredential = {
    '@context': VC_CONTEXT,
    id: credentialId,
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    issuer: issuerDid,
    issuanceDate: now,
    credentialSubject: {
      id: `did:sol:${studentWalletAddress}`,
      ...credentialSubject,
    },
    credentialStatus: {
      id: `solana:revocation:${mintAddress}`,
      type: 'SolanaRevocationRegistry2024',
      mintAddress,
    },
  }

  // Sign the canonical JSON of the credential (excluding proof)
  const payload = JSON.stringify(vc)
  const messageBytes = new TextEncoder().encode(payload)
  const sigBytes = nacl.sign.detached(messageBytes, issuerSecretKey)
  const proofValue = bs58.encode(sigBytes)

  const proof: CredentialProof = {
    type: 'Ed25519Signature2020',
    created: now,
    verificationMethod: `${issuerDid}#key-1`,
    proofPurpose: 'assertionMethod',
    proofValue,
  }

  return { ...vc, proof }
}
