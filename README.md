# Credibly© — Tamper-Proof Academic Credentials on Solana

Blockchain-anchored academic credential verification. Issue, anchor, and verify credentials with cryptographic proof — powered by Solana, Anchor, and SHA-256.

## Architecture

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Wallet | Solana Wallet Adapter (Phantom + standard wallets) |
| On-Chain | Anchor framework, Solana Devnet |
| Hashing | SHA-256 via Web Crypto API |

## Project Structure

```
app/
  (main)/                  # Shared layout with header + wallet
    dashboard/page.tsx     # Live on-chain credential list, revoke
    issue/page.tsx         # Upload → hash → anchor credential (with metadata)
    verify/page.tsx        # Verify by hash or file upload
    my-credentials/page.tsx # Recipient view — credentials issued to you
    credential/[hash]/     # Detail page with QR code sharing
  page.tsx                 # Landing page
components/
  Header.tsx               # Nav bar with wallet badge + network selector
  Providers.tsx            # Solana + Toast + Network context providers
  ui/
    WalletBadge.tsx        # Connect / disconnect / copy address
    NetworkSelector.tsx    # Devnet / Mainnet toggle
    HashDisplay.tsx        # Hash display with copy-to-clipboard
    Toast.tsx              # Toast notification system
    GlassCard.tsx, ...     # Reusable UI primitives
lib/
  hash.ts                  # SHA-256 file hashing utilities
  program.ts               # Anchor IDL, Program ID, PDA derivation, account decoder
programs/
  credential_registry/     # Solana/Anchor program (Rust)
tests/
  credential_registry.js   # Anchor tests (issue, revoke, auth, dupes, types)
```

## Solana Program

The `credential_registry` program provides two instructions:

- **`issue_credential(hash, recipient, credential_type)`** — Creates a PDA seeded by `["credential", hash]`. Stores issuer pubkey, recipient pubkey, document hash, issued_at timestamp, credential type (0-4), and revocation status.
- **`revoke_credential(hash)`** — Marks an existing credential as revoked. Only the original issuer can revoke.

Credential types: `0` Diploma · `1` Certificate · `2` Transcript · `3` License · `4` Other

Program ID: `F4wFketKAQzZUTcHLET6QtRz9DYejhKVVdwwSLFcGB8C`

## Phase 1 — Core MVP ✅

- [x] Solana program with issue + revoke instructions
- [x] SHA-256 document hashing (client-side)
- [x] Issue page with real on-chain transactions
- [x] Verify page with on-chain PDA lookup (hash or file)
- [x] Dashboard with live credential list from chain
- [x] Wallet connect / disconnect / copy address
- [x] Anchor tests (issue, revoke, unauthorized revoke, duplicate prevention)

## Phase 2 — Enhanced UX ✅

- [x] Unified app layout with shared header + wallet across all pages
- [x] Revoke credentials directly from dashboard
- [x] Credential detail page (`/credential/[hash]`) with QR code sharing
- [x] Toast notification system for success/error feedback
- [x] Copy-to-clipboard on all hash displays
- [x] Wallet dropdown with address copy + disconnect

## Phase 3 — Real-World Readiness ✅

- [x] **On-chain metadata** — `issued_at` timestamp, `recipient` pubkey, and `credential_type` (Diploma/Certificate/Transcript/License/Other) stored on-chain
- [x] **Recipient experience** — `/my-credentials` page for recipients to view credentials issued to them (memcmp filter on recipient pubkey)
- [x] **Network selector** — Devnet / Mainnet-beta toggle with dynamic RPC endpoint (persists to localStorage)
- [x] **SOL balance check** — Pre-flight balance validation on issue page with low-balance warning
- [x] **Transaction confirmation UX** — Multi-stage progress indicator (hashing → submitting → confirming → finalized)
- [x] **Credential type system** — 5 types with color-coded badges across all views
- [x] **Recipient field** — Assign credentials to specific wallet addresses during issuance
- [x] **Shareable certificates** — Downloadable verifiable credential PDF with embedded QR code
- [x] **Batch issuance** — Multi-file upload for bulk credential anchoring (graduation use case)
- [x] **Off-chain metadata** — Store human-readable info (student name, institution, title) on IPFS/Arweave keyed by on-chain hash

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run Anchor tests (requires solana-test-validator)
anchor test
```

## License

MIT
