// ─── W3C Verifiable Credential / Presentation Types ──────────────────────────

export interface CredentialSubject {
  id: string // did:sol:<student-wallet-address>
  degree: {
    type: string // e.g. "BachelorDegree"
    name: string // e.g. "Bachelor of Computer Science"
  }
  graduationDate: string // ISO 8601
  gpa?: string
  honours?: string
}

export interface VerifiableCredential {
  '@context': string[]
  id: string
  type: string[]
  issuer: string // did:sol:<institution>
  issuanceDate: string
  expirationDate?: string
  credentialSubject: CredentialSubject
  credentialStatus?: {
    id: string
    type: 'SolanaRevocationRegistry2024'
    mintAddress: string
  }
  proof?: CredentialProof
}

export interface CredentialProof {
  type: 'Ed25519Signature2020'
  created: string
  verificationMethod: string
  proofPurpose: 'assertionMethod'
  proofValue: string // base58-encoded Ed25519 signature
}

export interface VerifiablePresentation {
  '@context': string[]
  type: string[]
  holder: string // did:sol:<student-wallet>
  verifiableCredential: VerifiableCredential[]
  proof?: PresentationProof
}

export interface PresentationProof extends CredentialProof {
  challenge?: string
  domain?: string
  expiresAt?: string
}

export type VerifyResult = {
  valid: boolean
  revoked: boolean
  expired: boolean
  errors: string[]
  credential?: VerifiableCredential
}
