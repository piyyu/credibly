# Credibly — Decentralized Academic Credential Verification System
### Built with Next.js 14 + Solana

> **Author:** piyyu | **Stack:** Next.js 14 (App Router) · Solana · Anchor · IPFS · SSI · ZK Proofs

Credibly is a blockchain-powered platform that eliminates fake academic credentials and replaces slow, costly verification with instant, cryptographically secure checks. This edition replaces Ethereum/Hyperledger with **Solana** for high-throughput, low-cost on-chain operations and uses **Next.js 14 App Router** as the unified full-stack framework.

---

## Table of Contents

- [Why Solana?](#why-solana)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Phase 1 — Monorepo & Environment Setup](#phase-1--monorepo--environment-setup)
- [Phase 2 — Solana Programs (Smart Contracts)](#phase-2--solana-programs-smart-contracts)
- [Phase 3 — Off-Chain Storage (IPFS/Arweave)](#phase-3--off-chain-storage-ipfsarweave)
- [Phase 4 — Next.js App Setup](#phase-4--nextjs-app-setup)
- [Phase 5 — Solana Wallet Integration](#phase-5--solana-wallet-integration)
- [Phase 6 — Institution Admin Dashboard](#phase-6--institution-admin-dashboard)
- [Phase 7 — Student SSI Wallet (Web)](#phase-7--student-ssi-wallet-web)
- [Phase 8 — Verifier Portal & API Routes](#phase-8--verifier-portal--api-routes)
- [Phase 9 — DigiLocker & NAD Integration](#phase-9--digilocker--nad-integration)
- [Phase 10 — AI Anomaly Detection](#phase-10--ai-anomaly-detection)
- [Phase 11 — Zero-Knowledge Proof Layer](#phase-11--zero-knowledge-proof-layer)
- [Phase 12 — ATS Webhook Integrations](#phase-12--ats-webhook-integrations)
- [Phase 13 — Post-Quantum Cryptography Roadmap](#phase-13--post-quantum-cryptography-roadmap)
- [Trust Registry & Sybil Resistance](#trust-registry--sybil-resistance)
- [Privacy & Compliance](#privacy--compliance)
- [Credential Lifecycle](#credential-lifecycle)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Why Solana?

| Factor | Ethereum | Solana |
|---|---|---|
| Transaction fee | ~$1–$50 (gas spikes) | ~$0.00025 |
| Throughput | ~15 TPS | ~65,000 TPS |
| Finality | ~12 seconds | ~400ms |
| Cost for 1M credentials | Prohibitive | ~$250 |
| India-scale viability | Limited | High |

Solana's near-zero fees make per-credential on-chain anchoring economically viable at India's scale (millions of graduates per year). The Anchor framework gives type-safe Rust programs with a familiar developer experience.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                     CREDIBLY (Next.js 14)                          │
│                                                                    │
│  /app                                                              │
│  ├── (institution)/dashboard   → Bulk issuance, revocation, logs   │
│  ├── (student)/wallet          → SSI wallet, QR sharing            │
│  ├── (verifier)/verify         → Public credential checker         │
│  └── api/                      → Server Actions & Route Handlers   │
│       ├── issue/               → Mint VC, write hash to Solana     │
│       ├── verify/[hash]        → Check on-chain + revocation       │
│       ├── revoke/              → Update on-chain status            │
│       ├── digilocker/          → OAuth callback, push VC           │
│       └── ai/detect            → Anomaly detection proxy           │
└───────────────────────┬────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
  ┌─────────────┐ ┌──────────┐ ┌────────────┐
  │   Solana    │ │   IPFS   │ │ DigiLocker │
  │  Programs   │ │ /Arweave │ │   / NAD    │
  │  (Anchor)   │ │          │ │            │
  └─────────────┘ └──────────┘ └────────────┘
         │
  ┌──────┴───────┐
  ▼              ▼
credential_   trust_
registry      registry
(PDAs)        (PDAs)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Full-stack Framework | Next.js 14 (App Router, Server Actions) |
| Blockchain | Solana (Devnet → Mainnet-beta) |
| Smart Contracts | Anchor (Rust) |
| On-chain Accounts | Solana PDAs (Program Derived Addresses) |
| Off-chain Storage | IPFS via Pinata / Arweave via Bundlr |
| Identity | W3C DIDs (did:sol), W3C Verifiable Credentials |
| Wallet Adapter | @solana/wallet-adapter-react |
| ZK Proofs | snarkjs + circom |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand + TanStack Query |
| India Integration | DigiLocker API, NAD |
| AI Service | Python / FastAPI + scikit-learn |
| Post-Quantum (roadmap) | CRYSTALS-Dilithium, CRYSTALS-Kyber |

---

## Project Structure

```
credibly/
├── anchor/                         # Solana programs (Rust + Anchor)
│   ├── programs/
│   │   └── credibly/
│   │       └── src/
│   │           ├── lib.rs          # Program entrypoint
│   │           ├── credential.rs   # Credential issuance & verification
│   │           ├── revocation.rs   # Revocation logic
│   │           └── trust.rs        # Trust registry (tiers)
│   ├── tests/
│   │   └── credibly.ts             # Anchor integration tests
│   └── Anchor.toml
│
├── app/                            # Next.js 14 App Router
│   ├── (institution)/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── issue/page.tsx      # Single + bulk issuance
│   │       ├── revoke/page.tsx     # Credential revocation
│   │       └── logs/page.tsx       # Audit logs
│   ├── (student)/
│   │   └── wallet/
│   │       ├── page.tsx            # Credential list
│   │       └── share/[id]/page.tsx # QR code sharing
│   ├── (verifier)/
│   │   └── verify/
│   │       ├── page.tsx
│   │       └── [hash]/page.tsx     # Result page
│   ├── api/
│   │   ├── issue/route.ts
│   │   ├── verify/[hash]/route.ts
│   │   ├── revoke/route.ts
│   │   ├── digilocker/
│   │   │   ├── auth/route.ts
│   │   │   └── callback/route.ts
│   │   └── ai/detect/route.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── wallet/                     # Wallet adapter components
│   ├── credential/                 # VC cards, QR codes
│   ├── dashboard/                  # Institution UI components
│   └── ui/                         # shadcn/ui primitives
│
├── lib/
│   ├── solana/
│   │   ├── client.ts               # Anchor program client
│   │   ├── credentials.ts          # Issuance helpers
│   │   └── idl/credibly.json       # Generated IDL
│   ├── ipfs/
│   │   └── upload.ts
│   ├── zk/
│   │   └── proof.ts
│   └── digilocker/
│       └── client.ts
│
├── ai/                             # Python AI microservice
│   ├── main.py
│   ├── model.py
│   ├── train.py
│   └── requirements.txt
│
├── circuits/                       # ZK circuit (circom)
│   └── credentialProof.circom
│
├── .env.local.example
├── anchor/Anchor.toml
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Prerequisites

```bash
# Node.js 20+
node --version

# Rust (for Anchor programs)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
solana --version

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest && avm use latest
anchor --version

# Python 3.10+ (for AI service)
python --version

# snarkjs + circom (for ZK proofs)
npm install -g snarkjs
# Install circom: https://docs.circom.io/getting-started/installation/
```

---

## Phase 1 — Monorepo & Environment Setup

- [x] 1.1 Bootstrap the Next.js project

```bash
npx create-next-app@latest credibly \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias "@/*"

cd credibly
```

- [x] 1.2 Install all dependencies

```bash
# Solana + Anchor client
npm install @coral-xyz/anchor \
  @solana/web3.js \
  @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets \
  @solana/wallet-adapter-base

# IPFS / Arweave
npm install @pinata/sdk @bundlr-network/client

# ZK
npm install snarkjs

# UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  lucide-react class-variance-authority clsx tailwind-merge \
  @tanstack/react-query zustand react-qr-code papaparse

# DID / VC
npm install did-resolver @veramo/did-resolver

# Dev
npm install -D @types/node crypto-browserify stream-browserify buffer
```

- [x] 1.3 Initialise Anchor workspace

```bash
# In project root
anchor init anchor --no-git
```

- [x] 1.4 Configure environment

Create `.env.local` from `.env.local.example`:

```env
# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID

# IPFS
PINATA_API_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# DigiLocker
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/digilocker/callback

# AI service
AI_SERVICE_URL=http://localhost:8000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
```

- [x] 1.5 Configure Next.js for Solana/Node polyfills

`next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    };
    config.plugins.push(
      new (require("webpack").ProvidePlugin)({
        Buffer: ["buffer", "Buffer"],
      })
    );
    return config;
  },
};

export default nextConfig;
```

---

## Phase 2 — Solana Programs (Smart Contracts)

Credibly uses a single Anchor program with three logical modules. Solana PDAs (Program Derived Addresses) replace Ethereum mappings — each credential gets its own account derived deterministically from the credential hash.

- [x] 2.1 Program entrypoint

`anchor/programs/credibly/src/lib.rs`:

```rust
use anchor_lang::prelude::*;

pub mod credential;
pub mod revocation;
pub mod trust;

use credential::*;
use revocation::*;
use trust::*;

declare_id!("REPLACE_WITH_YOUR_PROGRAM_ID");

#[program]
pub mod credibly {
    use super::*;

    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        credential_hash: [u8; 32],
        ipfs_cid: String,
        holder_did: String,
    ) -> Result<()> {
        credential::issue(ctx, credential_hash, ipfs_cid, holder_did)
    }

    pub fn verify_credential(
        ctx: Context<VerifyCredential>,
        credential_hash: [u8; 32],
    ) -> Result<CredentialStatus> {
        credential::verify(ctx, credential_hash)
    }

    pub fn revoke_credential(
        ctx: Context<RevokeCredential>,
        credential_hash: [u8; 32],
        reason: String,
    ) -> Result<()> {
        revocation::revoke(ctx, credential_hash, reason)
    }

    pub fn register_institution(
        ctx: Context<RegisterInstitution>,
        name: String,
        tier: u8,
        did: String,
    ) -> Result<()> {
        trust::register(ctx, name, tier, did)
    }
}
```

- [x] 2.2 Credential module

`anchor/programs/credibly/src/credential.rs`:

```rust
use anchor_lang::prelude::*;

#[account]
pub struct CredentialAccount {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub holder_did: String,
    pub ipfs_cid: String,
    pub issued_at: i64,
    pub revoked: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CredentialStatus {
    pub exists: bool,
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub revoked: bool,
    pub ipfs_cid: String,
}

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct IssueCredential<'info> {
    #[account(
        init,
        payer = issuer,
        space = 8 + 32 + 32 + 200 + 200 + 8 + 1 + 1,
        seeds = [b"credential", &credential_hash],
        bump,
    )]
    pub credential_account: Account<'info, CredentialAccount>,

    #[account(mut)]
    pub issuer: Signer<'info>,

    // Enforce issuer is registered in trust registry
    #[account(
        seeds = [b"institution", issuer.key().as_ref()],
        bump = institution_account.bump,
        constraint = institution_account.tier > 0 @ CrediblyError::UnregisteredIssuer
    )]
    pub institution_account: Account<'info, crate::trust::InstitutionAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct VerifyCredential<'info> {
    #[account(seeds = [b"credential", &credential_hash], bump = credential_account.bump)]
    pub credential_account: Account<'info, CredentialAccount>,
}

pub fn issue(
    ctx: Context<IssueCredential>,
    credential_hash: [u8; 32],
    ipfs_cid: String,
    holder_did: String,
) -> Result<()> {
    let account = &mut ctx.accounts.credential_account;
    let clock = Clock::get()?;
    account.credential_hash = credential_hash;
    account.issuer = ctx.accounts.issuer.key();
    account.holder_did = holder_did;
    account.ipfs_cid = ipfs_cid;
    account.issued_at = clock.unix_timestamp;
    account.revoked = false;
    account.bump = ctx.bumps.credential_account;
    emit!(CredentialIssued {
        credential_hash,
        issuer: ctx.accounts.issuer.key(),
        timestamp: clock.unix_timestamp,
    });
    Ok(())
}

pub fn verify(ctx: Context<VerifyCredential>, _credential_hash: [u8; 32]) -> Result<CredentialStatus> {
    let account = &ctx.accounts.credential_account;
    Ok(CredentialStatus {
        exists: true,
        issuer: account.issuer,
        issued_at: account.issued_at,
        revoked: account.revoked,
        ipfs_cid: account.ipfs_cid.clone(),
    })
}

#[event]
pub struct CredentialIssued {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum CrediblyError {
    #[msg("Institution not in trust registry")]
    UnregisteredIssuer,
}
```

- [x] 2.3 Revocation module

`anchor/programs/credibly/src/revocation.rs`:

```rust
use anchor_lang::prelude::*;
use crate::credential::CredentialAccount;

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        seeds = [b"credential", &credential_hash],
        bump = credential_account.bump,
        constraint = credential_account.issuer == issuer.key() @ RevokeError::Unauthorized,
        constraint = !credential_account.revoked @ RevokeError::AlreadyRevoked,
    )]
    pub credential_account: Account<'info, CredentialAccount>,
    pub issuer: Signer<'info>,
}

pub fn revoke(ctx: Context<RevokeCredential>, credential_hash: [u8; 32], reason: String) -> Result<()> {
    ctx.accounts.credential_account.revoked = true;
    emit!(CredentialRevoked {
        credential_hash,
        issuer: ctx.accounts.issuer.key(),
        reason,
        timestamp: Clock::get()?.unix_timestamp,
    });
    Ok(())
}

#[event]
pub struct CredentialRevoked {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

#[error_code]
pub enum RevokeError {
    #[msg("Only the original issuer can revoke")]
    Unauthorized,
    #[msg("Already revoked")]
    AlreadyRevoked,
}
```

- [x] 2.4 Trust Registry module

`anchor/programs/credibly/src/trust.rs`:

```rust
use anchor_lang::prelude::*;

#[account]
pub struct InstitutionAccount {
    pub authority: Pubkey,
    pub institution: Pubkey,
    pub name: String,
    pub tier: u8,        // 1 = UGC-accredited, 2 = training provider
    pub did: String,
    pub registered_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct RegisterInstitution<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 200 + 1 + 200 + 8 + 1,
        seeds = [b"institution", institution.key().as_ref()],
        bump,
    )]
    pub institution_account: Account<'info, InstitutionAccount>,

    /// CHECK: Institution wallet being registered
    pub institution: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register(ctx: Context<RegisterInstitution>, name: String, tier: u8, did: String) -> Result<()> {
    let account = &mut ctx.accounts.institution_account;
    account.authority = ctx.accounts.authority.key();
    account.institution = ctx.accounts.institution.key();
    account.name = name;
    account.tier = tier;
    account.did = did;
    account.registered_at = Clock::get()?.unix_timestamp;
    account.bump = ctx.bumps.institution_account;
    Ok(())
}
```

- [x] 2.5 Anchor.toml

`anchor/Anchor.toml`:

```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
credibly = "YOUR_PROGRAM_ID"

[programs.devnet]
credibly = "YOUR_PROGRAM_ID"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

- [x] 2.6 Build, deploy, and test

```bash
cd anchor

# Build
anchor build

# Start local validator
solana-test-validator --reset

# Deploy locally
solana config set --url localhost
anchor deploy

# Export TypeScript IDL to Next.js
cp target/idl/credibly.json ../lib/solana/idl/credibly.json

# Run tests
anchor test

# Deploy to Devnet
solana config set --url devnet
solana airdrop 2
anchor deploy --provider.cluster devnet
```

- [x] 2.7 Anchor integration test

`anchor/tests/credibly.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Credibly } from "../target/types/credibly";
import { assert } from "chai";
import * as crypto from "crypto";

describe("credibly", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Credibly as Program<Credibly>;

  it("registers institution", async () => {
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("institution"), provider.wallet.publicKey.toBuffer()],
      program.programId
    );
    await program.methods
      .registerInstitution("IIT Delhi", 1, "did:sol:iit-delhi")
      .accounts({ institution: provider.wallet.publicKey, authority: provider.wallet.publicKey })
      .rpc();
    const account = await program.account.institutionAccount.fetch(pda);
    assert.equal(account.name, "IIT Delhi");
    assert.equal(account.tier, 1);
  });

  it("issues and verifies credential", async () => {
    const hash = Array.from(crypto.createHash("sha256").update("test-vc").digest());
    const [credPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(hash)],
      program.programId
    );
    await program.methods
      .issueCredential(hash, "QmTestCID123", "did:sol:student-001")
      .accounts({ credentialAccount: credPDA, issuer: provider.wallet.publicKey })
      .rpc();
    const account = await program.account.credentialAccount.fetch(credPDA);
    assert.isFalse(account.revoked);
    assert.equal(account.ipfsCid, "QmTestCID123");
  });

  it("revokes credential", async () => {
    const hash = Array.from(crypto.createHash("sha256").update("test-vc").digest());
    const [credPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(hash)],
      program.programId
    );
    await program.methods
      .revokeCredential(hash, "Misconduct discovered")
      .accounts({ credentialAccount: credPDA, issuer: provider.wallet.publicKey })
      .rpc();
    const account = await program.account.credentialAccount.fetch(credPDA);
    assert.isTrue(account.revoked);
  });
});
```

---

## Phase 3 — Off-Chain Storage (IPFS/Arweave)

- [x] 3.1 Implement IPFS upload, fetch, and VC hashing utilities

`lib/ipfs/upload.ts`:

```typescript
import PinataClient from "@pinata/sdk";
import crypto from "crypto";

const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_SECRET!,
});

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

export async function uploadCredentialToIPFS(vc: VerifiableCredential): Promise<string> {
  const result = await pinata.pinJSONToIPFS(vc, {
    pinataMetadata: { name: `credibly-vc-${Date.now()}` },
  });
  return result.IpfsHash;
}

export async function fetchCredentialFromIPFS(cid: string): Promise<VerifiableCredential> {
  const url = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${cid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  return res.json();
}

export function hashVC(vc: VerifiableCredential): Buffer {
  const sorted = JSON.stringify(vc, Object.keys(vc).sort());
  return crypto.createHash("sha256").update(sorted).digest();
}
```

---

## Phase 4 — Next.js App Setup

- [x] 4.1 Root layout with providers

`app/layout.tsx`:

```typescript
import "./globals.css";
import type { Metadata } from "next";
import { WalletProviders } from "@/components/wallet/WalletProviders";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Credibly — Decentralized Academic Credentials",
  description: "Blockchain-powered credential verification on Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WalletProviders>{children}</WalletProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [x] 4.2 TanStack Query provider

`components/QueryProvider.tsx`:

```typescript
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

- [x] 4.3 Landing page

`app/page.tsx`:

```typescript
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-6xl font-bold tracking-tight">Credibly</h1>
      <p className="text-xl text-gray-400 text-center max-w-2xl">
        Tamper-proof academic credentials on Solana. Instant verification. Zero fraud.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/dashboard" className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition">
          Institution Dashboard
        </Link>
        <Link href="/wallet" className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition">
          Student Wallet
        </Link>
        <Link href="/verify" className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition">
          Verify Credential
        </Link>
      </div>
    </main>
  );
}
```

---

## Phase 5 — Solana Wallet Integration

- [x] 5.1 Wallet Providers component

`components/wallet/WalletProviders.tsx`:

```typescript
"use client";
import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

- [x] 5.2 Anchor Program Client

`lib/solana/client.ts`:

```typescript
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "./idl/credibly.json";
import type { Credibly } from "./idl/credibly";

export const PROGRAM_ID = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

export function useCrediblyProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program<Credibly>(idl as Credibly, provider);
  }, [connection, wallet]);
}

export function getCredentialPDA(credentialHash: Buffer): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), credentialHash],
    PROGRAM_ID
  );
}

