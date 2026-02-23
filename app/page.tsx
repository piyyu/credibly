import Link from "next/link";
import DitherCanvas from "./components/DitherCanvas";

export default function LandingPage() {
  return (
    <>
      {/* ── Header ── */}
      <header className="site-header">
        <Link href="/" className="logo">
          Credibly©
        </Link>
        <nav className="nav-group">
          <Link href="/verify" className="btn-pill">
            Verify
          </Link>
          <Link href="/issue" className="btn-pill">
            Issue
          </Link>
          <Link href="/dashboard" className="btn-pill">
            Dashboard
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <DitherCanvas />
        <div className="container">
          <div className="hero-content">
            <span className="label">Solana Devnet</span>
            <h1 className="hero-title">
              TAMPER
              <br />
              PROOF
            </h1>
            <p className="hero-sub">
              Blockchain-anchored academic credentials. Cryptographic integrity
              for every certificate, diploma, and transcript — verified
              instantly on Solana.
            </p>
            <Link href="/issue" className="link-small">
              ISSUE CREDENTIAL ⊕
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <section className="feature-strip border-top">
        <div className="container">
          <div className="grid-12">
            <div className="stat-grid">
              <div className="stat-item">
                <span className="label">Hashing</span>
                <p className="stat-desc">
                  SHA-256 document fingerprinting ensures every credential is
                  uniquely and permanently identifiable.
                </p>
              </div>
              <div className="stat-item">
                <span className="label">On-Chain</span>
                <p className="stat-desc">
                  Credential hashes stored via Solana PDA accounts with Anchor
                  framework — immutable by design.
                </p>
              </div>
              <div className="stat-item" style={{ textAlign: "right" }}>
                <span className="label">Status</span>
                <p className="stat-desc">Network: Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Big Text / Philosophy ── */}
      <section className="big-text-section border-top">
        <div className="container">
          <div className="grid-12">
            <div style={{ gridColumn: "span 3" }}>
              <span className="label">Why Credibly</span>
            </div>
            <div className="big-copy">
              Eliminating the{" "}
              <span className="highlight">trust deficit</span> in academic
              verification. We replace fragile paper trails with{" "}
              <span className="highlight">cryptographic proof</span> — turning
              every credential into an{" "}
              <span className="highlight">immutable on-chain record</span> that
              anyone can verify in seconds.
              <br />
              <br />
              <Link
                href="/verify"
                className="link-small"
                style={{ marginTop: "1rem" }}
              >
                VERIFY A CREDENTIAL ⊕
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process / How It Works ── */}
      <section className="process-section border-top">
        <div className="container">
          <div style={{ marginBottom: "4rem" }}>
            <span className="label">Protocol</span>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 400 }}>
              How It Works
            </h2>
          </div>
          <div className="grid-12">
            <div className="process-grid">
              <div className="process-card">
                <div className="process-number">Step 01</div>
                <h3 className="process-title">Issue</h3>
                <p className="process-desc">
                  Upload an academic document. Credibly computes a SHA-256 hash
                  of the file and prepares an on-chain transaction signed by the
                  issuer&apos;s wallet.
                </p>
              </div>
              <div className="process-card">
                <div className="process-number">Step 02</div>
                <h3 className="process-title">Anchor</h3>
                <p className="process-desc">
                  The credential hash is stored in a Solana Program Derived
                  Address (PDA) via the Anchor framework — creating a
                  permanent, tamper-proof record on the blockchain.
                </p>
              </div>
              <div className="process-card">
                <div className="process-number">Step 03</div>
                <h3 className="process-title">Verify</h3>
                <p className="process-desc">
                  Anyone can upload the same document or paste its hash.
                  Credibly checks the blockchain to confirm authenticity,
                  issuer identity, and revocation status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visual / Interactive Section ── */}
      <section className="visual-section">
        <Link href="/issue" className="circle-trigger">
          Start
          <br />
          Issuing
        </Link>
        <div style={{ position: "absolute", bottom: "2rem", left: "2rem" }}>
          <span className="label">Credential Registry</span>
        </div>
        <div style={{ position: "absolute", bottom: "2rem", right: "2rem" }}>
          <Link href="/dashboard" className="link-small">
            VIEW DASHBOARD ⊕
          </Link>
        </div>
      </section>

      {/* ── Technology Numbers ── */}
      <section className="tech-section border-top">
        <div className="container">
          <div style={{ marginBottom: "4rem" }}>
            <span className="label">Infrastructure</span>
          </div>
          <div className="grid-12">
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-value">256</div>
                <div className="tech-label">Bit SHA Hashing</div>
              </div>
              <div className="tech-item">
                <div className="tech-value">400ms</div>
                <div className="tech-label">Solana Block Time</div>
              </div>
              <div className="tech-item">
                <div className="tech-value">PDA</div>
                <div className="tech-label">Program Derived Accounts</div>
              </div>
              <div className="tech-item">
                <div className="tech-value">∞</div>
                <div className="tech-label">On-Chain Permanence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="cta-section border-top">
        <div className="container">
          <span className="label">Get Started</span>
          <h2 className="cta-title">
            Build Trust
            <br />
            On-Chain
          </h2>
          <p className="cta-sub">
            Issue tamper-proof academic credentials. Verify instantly against
            the Solana blockchain. No intermediaries.
          </p>
          <div className="cta-buttons">
            <Link href="/issue" className="btn-pill">
              Issue Credentials
            </Link>
            <Link href="/verify" className="btn-pill">
              Verify Document
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer border-top">
        <div className="container">
          <div className="grid-12">
            <div className="footer-col" style={{ gridColumn: "span 6" }}>
              <h3 style={{ marginBottom: "1rem" }}>Credibly©</h3>
              <p style={{ color: "#666", maxWidth: 300 }}>
                On-chain academic credential verification built on Solana.
                Powered by Anchor &amp; SHA-256 cryptographic hashing.
              </p>
            </div>
            <div className="footer-col">
              <div className="footer-header">Platform</div>
              <Link href="/issue" className="footer-link">
                Issue
              </Link>
              <Link href="/verify" className="footer-link">
                Verify
              </Link>
              <Link href="/dashboard" className="footer-link">
                Dashboard
              </Link>
            </div>
            <div className="footer-col">
              <div className="footer-header">Technology</div>
              <span className="footer-link">Solana</span>
              <span className="footer-link">Anchor Framework</span>
              <span className="footer-link">SHA-256</span>
            </div>
          </div>
          <div className="border-top footer-bottom">
            <span>©2025 CREDIBLY. SOLANA DEVNET.</span>
            <span>TAMPER-PROOF CREDENTIALS</span>
          </div>
        </div>
      </footer>
    </>
  );
}
