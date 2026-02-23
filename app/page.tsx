import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-body)" }}>
      <header style={{ padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
        <div style={{ fontSize: "28px", display: "flex", alignItems: "center", gap: "12px", fontWeight: 700, color: "var(--text-primary)", textDecoration: "none", letterSpacing: "-0.03em" }}>
          <div style={{ width: "14px", height: "14px", background: "var(--bg-accent-lime)", borderRadius: "50%", border: "2px solid var(--bg-body)", boxShadow: "0 0 0 1px var(--text-primary)" }}></div>
          Credibly
        </div>
        <Link
          href="/dashboard"
          style={{
            background: "var(--text-primary)",
            color: "white",
            padding: "12px 32px",
            borderRadius: "var(--radius-pill)",
            fontWeight: "600",
            textDecoration: "none",
            transition: "transform 0.2s"
          }}
        >
          Go to App
        </Link>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", zIndex: 10 }}>
          <div style={{ background: "rgba(202, 242, 121, 0.2)", color: "#5ea300", padding: "8px 24px", borderRadius: "var(--radius-pill)", fontWeight: "700", fontSize: "14px", border: "1px solid rgba(202, 242, 121, 0.5)" }}>
            Powered by Solana Devnet
          </div>

          <h1 style={{ fontSize: "72px", fontWeight: "800", letterSpacing: "-0.04em", lineHeight: 1.1, color: "var(--text-primary)" }}>
            Trustless Issuance <br />
            <span style={{ color: "transparent", WebkitTextStroke: "2px var(--text-primary)" }}>At Internet Scale.</span>
          </h1>

          <p style={{ fontSize: "20px", color: "var(--text-secondary)", maxWidth: "600px", lineHeight: 1.5, fontWeight: "500" }}>
            The transparent and decentralized protocol for issuing, managing, and instantly verifying B2B records and documents on the blockchain.
          </p>

          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <Link
              href="/dashboard"
              className="verify-btn"
              style={{ padding: "20px 48px", fontSize: "18px", width: "auto", display: "inline-block", background: "var(--bg-accent-lime)", color: "var(--text-primary)", textDecoration: "none", borderRadius: "var(--radius-pill)", fontWeight: 700 }}
            >
              Launch Dashboard
            </Link>
          </div>
        </div>

        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100vw",
          height: "100vh",
          background: "radial-gradient(circle at center, var(--bg-accent-lime) 0%, rgba(202,242,121,0) 60%)",
          opacity: 0.15,
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0
        }}></div>
      </main>
    </div>
  );
}