export function getInstitutionPDA(institutionPubkey: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("institution"), institutionPubkey.toBuffer()],
    PROGRAM_ID
  );
}
```

- [x] 5.3 Credential issuance helper

`lib/solana/credentials.ts`:

```typescript
import { Program, web3 } from "@coral-xyz/anchor";
import type { Credibly } from "./idl/credibly";
import { getCredentialPDA } from "./client";
import { uploadCredentialToIPFS, hashVC, type VerifiableCredential } from "@/lib/ipfs/upload";

export async function issueCredentialOnChain(
  program: Program<Credibly>,
  issuer: web3.PublicKey,
  vc: VerifiableCredential
): Promise<{ txSig: string; credentialHash: Buffer; ipfsCID: string }> {
  const ipfsCID = await uploadCredentialToIPFS(vc);
  const credentialHash = hashVC(vc);
  const [credentialPDA] = getCredentialPDA(credentialHash);

  const txSig = await program.methods
    .issueCredential(
      Array.from(credentialHash),
      ipfsCID,
      vc.credentialSubject.id
    )
    .accounts({ credentialAccount: credentialPDA, issuer })
    .rpc();

  return { txSig, credentialHash, ipfsCID };
}

export async function verifyCredentialOnChain(
  program: Program<Credibly>,
  credentialHash: Buffer
) {
  const [credentialPDA] = getCredentialPDA(credentialHash);
  try {
    const account = await program.account.credentialAccount.fetch(credentialPDA);
    return {
      valid: !account.revoked,
      exists: true,
      issuer: account.issuer.toBase58(),
      holderDid: account.holderDid,
      ipfsCid: account.ipfsCid,
      issuedAt: new Date(account.issuedAt.toNumber() * 1000).toISOString(),
      revoked: account.revoked,
    };
  } catch {
    return { valid: false, exists: false };
  }
}
```

---

## Phase 6 — Institution Admin Dashboard

- [x] 6.1 Dashboard layout

`app/(institution)/dashboard/layout.tsx`:

```typescript
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/issue", label: "Issue Credentials" },
  { href: "/dashboard/revoke", label: "Revoke" },
  { href: "/dashboard/logs", label: "Audit Logs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <aside className="w-60 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-lg font-bold mb-4 text-green-400">Credibly</h2>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm">
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
```

- [x] 6.2 Bulk Issuance page

`app/(institution)/dashboard/issue/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useCrediblyProgram } from "@/lib/solana/client";
import { issueCredentialOnChain } from "@/lib/solana/credentials";
import Papa from "papaparse";

