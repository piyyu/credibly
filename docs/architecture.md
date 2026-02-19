# Architecture

## System Overview

Credibly uses a monorepo with three layers:

1. **Frontend** — Three Next.js 15 web apps + one Expo mobile app
2. **Backend** — NestJS API (GraphQL + REST)
3. **Blockchain** — Solana (Anchor programs + Metaplex Bubblegum cNFTs)

## Credential Lifecycle

```
Issue:
  Institution Dashboard
    → POST /credentials (GraphQL mutation)
    → API signs VC payload (Ed25519, institution keypair)
    → API mints cNFT via Metaplex Bubblegum to student wallet
    → API creates RevocationRecord PDA on-chain
    → API pins VC JSON to IPFS (Pinata)
    → API stores metadata in PostgreSQL
    → Student wallet receives cNFT

Verify:
  Verifier Portal / REST API
    → Fetch cNFT from Solana RPC
    → Fetch VC JSON from IPFS (via CID in cNFT metadata)
    → Verify Ed25519 signature (vc-core/verifier.ts)
    → Check RevocationRecord PDA (is_revoked flag)
    → Return VALID / INVALID / REVOKED
```

## Anchor Programs

| Program | ID (placeholder) | Purpose |
|---|---|---|
| `did-registry` | `Fg6PaFpo...` | Register institution DIDs |
| `revocation-registry` | `HmbTLCma...` | Per-credential revocation PDA |

## Key Design Decisions

- **cNFTs over regular NFTs** — Metaplex Bubblegum Compressed NFTs cost ~$0.00025 to mint vs ~$0.02 for regular NFTs. For bulk degree issuance this is critical.
- **Off-chain VC JSON** — The full W3C VC payload is stored on IPFS. On-chain we only store the hash/mint address. This keeps Solana costs low.
- **Ed25519 signatures** — Solana native keypairs are Ed25519, so institution signing is native and fast.
- **did:sol** — Uses the institution's Solana wallet address as the DID controller.
