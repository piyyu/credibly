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
    issue/page.tsx         # Upload → hash → anchor credential
    verify/page.tsx        # Verify by hash or file upload
    credential/[hash]/     # Detail page with QR code sharing
  page.tsx                 # Landing page
components/
  Header.tsx               # Nav bar with wallet badge
  Providers.tsx            # Solana + Toast context providers
  ui/
    WalletBadge.tsx        # Connect / disconnect / copy address
    HashDisplay.tsx        # Hash display with copy-to-clipboard
    Toast.tsx              # Toast notification system
    GlassCard.tsx, ...     # Reusable UI primitives
lib/
  hash.ts                  # SHA-256 file hashing utilities
  program.ts               # Anchor IDL, Program ID, PDA derivation
programs/
  credential_registry/     # Solana/Anchor program (Rust)
tests/
  credential_registry.js   # Anchor tests (issue, revoke, auth, dupes)
```

## Solana Program

The `credential_registry` program provides two instructions:

- **`issue_credential(hash)`** — Creates a PDA seeded by `["credential", hash]`. Stores issuer pubkey, document hash, and revocation status.
- **`revoke_credential(hash)`** — Marks an existing credential as revoked. Only the original issuer can revoke.

Program ID: `E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU`

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
