# Credibly — Solana-Based Academic Credential Verification

Credibly is a decentralized credential verification system that allows institutions to issue tamper-proof academic credentials and enables instant, trustless verification using Solana.

**Core Principle:** The system stores *only* cryptographic hashes on-chain. No personal data or full PDFs are ever stored on the blockchain. The blockchain acts purely as a global, tamper-proof credential registry.

---

## � Vision
To replace slow, manual, and forgeable academic credential verification systems with cryptographic, decentralized proofs that can be verified globally in seconds.

---

## 🏗 Architecture & Tech Stack

### Tech Stack
- **Blockchain:** Solana Devnet, Anchor Framework, `@solana/web3.js`
- **Frontend:** Next.js (App Router), Tailwind CSS
- **Utilities:** SHA-256 (Web Crypto API), QR Code Generator & Scanner

### On-Chain Data Design
To ensure O(1) lookups and prevent duplicates, each credential is stored as a **Program Derived Address (PDA)**.

**Seeds:** `["credential", hash]`

```rust
pub struct Credential {
    pub issuer: Pubkey,
    pub hash: [u8; 32],
    pub revoked: bool,
}
```

---

## 🧱 Development Roadmap

### 🟢 Phase 1 — MVP: On-Chain Credential Registry
**Objective:** Prove cryptographic authenticity via on-chain hash storage, instant verification, and revocation capability.
- **Solana Program:** PDA-based storage. Instructions for `issue_credential` and `revoke_credential`. Only the issuer wallet can revoke.
- **Next.js App:**
  - `/issue`: Client-side PDF hashing and sending the Solana transaction. Generates a QR code.
  - `/verify`: Scan QR or paste hash. Instant PDA lookup returning `Valid`, `Revoked`, or `Not Found`.

### 🟡 Phase 2 — Controlled Issuer Registry
**Objective:** Prevent unauthorized issuance by introducing structured trust.
- **Additions:** On-chain issuer registry account, admin-controlled approval, and program-level checks allowing *only* approved wallets to issue credentials.

### � Phase 3 — Credential Metadata Layer (Off-Chain)
**Objective:** Link readable credential metadata without storing PII on-chain.
- **Additions:** Integrate decentralized storage (e.g., IPFS) for structured JSON data (degree title, institution, date). The on-chain hash references the off-chain metadata pointer.

### � Phase 4 — Access Control & Role Separation
**Objective:** Institutional-grade authority and role management.
- **Additions:** Separate roles (Platform Admin, Institution Admin, Issuer, Verifier), multi-sig institutional accounts, and delegated issuance rights.

### 🟠 Phase 5 — Production Hardening
**Objective:** Prepare the system for Mainnet deployment and real-world scale.
- **Additions:** Smart contract audits, account/rent/compute optimizations, RPC caching, and detailed monitoring/logging.

### � Phase 6 — Verifiable Credential Standards
**Objective:** Ecosystem interoperability.
- **Additions:** W3C Verifiable Credential formatting, strictly structured JSON schemas, and standard signature compatibility for cross-platform verification.

### 🔵 Phase 7 — Privacy & Selective Disclosure
**Objective:** Prove attributes without revealing full details.
- **Additions:** Off-chain cryptographic proofs, Zero-Knowledge (ZK) experiments, and selective field disclosure (e.g., proving degree completion without revealing GPA).

### � Phase 8 — Ecosystem Integrations
**Objective:** Embed into real-world HR and academic workflows.
- **Additions:** Applicant Tracking System (ATS) plugins, University ERP connectors, and public REST API endpoints for automated third-party verification.

---

## 🧭 Strategic Evolution Summary

| Phase | Focus | System Nature |
| :--- | :--- | :--- |
| **Phase 1** | Hash Registry | Technical Proof |
| **Phase 2** | Issuer Governance | Trust Layer |
| **Phase 3** | Metadata Linking | Usability Layer |
| **Phase 4** | Role Separation | Institutional Layer |
| **Phase 5** | Hardening | Production Layer |
| **Phase 6** | Standards | Interoperability |
| **Phase 7** | Privacy | Advanced Security |
| **Phase 8** | Integrations | Ecosystem Infrastructure |

---

## 🧪 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Rust & Cargo
- Solana CLI
- Anchor CLI

### 2. Deploy Smart Contract (Devnet)
```bash
# Set cluster to Devnet
solana config set --url devnet

# Generate a new local keypair (if needed)
solana-keygen new

# Airdrop devnet SOL for deployment
solana airdrop 2

# Build and deploy
cd programs/credential_registry
anchor build
anchor deploy
```

### 3. Run Frontend
```bash
npm install
npm run dev
```

Navigate to `http://localhost:3000` to interact with the application.
