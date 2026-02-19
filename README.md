<div align="center">

# 🎓 Credibly

**A decentralized platform for secure academic credential verification — built on Solana.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Pre-Alpha](https://img.shields.io/badge/Status-Pre--Alpha-orange.svg)]()
[![Built With: TypeScript](https://img.shields.io/badge/Built_with-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)
[![Blockchain: Solana](https://img.shields.io/badge/Blockchain-Solana-9945FF.svg)](https://solana.com/)

</div>

---

## 📌 Table of Contents

1. [Overview](#-overview)
2. [Why Solana](#-why-solana)
3. [Problem & Solution](#-problem--solution)
4. [System Architecture](#-system-architecture)
5. [Components](#-components)
6. [Technical Stack](#-technical-stack)
7. [Monorepo Structure](#-monorepo-structure)
8. [Build Roadmap](#-build-roadmap)
9. [Getting Started](#-getting-started)
10. [Environment Variables](#-environment-variables)
11. [Standards & Compliance](#-standards--compliance)
12. [Contributing](#-contributing)
13. [License](#-license)

---

## 🌐 Overview

**Credibly** is an open-source, decentralized academic credential verification system built on **Solana**. Universities issue tamper-proof digital credentials as **Compressed NFTs** (cNFTs) anchored on-chain. Students control their credentials via a self-sovereign wallet. Employers and institutions verify authenticity in under a second — for virtually zero cost.

> **Mission:** Eliminate credential fraud, reduce administrative friction, and give individuals true ownership of their academic identity.

---

## ⚡ Why Solana

| Factor | Solana | Ethereum / Polygon |
|---|---|---|
| **Tx cost** | ~$0.00025 | $0.01–$0.50+ |
| **Finality** | ~400 ms | 2–15 seconds |
| **Throughput** | 65,000+ TPS | ~7,000 TPS |
| **Bulk issuance (10k degrees)** | ~$2.50 total | $100–$5,000+ |
| **cNFT credentials** | Native (Metaplex Bubblegum) | Not available |

Issuing credentials at scale (a university graduates thousands of students per year) makes cost-per-transaction critically important. Solana's **Compressed NFTs** let us issue one million credentials for roughly **$110 total**. Each credential is a real on-chain asset the student owns and any Solana wallet (Phantom, Backpack) can display natively.

---

## 🧩 Problem & Solution

| Problem | Credibly's Solution |
|---|---|
| Credential fraud is undetectable without contacting the registrar | Credentials are cNFTs anchored immutably on Solana |
| Verification takes days or weeks | Instant cryptographic verification via QR code or API (~400 ms) |
| Graduates lose physical certificates | Self-sovereign wallet — students own and carry credentials anywhere |
| No standardized digital credential format | W3C Verifiable Credentials (VCs) + `did:sol` Decentralized Identifiers |
| Third-party verification services are expensive | Open verifier portal — free for anyone |

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           CREDIBLY PLATFORM                            │
│                                                                        │
│  ┌────────────────────── ┐     ┌────────────────────── ┐               │
│  │  Institution          │     │  Student SSI          │               │
│  │  Dashboard (Web)      │     │  Wallet (Mobile)      │               │
│  │  Next.js 15 + TS     │     │  React Native + Expo  │                │
│  └──────────┬────────────┘     └──────────┬────────────┘               │
│             │                             │                            │
│             ▼                             ▼                            │
│  ┌─────────────────────────────────────────────────────── ┐            │
│  │               Backend API  (NestJS + GraphQL)          │            │
│  │   Auth │ VC Issuance │ Revocation │ Student Mgmt       │            │
│  └────────────────────────────┬────────────────────────── ┘            │
│                               │                                        │
│          ┌────────────────────┼──────────────────┐                     │
│          ▼                    ▼                   ▼                    │
│  ┌────────────────┐   ┌────────────────┐  ┌─────────────────┐          │
│  │  Solana        │   │  PostgreSQL    │  │  IPFS / Arweave │          │
│  │  (cNFT / DID   │   │  (off-chain    │  │  (full VC docs  │          │
│  │   registry,    │   │   metadata)    │  │   & metadata)   │          │
│  │   revocation)  │   │                │  │                 │          │
│  └────────┬───────┘   └────────────────┘  └─────────────────┘          │
│           │  Metaplex Bubblegum (cNFT)                                 │
│           │  did:sol  (credential DID)                                 │
│           │  Anchor Program (revocation registry)                      │
│           ▼                                                            │
│  ┌──────────────────────┐                                              │
│  │  Verifier Portal     │  ← QR scan / REST API / embeddable widget    │
│  └──────────────────────┘                                              │
│                                                                        │
│  ┌──────────────────────┐                                              │
│  │  Public Landing Page │  ← Marketing / institutional onboarding      │
│  └──────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────┘
```

**Credential issuance flow:**
```
Institution → signs VC payload → API calls Metaplex Bubblegum
                               → mints cNFT to student's wallet address
                               → stores VC metadata hash in Anchor PDA
                               → pins full VC JSON to IPFS
                               → student wallet receives cNFT instantly
```

**Verification flow:**
```
Verifier scans QR → fetches cNFT from Solana RPC
                 → verifies cNFT is in valid Merkle tree
                 → checks revocation PDA (is_revoked flag)
                 → verifies institution's cryptographic signature on VC
                 → returns VALID ✅ / INVALID ❌ / REVOKED 🚫
```

---

## 📦 Components

### 1. 🏛️ Institution Dashboard (`apps/institution-dashboard`)

| Feature | Details |
|---|---|
| Institution onboarding | KYC flow, `did:sol` DID generation, Solana keypair setup |
| Bulk credential issuance | CSV upload → batch cNFT mint via Bubblegum (thousands at ~$0.00025 each) |
| Credential management | View all issued cNFTs with on-chain status |
| Revocation | Flip revocation PDA flag on-chain with full audit trail |
| Analytics | Issuance stats, verification counts, cost dashboard |

### 2. 🎒 Student SSI Wallet (`apps/student-wallet`)

| Feature | Details |
|---|---|
| Credential inbox | cNFTs minted to wallet appear automatically |
| Credential viewer | Card-based display (similar to NFT gallery UX) |
| Selective disclosure | Share only chosen fields (name, degree, graduation date) |
| QR presentation | Generate a signed Verifiable Presentation QR (time-limited) |
| Wallet connect | Phantom / Backpack / Solflare integration |
| Offline support | Cached credential data available without internet |

### 3. ✅ Verifier Portal (`apps/verifier-portal`)

| Feature | Details |
|---|---|
| QR scanner | Camera scan of student's VP QR |
| Manual verification | Paste cNFT address, credential ID, or upload VC JSON |
| Result display | VALID ✅ / INVALID ❌ / REVOKED 🚫 with institution info |
| Public REST API | `GET /api/verify/:mintAddress` |
| Embeddable widget | Drop-in `<script>` tag for ATS / HR platforms |

### 4. 🌍 Public Landing Page (`apps/landing`)

| Feature | Details |
|---|---|
| Hero section | Animated explainer with live Solana tx demo |
| How it works | Flows for institution / student / verifier |
| Institutional sign-up | Waitlist / onboarding CTA |
| Developer docs | Link to API reference and Anchor program IDL |

---

## 🛠️ Technical Stack

### Frontend (Web)
| Technology | Purpose |
|---|---|
| **Next.js 15** + **TypeScript** | React framework (App Router, SSR, SSG) |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **TanStack Query** | Server state + async data fetching |
| **Zustand** | Client state management |
| **next/image** | Optimised image handling |
| **@solana/wallet-adapter** | Phantom / Backpack / Solflare connect |

### Frontend (Mobile)
| Technology | Purpose |
|---|---|
| **React Native** + **TypeScript** | Cross-platform mobile (iOS & Android) |
| **Expo** | Managed workflow & OTA updates |
| **React Native Camera** | QR code scanning |
| **Expo SecureStore** | Encrypted local credential cache |
| **Mobile Wallet Adapter** | Phantom Mobile / Backpack Mobile signing |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** + **NestJS** | Server framework |
| **GraphQL** (Apollo Server) | Primary API layer |
| **REST** | Public verifier endpoint |
| **PostgreSQL** | Off-chain metadata |
| **Prisma ORM** | Schema & migrations |
| **Redis** + **Bull** | Job queues for async batch minting |
| **JWT** | Authentication |

### Blockchain & Identity (Solana)
| Technology | Purpose |
|---|---|
| **Solana** (Devnet → Mainnet-Beta) | Base layer |
| **Anchor** framework | Rust program development & testing |
| **Rust** | Smart program language |
| **Metaplex Bubblegum** | Compressed NFT (cNFT) minting & transfer |
| **Metaplex Core** (optional) | Richer NFT metadata standard |
| **`did:sol`** | Decentralized Identifiers on Solana |
| **`@solana/web3.js`** | RPC interaction from Node.js |
| **`@metaplex-foundation/umi`** | Metaplex SDK for minting |
| **W3C Verifiable Credentials** | VC data model (off-chain JSON-LD payload) |

### Storage & Infrastructure
| Technology | Purpose |
|---|---|
| **IPFS** (via Pinata) | Decentralized VC document storage |
| **Arweave** | Permanent archival (optional) |
| **Docker** + **Docker Compose** | Local dev environment |
| **Kubernetes** | Production orchestration |
| **GitHub Actions** | CI/CD pipelines |

---

## 📁 Monorepo Structure

```
credibly/
├── README.md
├── package.json                         ← pnpm workspaces root
├── pnpm-workspace.yaml
├── turbo.json                           ← Turborepo pipeline config
├── .env.example
│
├── apps/
│   ├── institution-dashboard/           ← Next.js 15 app (App Router, SSR)
│   │   ├── app/                         ← App Router pages & layouts
│   │   │   ├── (auth)/                  ← Login, register, forgot-password
│   │   │   ├── dashboard/               ← Home, issuance, management
│   │   │   └── layout.tsx
│   │   └── components/
│   ├── student-wallet/                  ← React Native + Expo mobile app
│   ├── verifier-portal/                 ← Next.js 15 app (SSR + public API route)
│   │   ├── app/
│   │   │   ├── verify/                  ← QR scanner & manual verify pages
│   │   │   └── api/verify/[mint]/       ← Public REST route handler
│   │   └── components/
│   └── landing/                         ← Next.js 15 static site (SSG)
│
├── packages/
│   ├── api/                             ← NestJS backend (GraphQL + REST)
│   │   └── src/
│   │       ├── auth/
│   │       ├── credentials/             ← VC issuance, revocation
│   │       ├── institutions/
│   │       ├── students/
│   │       └── solana/                  ← Bubblegum minting, RPC client
│   │
│   ├── programs/                        ← Anchor (Rust) Solana programs
│   │   ├── programs/
│   │   │   ├── did-registry/            ← did:sol registration
│   │   │   │   └── src/lib.rs
│   │   │   └── revocation-registry/     ← Per-credential revocation PDA
│   │   │       └── src/lib.rs
│   │   ├── tests/
│   │   ├── migrations/
│   │   └── Anchor.toml
│   │
│   ├── vc-core/                         ← Shared VC issuance/verify logic (TS)
│   │   └── src/
│   │       ├── issuer.ts                ← Sign VC with institution keypair
│   │       ├── verifier.ts              ← Verify VC signature + on-chain status
│   │       ├── did.ts                   ← did:sol helpers
│   │       └── types.ts                 ← W3C VC / VP TypeScript types
│   │
│   ├── ui/                              ← Shared React component library
│   └── db/                             ← Prisma schema + migrations
│       └── prisma/schema.prisma
│
├── infrastructure/
│   ├── docker/docker-compose.dev.yml
│   ├── k8s/
│   └── terraform/
│
└── docs/
    ├── architecture.md
    ├── api-reference.md
    ├── vc-schema.md
    └── anchor-programs.md
```

---

## 🗺️ Build Roadmap

### Phase 0 – Foundation *(Week 1–2)*
> Scaffold, CI/CD, base data models.

- [ ] Initialize pnpm monorepo with Turborepo
- [ ] Configure ESLint, Prettier, TypeScript base config
- [ ] Set up GitHub Actions CI (lint + type-check + test)
- [ ] Provision local Docker stack (PostgreSQL + Redis)
- [ ] Define Prisma schema (Institution, Student, Credential, RevocationRecord)
- [ ] NestJS skeleton with health-check endpoint
- [ ] Define W3C VC JSON-LD schema and TypeScript types in `vc-core`
- [ ] Unit tests for `vc-core` (sign + verify VC logic)
- [ ] Set up Solana local validator (via `solana-test-validator`)

---

### Phase 1 – Solana Programs *(Week 3–4)*
> Write, test, and deploy Anchor programs.

- [ ] **`did-registry` program** — register & resolve `did:sol` for institutions
- [ ] **`revocation-registry` program** — PDA per credential, `is_revoked` flag
- [ ] Anchor test suite for both programs
- [ ] Deploy to local validator
- [ ] Deploy to **Solana Devnet**
- [ ] Set up Metaplex **Bubblegum** Merkle tree for cNFT minting
- [ ] `solana/` NestJS module:
  - `mintCredentialNft(studentWallet, metadata)` — Bubblegum cNFT mint
  - `revokeCredential(mintAddress)` — flip revocation PDA
  - `isRevoked(mintAddress) → boolean`
  - `resolveInstitutionDid(address) → DIDDocument`
- [ ] IPFS upload service (Pinata API)

---

### Phase 2 – Backend API *(Week 5–7)*
> Full GraphQL + REST API.

- [ ] JWT authentication (institution + admin roles)
- [ ] `auth` module: register, login, refresh, 2FA
- [ ] `institutions` module: CRUD, onboarding, `did:sol` registration
- [ ] `credentials` module:
  - Single cNFT issuance
  - Batch issuance via Bull job queue (async, progress websocket)
  - Revocation
  - Status query
- [ ] `students` module: student records, wallet address linking
- [ ] GraphQL schema & resolvers
- [ ] `GET /api/verify/:mintAddress` public REST endpoint
- [ ] Rate limiting, validation, error handling
- [ ] Integration tests
- [ ] OpenAPI + GraphQL schema documentation

---

### Phase 3 – Web Applications *(Week 8–11)*
> Institution Dashboard, Verifier Portal, Landing Page.

**Institution Dashboard** *(Next.js 15, App Router, SSR)*
- [ ] Scaffold Next.js 15 app with App Router + Tailwind + shadcn/ui
- [ ] Auth pages using Next.js middleware for route protection
- [ ] Onboarding wizard: institution details → KYC → `did:sol` DID generation → Merkle tree setup
- [ ] Dashboard home (Server Component stats: credentials issued, verifications, cost in SOL)
- [ ] Single + bulk issuance page (CSV → progress tracker via WebSocket)
- [ ] Credential management table (search, filter, revoke — with Server Actions)
- [ ] Wallet connect (Phantom / Backpack via `@solana/wallet-adapter`)

**Verifier Portal** *(Next.js 15, SSR + API Route)*
- [ ] Scaffold Next.js 15 app
- [ ] QR code scanner page (client component, camera access)
- [ ] Manual verification page (paste mint address or VC JSON)
- [ ] Result page — VALID / INVALID / REVOKED (Server-rendered for SEO/sharing)
- [ ] `app/api/verify/[mint]/route.ts` — public REST handler
- [ ] Embeddable `widget.js` (served from `/public`)

**Landing Page** *(Next.js 15, fully SSG)*
- [ ] Scaffold Next.js 15 app with `output: 'export'` (static build)
- [ ] Hero section with animated explainer
- [ ] "How it works" section (3 persona flows)
- [ ] Features section
- [ ] Institutional sign-up / waitlist form (Server Action)

---

### Phase 4 – Mobile Wallet *(Week 12–15)*
> Student SSI Wallet (React Native + Expo).

- [ ] Onboarding (create or import Solana wallet, backup seed phrase)
- [ ] Credential inbox (auto-detect cNFTs in wallet via RPC)
- [ ] Credential detail screen (display VC metadata beautifully)
- [ ] QR presentation screen (signed Verifiable Presentation, time-limited)
- [ ] Selective disclosure UI
- [ ] Offline credential cache (SecureStore)
- [ ] Push notifications for new credentials
- [ ] Export credential as PDF

---

### Phase 5 – Security, Testing & Launch *(Week 16–18)*
> Harden, audit, and ship.

- [ ] Anchor program security audit (internal + third-party)
- [ ] Backend penetration testing
- [ ] End-to-end tests (Playwright for web, Detox for mobile)
- [ ] WCAG 2.1 AA accessibility audit & fixes
- [ ] Lighthouse performance score > 90
- [ ] Production Kubernetes cluster setup
- [ ] Monitoring & alerting (Datadog / Grafana)
- [ ] Migrate Devnet programs to **Mainnet-Beta**
- [ ] User documentation + API reference
- [ ] Public beta launch 🚀

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| **Node.js** | ≥ 20 LTS | [nodejs.org](https://nodejs.org) |
| **pnpm** | ≥ 9 | `npm install -g pnpm` |
| **Rust** | stable | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Solana CLI** | ≥ 1.18 | [docs.solana.com/cli/install](https://docs.solana.com/cli/install-solana-cli-tools) |
| **Anchor CLI** | ≥ 0.30 | `cargo install --git https://github.com/coral-xyz/anchor anchor-cli` |
| **Docker** + **Compose** | Latest | [docker.com](https://docs.docker.com/get-docker/) |

### 1. Clone and install

```bash
git clone https://github.com/YOUR_ORG/credibly.git
cd credibly
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in values — see Environment Variables section
```

### 3. Start local infrastructure

```bash
# PostgreSQL + Redis
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Solana local validator (in a separate terminal)
solana-test-validator --reset
```

### 4. Build and deploy Anchor programs (local)

```bash
pnpm --filter @credibly/programs build
pnpm --filter @credibly/programs deploy:localnet
# Program IDs are printed — copy them to .env
```

### 5. Run database migrations

```bash
pnpm --filter @credibly/db db:migrate
```

### 6. Start all apps

```bash
pnpm dev
```

| App | URL |
|---|---|
| Institution Dashboard | http://localhost:3001 |
| Verifier Portal | http://localhost:3002 |
| Landing Page | http://localhost:3003 |
| Backend API (GraphQL) | http://localhost:4000/graphql |
| Backend API (REST) | http://localhost:4000/api |

**Student Wallet (mobile):**
```bash
pnpm --filter @credibly/student-wallet start
# Scan the Expo QR code with Expo Go
```

### Running Tests

```bash
pnpm test                                      # all packages
pnpm --filter @credibly/programs test          # Anchor program tests
pnpm --filter @credibly/vc-core test           # VC sign/verify unit tests
pnpm --filter @credibly/api test               # API integration tests
```

---

## 🔐 Environment Variables

```env
# ── Database ──────────────────────────────────────────────────────────
DATABASE_URL="postgresql://credibly:credibly@localhost:5432/credibly_dev"
REDIS_URL="redis://localhost:6379"

# ── Authentication ─────────────────────────────────────────────────────
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN="7d"

# ── Solana ─────────────────────────────────────────────────────────────
SOLANA_NETWORK="localnet"                  # localnet | devnet | mainnet-beta
SOLANA_RPC_URL="http://127.0.0.1:8899"
INSTITUTION_KEYPAIR_PATH="~/.config/solana/id.json"

# Program IDs (populated after anchor deploy)
DID_REGISTRY_PROGRAM_ID=""
REVOCATION_REGISTRY_PROGRAM_ID=""

# Metaplex Bubblegum Merkle tree address (created on first run)
MERKLE_TREE_ADDRESS=""

# ── IPFS ───────────────────────────────────────────────────────────────
PINATA_API_KEY=""
PINATA_SECRET_API_KEY=""

# ── Email ──────────────────────────────────────────────────────────────
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""

# ── App URLs ───────────────────────────────────────────────────────────
INSTITUTION_DASHBOARD_URL="http://localhost:3001"
VERIFIER_PORTAL_URL="http://localhost:3002"
API_URL="http://localhost:4000"
```

> ⚠️ **Never commit `.env`.** It is in `.gitignore`.

---

## 📜 Standards & Compliance

| Standard | Purpose |
|---|---|
| [W3C DID Core](https://www.w3.org/TR/did-core/) | Decentralized Identifier specification |
| [`did:sol`](https://identity.foundation/did-sol/spec/) | Solana DID method |
| [W3C VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) | Verifiable Credentials data model |
| [JSON-LD](https://json-ld.org/) | Linked data for VC context |
| [Metaplex Bubblegum](https://developers.metaplex.com/bubblegum) | Compressed NFT standard on Solana |
| [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/) | Web accessibility |
| [OpenID Connect](https://openid.net/connect/) | OAuth2-based authentication |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add bulk mint job queue"`
4. Ensure all checks pass: `pnpm lint && pnpm build && pnpm test`
5. Open a Pull Request against `main`

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full code of conduct and guidelines.

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Built with ❤️ on Solana
*Fighting credential fraud, one compressed NFT at a time.*

</div>
