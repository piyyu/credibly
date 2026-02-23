import Link from "next/link";

export default function Home() {
  return (
    <>
      <main className="main-grid">
        <div className="stats-row">
          <div className="card">
            <div className="stats-header">
              <div>
                <div className="stat-title">Issuance Rate</div>
                <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: "500" }}>Last 30 Days</div>
              </div>
              <div className="stat-pill">
                <span>✓</span> 98.5%
              </div>
            </div>
            <div className="chart-container">
              <div className="bar"><div className="bar-fill" style={{ height: "40%" }}></div></div>
              <div className="bar"><div className="bar-fill" style={{ height: "65%" }}></div></div>
              <div className="bar"><div className="bar-fill" style={{ height: "45%" }}></div></div>
              <div className="bar"><div className="bar-fill" style={{ height: "80%" }}></div></div>
              <div className="bar"><div className="bar-fill highlight" style={{ height: "60%" }}><div className="bar-label">Now</div></div></div>
              <div className="bar"><div className="bar-fill" style={{ height: "30%" }}></div></div>
              <div className="bar"><div className="bar-fill" style={{ height: "50%" }}></div></div>
            </div>
          </div>

          <Link href="/issue" className="card card-purple issue-card">
            <div>
              <h2>Issue New<br />Credentials</h2>
              <p style={{ opacity: 0.7, fontSize: "15px", fontWeight: "500" }}>Verify recipients and mint onchain.</p>
            </div>
            <button className="issue-action cursor-pointer text-left">
              Start Process
              <span>→</span>
            </button>
          </Link>
        </div>

        <div className="list-container">
          <div className="list-header">
            <h3>Recent Credentials</h3>
            <div className="filter-group">
              <button className="filter-pill active">All</button>
              <button className="filter-pill">Onchain</button>
              <button className="filter-pill">Pending</button>
            </div>
          </div>

          <div className="list-item">
            <div className="item-icon">🎓</div>
            <div className="item-details">
              <h4>Master of Computer Science</h4>
              <p>Recipient: Sarah Jenkins</p>
            </div>
            <div className="status-badge onchain">
              <span>⚡</span> Onchain
            </div>
            <div className="action-icon">⋯</div>
          </div>

          <div className="list-item">
            <div className="item-icon">📜</div>
            <div className="item-details">
              <h4>Data Science Certification</h4>
              <p>Recipient: Michael Chen</p>
            </div>
            <div className="status-badge onchain">
              <span>⚡</span> Onchain
            </div>
            <div className="action-icon">⋯</div>
          </div>

          <div className="list-item">
            <div className="item-icon">⚡</div>
            <div className="item-details">
              <h4>Bachelor of Arts</h4>
              <p>Recipient: Emma Wilson</p>
            </div>
            <div className="status-badge pending">
              <span>⌛</span> Minting...
            </div>
            <div className="action-icon">⋯</div>
          </div>

          <div className="list-item">
            <div className="item-icon">🎓</div>
            <div className="item-details">
              <h4>Blockchain Engineering</h4>
              <p>Recipient: David Ross</p>
            </div>
            <div className="status-badge onchain">
              <span>⚡</span> Onchain
            </div>
            <div className="action-icon">⋯</div>
          </div>
        </div>
      </main>

      <aside className="detail-panel border border-[#333]">
        <div className="detail-header">
          <div>
            <div className="detail-label">Status</div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", background: "var(--bg-accent-lime)", borderRadius: "50%", boxShadow: "0 0 8px var(--bg-accent-lime)" }}></span>
              <span style={{ fontWeight: 700 }}>Verified</span>
            </div>
          </div>
          <div className="action-icon" style={{ borderColor: "rgba(255,255,255,0.1)", color: "white", width: "40px", height: "40px" }}>✓</div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <div className="detail-label">Total Validated</div>
          <div className="detail-value-large">1,248</div>
          <div className="detail-label" style={{ marginTop: "12px", color: "var(--bg-accent-lime)", fontSize: "13px" }}>+12 this week</div>
        </div>

        <div>
          <div className="detail-label">Registry Identifier</div>
          <div className="hash-display">
            E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU<br />
            <span style={{ opacity: 0.6 }}>Network: Solana Devnet</span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-box">
            <h5>System</h5>
            <span>Active</span>
          </div>
          <div className="detail-box">
            <h5>Queue</h5>
            <span>0</span>
          </div>
        </div>

        <Link href="/verify" className="verify-btn">Verify Chain Data</Link>
      </aside>
    </>
  );
}
