import Link from "next/link";
import DitherCanvas from "./components/DitherCanvas";

export default function LandingPage() {
  return (
    <>
      {/* ── Header ── */}
      <header className="site-header">
        <Link href="/" className="logo">
          <span className="logo-icon">C</span>
          Credibly
        </Link>
        <nav className="nav-center">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#technology" className="nav-link">Technology</a>
          <a href="#about" className="nav-link">About</a>
        </nav>
        <nav className="nav-group">
          <Link href="/dashboard" className="btn-pill">
            Dashboard ↗
          </Link>
          <Link href="/issue" className="btn-primary">
            Get Started ↗
          </Link>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <DitherCanvas />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Solana Devnet · Live
          </div>
          <h1 className="hero-title">
            Tamper-Proof Credential
            <br />
            Verification at Your
            <br />
            Fingertips
          </h1>
          <p className="hero-sub">
            Simplify academic credential issuance, verification, and management
            with one powerful blockchain-anchored platform.
          </p>
          <div className="hero-cta-group">
            <Link href="/issue" className="btn-primary">
              Get Started Now ↗
            </Link>
            <Link href="/verify" className="btn-pill">
              Verify Credential
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="dashboard-preview">
            <div className="preview-header">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
            </div>
            <div className="preview-body">
              {/* Sidebar */}
              <div className="preview-sidebar">
                <div className="preview-sidebar-item active">
                  <span>◉</span> Dashboard
                </div>
                <div className="preview-sidebar-item">
                  <span>◎</span> Issue
                </div>
                <div className="preview-sidebar-item">
                  <span>◎</span> Verify
                </div>
                <div className="preview-sidebar-item">
                  <span>◎</span> My Credentials
                </div>
                <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                  <div className="preview-sidebar-item">
                    <span>⚙</span> Settings
                  </div>
                </div>
              </div>
              {/* Main Area */}
              <div className="preview-main">
                <div className="preview-stats-row">
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">Credentials</div>
                    <div className="preview-stat-value">
                      1,456
                      <span className="preview-stat-badge">+12%</span>
                    </div>
                  </div>
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">Verified</div>
                    <div className="preview-stat-value">
                      652
                      <span className="preview-stat-badge">+8%</span>
                    </div>
                  </div>
                  <div className="preview-stat-card">
                    <div className="preview-stat-label">Institutions</div>
                    <div className="preview-stat-value">
                      89
                      <span className="preview-stat-badge">+5%</span>
                    </div>
                  </div>
                </div>
                <div className="preview-table">
                  <div className="preview-table-header">
                    <span>Credential</span>
                    <span>Type</span>
                    <span>Issued</span>
                    <span>Status</span>
                  </div>
                  <div className="preview-table-row">
                    <span>Bachelor of CS</span>
                    <span>Diploma</span>
                    <span>Jan 15, 2026</span>
                    <span className="preview-active-badge">● Active</span>
                  </div>
                  <div className="preview-table-row">
                    <span>Data Science Certificate</span>
                    <span>Certificate</span>
                    <span>Dec 8, 2025</span>
                    <span className="preview-active-badge">● Active</span>
                  </div>
                  <div className="preview-table-row">
                    <span>Graduate Transcript</span>
                    <span>Transcript</span>
                    <span>Nov 20, 2025</span>
                    <span className="preview-active-badge">● Active</span>
                  </div>
                  <div className="preview-table-row">
                    <span>Spring 2025 Grades</span>
                    <span>Transcript</span>
                    <span>Oct 5, 2025</span>
                    <span className="preview-revoked-badge">● Revoked</span>
                  </div>
                  <div className="preview-table-row">
                    <span>AWS Cloud Practitioner</span>
                    <span>License</span>
                    <span>Sep 18, 2025</span>
                    <span className="preview-active-badge">● Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brands / Powered By – Marquee ── */}
      <section className="brands-section">
        <p className="brands-label">Powered By</p>
        <div className="brands-marquee-wrap">
          <div className="brands-marquee">
            <span className="brand-item">Solana</span>
            <span className="brand-item">Anchor</span>
            <span className="brand-item">SHA-256</span>
            <span className="brand-item">Next.js</span>
            <span className="brand-item">Phantom</span>
            <span className="brand-item">Rust</span>
            <span className="brand-item">Web3.js</span>
            <span className="brand-item">TypeScript</span>
            {/* duplicate for seamless loop */}
            <span className="brand-item">Solana</span>
            <span className="brand-item">Anchor</span>
            <span className="brand-item">SHA-256</span>
            <span className="brand-item">Next.js</span>
            <span className="brand-item">Phantom</span>
            <span className="brand-item">Rust</span>
            <span className="brand-item">Web3.js</span>
            <span className="brand-item">TypeScript</span>
          </div>
        </div>
      </section>

      {/* ── Feature Strip ── */}
      <section id="features" className="feature-strip border-top">
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
              <div className="stat-item">
                <span className="label">Instant Verification</span>
                <p className="stat-desc">
                  Verify any credential in seconds. Upload a document or paste a hash
                  to check blockchain authenticity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Big Text / Philosophy ── */}
      <section id="about" className="big-text-section border-top">
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
              <Link href="/verify" className="link-small" style={{ marginTop: "1rem" }}>
                Verify a Credential →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process / How It Works ── */}
      <section id="how-it-works" className="process-section border-top">
        <div className="container">
          <div style={{ marginBottom: "4rem" }}>
            <span className="label">Protocol</span>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700 }}>
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
            View Dashboard →
          </Link>
        </div>
      </section>

      {/* ── Technology Numbers ── */}
      <section id="technology" className="tech-section border-top">
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
            <Link href="/issue" className="btn-primary">
              Issue Credentials ↗
            </Link>
            <Link href="/verify" className="btn-pill">
              Verify Document
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="container">
          <div className="grid-12">
            <div className="footer-col" style={{ gridColumn: "span 6" }}>
              <h3 style={{ marginBottom: "1rem", fontWeight: 700, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="logo-icon" style={{ width: 24, height: 24, fontSize: "0.7rem", borderRadius: 6 }}>C</span>
                Credibly
              </h3>
              <p style={{ color: "var(--text-dim)", maxWidth: 340, lineHeight: 1.6, fontSize: "0.9rem" }}>
                On-chain academic credential verification built on Solana.
                Powered by Anchor &amp; SHA-256 cryptographic hashing.
              </p>
            </div>
            <div className="footer-col">
              <div className="footer-header">Platform</div>
              <Link href="/issue" className="footer-link">Issue</Link>
              <Link href="/verify" className="footer-link">Verify</Link>
              <Link href="/dashboard" className="footer-link">Dashboard</Link>
              <Link href="/my-credentials" className="footer-link">My Credentials</Link>
            </div>
            <div className="footer-col">
              <div className="footer-header">Technology</div>
              <span className="footer-link">Solana</span>
              <span className="footer-link">Anchor Framework</span>
              <span className="footer-link">SHA-256</span>
              <span className="footer-link">Next.js</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Credibly. Solana Devnet.</span>
            <span>Tamper-Proof Credentials</span>
          </div>
        </div>
      </footer>
    </>
  );
}