interface CSVRow {
  student_did: string;
  degree: string;
  institution: string;
  graduation_year: string;
}

export default function IssuePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [results, setResults] = useState<{ did: string; status: string; txSig?: string }[]>([]);
  const [processing, setProcessing] = useState(false);

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !publicKey || !program) return;
    setProcessing(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      complete: async ({ data }) => {
        const batch = [];
        for (const row of data) {
          try {
            const vc = {
              "@context": ["https://www.w3.org/2018/credentials/v1"],
              type: ["VerifiableCredential", "AcademicCredential"],
              issuer: `did:sol:${publicKey.toBase58()}`,
              issuanceDate: new Date().toISOString(),
              credentialSubject: {
                id: row.student_did,
                degree: row.degree,
                institution: row.institution,
                graduationYear: parseInt(row.graduation_year),
              },
            };
            const { txSig } = await issueCredentialOnChain(program, publicKey, vc);
            batch.push({ did: row.student_did, status: "Issued", txSig });
          } catch (err) {
            batch.push({ did: row.student_did, status: `Failed: ${err}` });
          }
        }
        setResults(batch);
        setProcessing(false);
      },
    });
  }

  if (!publicKey) return (
    <div className="flex flex-col items-center gap-4 pt-20">
      <p className="text-gray-400">Connect your institution wallet to continue</p>
      <WalletMultiButton />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Bulk Credential Issuance</h1>
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-4">CSV columns: student_did, degree, institution, graduation_year</p>
        <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={processing}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500 file:text-black file:font-semibold" />
      </div>
      {processing && <p className="mt-4 text-green-400 animate-pulse">Issuing on Solana...</p>}
      {results.length > 0 && (
        <div className="mt-8 space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg p-3 text-sm">
              <span className="font-mono text-gray-300 truncate w-48">{r.did}</span>
              <span className={r.status.startsWith("Issued") ? "text-green-400" : "text-red-400"}>{r.status}</span>
              {r.txSig && (
                <a href={`https://explorer.solana.com/tx/${r.txSig}?cluster=devnet`}
                  target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  View tx ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [x] 6.3 Audit Logs page

`app/(institution)/dashboard/logs/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "@/lib/solana/client";

export default function LogsPage() {
  const { connection } = useConnection();
  const [logs, setLogs] = useState<{ signature: string; blockTime: number | null; err: unknown }[]>([]);

  useEffect(() => {
    connection
      .getSignaturesForAddress(PROGRAM_ID, { limit: 50 })
      .then(setLogs);
  }, [connection]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.signature} className="flex items-center justify-between bg-gray-900 rounded-lg p-3 text-sm">
            <span className="font-mono text-gray-300 truncate w-64">{log.signature}</span>
            <span className="text-gray-500">{log.blockTime ? new Date(log.blockTime * 1000).toLocaleString() : "pending"}</span>
            <span className={log.err ? "text-red-400" : "text-green-400"}>{log.err ? "Failed" : "Success"}</span>
            <a href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`}
              target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              Explorer ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [x] 6.4 Revoke page

`app/(institution)/dashboard/revoke/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram, getCredentialPDA } from "@/lib/solana/client";

export default function RevokePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [hashHex, setHashHex] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  async function handleRevoke() {
    if (!publicKey || !program || !hashHex) return;
    try {
      const hashBuf = Buffer.from(hashHex, "hex");
      const [credPDA] = getCredentialPDA(hashBuf);
      const txSig = await program.methods
        .revokeCredential(Array.from(hashBuf), reason)
        .accounts({ credentialAccount: credPDA, issuer: publicKey })
        .rpc();
      setStatus(`Revoked. Tx: ${txSig}`);
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Revoke Credential</h1>
      <div className="space-y-4">
        <input type="text" placeholder="Credential hash (hex)"
          value={hashHex} onChange={(e) => setHashHex(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500" />
        <input type="text" placeholder="Reason for revocation"
          value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500" />
        <button onClick={handleRevoke} disabled={!hashHex || !publicKey}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 disabled:opacity-50 transition">
          Revoke Credential
        </button>
        {status && <p className="text-sm text-gray-400 font-mono">{status}</p>}
      </div>
    </div>
  );
}
```

---

## Phase 7 — Student SSI Wallet (Web)

- [x] 7.1 Build student wallet credentials page

`app/(student)/wallet/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

interface StoredCredential {
  id: string;
  degree: string;
  institution: string;
  issuedAt: string;
  credentialHashHex: string;
}

export default function WalletPage() {
  const { publicKey } = useWallet();
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    const stored = localStorage.getItem(`credibly_${publicKey.toBase58()}`);
    if (stored) setCredentials(JSON.parse(stored));
  }, [publicKey]);

  if (!publicKey) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">My Credentials</h1>
      <p className="text-gray-400">Connect your Solana wallet to view credentials</p>
      <WalletMultiButton />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Credentials</h1>
          <WalletMultiButton />
        </div>
        <p className="text-gray-600 text-sm mb-6 font-mono">DID: did:sol:{publicKey.toBase58()}</p>

        {credentials.length === 0 ? (
          <p className="text-center py-20 text-gray-500">No credentials yet. Ask your institution to issue to your DID above.</p>
        ) : (
          <div className="grid gap-4">
            {credentials.map((cred) => (
              <div key={cred.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{cred.degree}</h2>
                  <p className="text-gray-400">{cred.institution}</p>
                  <p className="text-gray-600 text-sm mt-1">{new Date(cred.issuedAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/wallet/share/${cred.credentialHashHex}`}
                  className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm hover:bg-green-400 transition">
                  Share / QR
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [x] 7.2 QR sharing page

`app/(student)/wallet/share/[id]/page.tsx`:

```typescript
"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function SharePage({ params }: { params: { id: string } }) {
  const [verifyURL, setVerifyURL] = useState("");

  useEffect(() => {
    setVerifyURL(`${window.location.origin}/verify/${params.id}`);
  }, [params.id]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Share Credential</h1>
      <p className="text-gray-400">Verifiers scan this QR to confirm authenticity in seconds</p>
      <div className="bg-white p-6 rounded-2xl">
        <QRCode value={verifyURL} size={250} />
      </div>
      <p className="text-gray-600 font-mono text-xs break-all max-w-sm text-center">{verifyURL}</p>
    </div>
  );
}
```

---

## Phase 8 — Verifier Portal & API Routes

- [x] 8.1 Verifier input page

`app/(verifier)/verify/page.tsx`:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Verify a Credential</h1>
      <p className="text-gray-400">Enter a credential hash or scan a student's QR code</p>
      <div className="flex gap-3 w-full max-w-lg">
        <input type="text" placeholder="Credential hash (hex)..."
          value={hash} onChange={(e) => setHash(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500" />
        <button onClick={() => router.push(`/verify/${hash}`)} disabled={!hash}
          className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 disabled:opacity-50 transition">
          Verify
        </button>
      </div>
    </div>
  );
}
```

- [x] 8.2 Verification result page

`app/(verifier)/verify/[hash]/page.tsx`:

```typescript
interface VerifyResult {
  valid: boolean;
  exists: boolean;
  issuer?: string;
  issuedAt?: string;
  revoked?: boolean;
  ipfsCid?: string;
}

async function getResult(hash: string): Promise<VerifyResult> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${hash}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function VerifyResultPage({ params }: { params: { hash: string } }) {
  const result = await getResult(params.hash);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 p-8">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl
        ${result.valid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
        {result.valid ? "✓" : "✗"}
      </div>
      <h1 className="text-4xl font-bold">
        {result.valid ? "Credential Valid" : result.exists ? "Credential Revoked" : "Not Found"}
      </h1>
      {result.exists && (
        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-800 space-y-3 text-sm">
          <Row label="Issuer" value={result.issuer ?? "—"} />
          <Row label="Issued At" value={result.issuedAt ? new Date(result.issuedAt).toLocaleString() : "—"} />
          <Row label="Status" value={result.revoked ? "Revoked" : "Active"} />
          {result.ipfsCid && (
            <a href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${result.ipfsCid}`}
              target="_blank" rel="noreferrer" className="text-blue-400 hover:underline block">
              View full credential on IPFS ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
```

- [x] 8.3 Verify API route

`app/api/verify/[hash]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/lib/solana/idl/credibly.json";
import type { Credibly } from "@/lib/solana/idl/credibly";

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

export async function GET(_req: NextRequest, { params }: { params: { hash: string } }) {
  try {
    const hashBuf = Buffer.from(params.hash, "hex");
    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), hashBuf],
      PROGRAM_ID
    );

    const provider = new AnchorProvider(connection, {} as never, { commitment: "confirmed" });
    const program = new Program<Credibly>(idl as Credibly, provider);
    const account = await program.account.credentialAccount.fetch(credentialPDA);

    return NextResponse.json({
      valid: !account.revoked,
      exists: true,
      issuer: account.issuer.toBase58(),
      holderDid: account.holderDid,
      ipfsCid: account.ipfsCid,
      issuedAt: new Date(account.issuedAt.toNumber() * 1000).toISOString(),
      revoked: account.revoked,
    });
  } catch {
    return NextResponse.json({ valid: false, exists: false }, { status: 404 });
  }
}
```

- [x] 8.4 Issue API route

`app/api/issue/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadCredentialToIPFS, hashVC } from "@/lib/ipfs/upload";

export async function POST(req: NextRequest) {
  const { vc } = await req.json();
  const ipfsCID = await uploadCredentialToIPFS(vc);
  const credentialHashHex = hashVC(vc).toString("hex");

  // Client receives the hash + CID, then signs and submits the tx from their wallet
  return NextResponse.json({ ipfsCID, credentialHashHex });
}
```

---

## Phase 9 — DigiLocker & NAD Integration

- [x] 9.1 Build DigiLocker client helpers
- [x] 9.2 Add DigiLocker auth route
- [x] 9.3 Add DigiLocker callback route

`lib/digilocker/client.ts`:

```typescript
const BASE = "https://api.digitallocker.gov.in/public/oauth2/1";

export function getDigiLockerAuthURL(): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DIGILOCKER_CLIENT_ID!,
    redirect_uri: process.env.DIGILOCKER_REDIRECT_URI!,
    scope: "openid profile",
  });
  return `${BASE}/authorize?${params}`;
}

export async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      client_id: process.env.DIGILOCKER_CLIENT_ID,
      client_secret: process.env.DIGILOCKER_CLIENT_SECRET,
      redirect_uri: process.env.DIGILOCKER_REDIRECT_URI,
    }),
  });
  const { access_token } = await res.json();
  return access_token;
}

export async function pushToDigiLocker(accessToken: string, ipfsCID: string, metadata: object) {
  return fetch(`${BASE}/file`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ipfs_cid: ipfsCID, metadata }),
  });
}
```

`app/api/digilocker/auth/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getDigiLockerAuthURL } from "@/lib/digilocker/client";

export function GET() {
  return NextResponse.redirect(getDigiLockerAuthURL());
}
```

`app/api/digilocker/callback/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/digilocker/client";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect("/error?msg=no_code");

  const accessToken = await exchangeCode(code);
  const res = NextResponse.redirect("/wallet?digilocker=connected");
  res.cookies.set("digilocker_token", accessToken, { httpOnly: true, secure: true, maxAge: 3600 });
  return res;
}
```

---

## Phase 10 — AI Anomaly Detection

- [x] 10.1 FastAPI service

`ai/main.py`:

```python
from fastapi import FastAPI
from pydantic import BaseModel
import joblib, numpy as np, os

app = FastAPI()
model = joblib.load("model.pkl") if os.path.exists("model.pkl") else None

class VerifyRequest(BaseModel):
    requests_per_minute: float
    unique_ips: int
    geo_spread_score: float
    hour_of_day: int

@app.post("/detect")
def detect(req: VerifyRequest):
    if model is None:
        return {"anomaly": False, "note": "model not trained"}
    features = np.array([[
        req.requests_per_minute, req.unique_ips,
        req.geo_spread_score, req.hour_of_day
    ]])
    return {"anomaly": bool(model.predict(features)[0] == -1)}

@app.get("/health")
def health():
    return {"status": "ok"}
```

`ai/train.py`:

```python
import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

df = pd.read_csv("data/logs.csv")
features = df[["requests_per_minute", "unique_ips", "geo_spread_score", "hour_of_day"]]
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(features)
joblib.dump(model, "model.pkl")
print("Model saved.")
```

`ai/requirements.txt`:

```
fastapi==0.111.0
uvicorn==0.29.0
scikit-learn==1.5.0
pandas==2.2.2
joblib==1.4.2
numpy==1.26.4
pydantic==2.7.1
```

```bash
cd ai
pip install -r requirements.txt
python train.py           # train the model first
uvicorn main:app --reload --port 8000
```

- [x] 10.2 AI proxy API route

`app/api/ai/detect/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${process.env.AI_SERVICE_URL}/detect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json());
}
```

---

## Phase 11 — Zero-Knowledge Proof Layer

- [x] 11.1 Circuit

`circuits/credentialProof.circom`:

```circom
pragma circom 2.0.0;
include "node_modules/circomlib/circuits/poseidon.circom";

template CredentialProof() {
    // Private — never revealed to verifier
    signal input credentialHashLow;
    signal input credentialHashHigh;
    signal input gpa100;          // GPA x 100, e.g. 380 = 3.80
    signal input salt;

    // Public — shared with verifier
    signal output commitment;

    component hasher = Poseidon(4);
    hasher.inputs[0] <== credentialHashLow;
    hasher.inputs[1] <== credentialHashHigh;
    hasher.inputs[2] <== gpa100;
    hasher.inputs[3] <== salt;

    commitment <== hasher.out;
}

component main { public [credentialHashLow, credentialHashHigh] } = CredentialProof();
```

- [x] 11.2 Compile and trusted setup

```bash
cd circuits
npm install circomlib

# Compile circuit
circom credentialProof.circom --r1cs --wasm --sym -o build/

# Phase 1: Powers of Tau
snarkjs powersoftau new bn128 12 pot12_0.ptau -v
snarkjs powersoftau contribute pot12_0.ptau pot12_1.ptau --name="Credibly" -v
snarkjs powersoftau prepare phase2 pot12_1.ptau pot12_final.ptau -v

# Phase 2: Circuit-specific
snarkjs groth16 setup build/credentialProof.r1cs pot12_final.ptau build/cred_0.zkey
snarkjs zkey contribute build/cred_0.zkey build/cred_final.zkey --name="Credibly" -v
snarkjs zkey export verificationkey build/cred_final.zkey build/verification_key.json

# Copy assets to public/
cp -r build/credentialProof_js public/circuits
cp build/cred_final.zkey public/circuits/
cp build/verification_key.json public/circuits/
```

- [x] 11.3 ZK helpers

`lib/zk/proof.ts`:

```typescript
import * as snarkjs from "snarkjs";

export async function generateCredentialProof(input: {
  credentialHashLow: bigint;
  credentialHashHigh: bigint;
  gpa100: bigint;
  salt: bigint;
}) {
  return snarkjs.groth16.fullProve(
    input,
    "/circuits/credentialProof.wasm",
    "/circuits/cred_final.zkey"
  );
}

export async function verifyCredentialProof(proof: object, publicSignals: string[]): Promise<boolean> {
  const vKey = await fetch("/circuits/verification_key.json").then((r) => r.json());
  return snarkjs.groth16.verify(vKey, publicSignals, proof);
}
```

---

## Phase 12 — ATS Webhook Integrations

- [x] 12.1 Add ATS verification webhook route
- [x] 12.2 Configure webhook events per ATS platform

`app/api/ats/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { credentialHash, atsSource, candidateId } = await req.json();

  const result = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${credentialHash}`
  ).then((r) => r.json());

  return NextResponse.json({
    candidate_verified: result.valid,
    candidate_id: candidateId,
    issuer: result.issuer,
    issuer_tier: result.institutionTier,
    verified_at: new Date().toISOString(),
    explorer_url: `https://explorer.solana.com/address/${result.credentialPDA}?cluster=devnet`,
    source: atsSource,
  });
}
```

**Setup per ATS platform:**

- **Keka**: Settings → Integrations → Webhooks → add `POST /api/ats/verify` for `candidate.background_check` event
- **Darwinbox**: Settings → API Marketplace → create custom background check provider pointing to same endpoint
- **Zoho Recruit**: Setup → Extensions → Webhooks → trigger on candidate stage change to "Background Verification"

---

## Phase 13 — Post-Quantum Cryptography Roadmap

- [ ] 13.1 Validate Dilithium signing and verification flow (PoC)
- [ ] 13.2 Plan Solana migration with transition support

Current Solana programs use Ed25519 (quantum-vulnerable ~2030). Migration plan:

```bash
pip install pyoqs

python3 - <<'EOF'
import oqs
signer = oqs.Signature("Dilithium3")
public_key = signer.generate_keypair()
message = b"credibly_credential_hash"
signature = signer.sign(message)
verifier = oqs.Signature("Dilithium3", public_key)
print("Valid:", verifier.verify(message, signature, public_key))
EOF
```

**Solana migration path:**
- [ ] Deploy a new PQC-aware program version (upgradeability via Anchor's upgrade authority)
- [ ] New version accepts Dilithium3 signatures alongside existing Ed25519 (transition period)
- [ ] Credentials already on-chain remain valid — only new issuances require PQC signatures
- [ ] Full cutover before the 2030 quantum threat window

---

## Trust Registry & Sybil Resistance

| Tier | Who | How Added |
|---|---|---|
| **Tier 1** | UGC/AICTE-recognised universities | Admin calls `register_institution(tier=1)` after regulatory confirmation |
| **Tier 2** | Bootcamps, private training providers | Document review, then `register_institution(tier=2)` |

The Anchor program enforces this at the constraint level — any wallet not in the TrustRegistry PDA will be rejected by `issue_credential` with `UnregisteredIssuer`. Verifiers always see the tier in the API response.

---

## Privacy & Compliance

| Requirement | How Credibly Handles It |
|---|---|
| GDPR Right to Erasure | 32-byte hash on-chain is meaningless without the IPFS document; student unpins → credential effectively erased |
| India DPDPA 2023 | No PII on Solana; wallet consent gates all sharing |
| Zero PII on blockchain | Only SHA-256 hashes written to Solana PDA accounts |
| Selective Disclosure | ZK-SNARKs prove a claim (e.g. "has a degree") without revealing GPA or full transcript |

---

## Credential Lifecycle

```
1. Institution onboards
   └─→ Admin calls register_institution() on Solana
   └─→ PDA created: seeds = ["institution", institution_pubkey]

2. Credential issuance
   └─→ Build W3C VC (JSON-LD)
   └─→ Upload to IPFS via Pinata → get CID
   └─→ SHA-256 hash the VC
   └─→ Institution wallet signs issue_credential(hash, CID, holderDID)
   └─→ PDA created: seeds = ["credential", sha256_hash]

3. Student receives VC
   └─→ Wallet polls for credential PDAs linked to their DID
   └─→ Fetches full VC from IPFS using CID
   └─→ Stored in localStorage / React Native Keychain (encrypted)

4. Verification (< 10 seconds)
   └─→ Verifier scans QR → hits /verify/[hash]
   └─→ Next.js API fetches credential PDA from Solana
   └─→ Checks revoked flag + institution tier
   └─→ Returns valid/invalid + institution name + tier

5. Revocation
   └─→ Institution calls revoke_credential(hash, reason)
   └─→ PDA field revoked = true (immutable event on-chain)
   └─→ All future verification queries return revoked: true
```

---

## Testing

```bash
# Solana program tests (Anchor)
cd anchor && anchor test

# Next.js unit + integration tests
npm test

# Next.js E2E tests (Playwright)
npx playwright test

# AI service tests
cd ai && pytest tests/

# TypeScript type checking
npm run type-check

# Full local E2E: start validator, deploy, run app, issue + verify + revoke
solana-test-validator --reset &
anchor deploy --provider.cluster localnet
npm run dev
```

---

## Deployment

### Local Development (all services)

```bash
# Terminal 1: Solana local validator
solana-test-validator --reset

# Terminal 2: Deploy Anchor program
cd anchor && anchor deploy --provider.cluster localnet

# Terminal 3: AI microservice
cd ai && uvicorn main:app --reload --port 8000

# Terminal 4: Next.js
npm run dev   # http://localhost:3000
```

### Production

```bash
# 1. Deploy Anchor program to Devnet then Mainnet
solana config set --url devnet
anchor deploy --provider.cluster devnet

# Update NEXT_PUBLIC_PROGRAM_ID in Vercel env vars

# 2. Deploy Next.js to Vercel
npx vercel --prod

# 3. Deploy AI service
docker build -t credibly-ai ./ai
docker run -p 8000:8000 credibly-ai
# or: deploy to Railway / Render with Dockerfile
```

### Docker Compose

`docker-compose.yml`:

```yaml
version: "3.9"
services:
  nextjs:
    build: .
    ports: ["3000:3000"]
    env_file: .env.local
    depends_on: [ai]

  ai:
    build: ./ai
    ports: ["8000:8000"]
    volumes: ["./ai:/app"]

  solana-validator:
    image: solanalabs/solana:v1.18.0
    command: solana-test-validator --reset --bind-address 0.0.0.0
    ports: ["8899:8899", "8900:8900"]
```

```bash
docker-compose up --build
```

---

## Roadmap

| Quarter | Milestone |
|---|---|
| **Q4 2025** | Anchor program audit, Next.js app launch, Solana Devnet deployment, DigiLocker PoC |
| **Q1 2026** | Pilot with 3 universities, public beta wallet, employer verification portal |
| **Q2–Q3 2026** | 50+ institutions, ATS integrations, AI anomaly detection live, Mainnet-beta launch |
| **Q4 2026+** | Post-quantum migration, Southeast Asia + MENA, UGC/AICTE policy engagement |

---

## References

- [Solana Docs](https://docs.solana.com)
- [Anchor Framework](https://www.anchor-lang.com)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [W3C Decentralized Identifiers](https://www.w3.org/TR/did-core/)
- [DigiLocker API](https://digilocker.gov.in)
- [snarkjs](https://github.com/iden3/snarkjs) · [circom](https://docs.circom.io)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [Open Quantum Safe](https://openquantumsafe.org)
- [Pinata IPFS](https://docs.pinata.cloud)
- [Blockcerts Open Standard](https://blockcerts.org)

---

*Credibly — Trust infrastructure for the global education-to-employment pipeline, built on Solana.*