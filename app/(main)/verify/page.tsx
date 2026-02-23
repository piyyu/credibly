"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Html5QrcodeScanner } from "html5-qrcode";
import { PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program";
import { hexToUint8Array } from "@/lib/hash";

export default function VerifyPage() {
  const { connection } = useConnection();
  const [hashInput, setHashInput] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "valid" | "revoked" | "not_found" | "error">("idle");
  const [scanActive, setScanActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (scanActive) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render((decodedText) => {
        scanner?.clear();
        setScanActive(false);
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.hash) {
            setHashInput(parsed.hash);
            verifyHash(parsed.hash);
          }
        } catch {
          setHashInput(decodedText);
          verifyHash(decodedText);
        }
      }, () => { });
    }

    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [scanActive]);

  const verifyHash = async (hashHex: string) => {
    if (!hashHex) return;
    setStatus("verifying");
    setErrorMsg("");

    try {
      const hashBuffer = hexToUint8Array(hashHex);
      let pda: any;

      try {
        pda = deriveCredentialPDA(hashBuffer);
      } catch (err: any) {
        throw new Error(err.message || "Invalid hash format");
      }

      const provider = new AnchorProvider(
        connection,
        { publicKey: pda, signTransaction: async () => { throw new Error("Read only") }, signAllTransactions: async () => { throw new Error("Read only") } } as any,
        AnchorProvider.defaultOptions()
      );
      const program = new Program(PROGRAM_IDL, provider);

      try {
        const account = await (program.account as any).credential.fetch(pda);
        if (account.revoked) {
          setStatus("revoked");
        } else {
          setStatus("valid");
        }
      } catch (err: any) {
        if (err.message.includes("Account does not exist") || err.message.includes("AccountInfo not found")) {
          setStatus("not_found");
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid hash format or network error.");
      setStatus("error");
    }
  };

  return (
    <>
      <main className="main-grid">
        <div className="card" style={{ maxWidth: '600px' }}>
          <div className="stats-header" style={{ marginBottom: "24px" }}>
            <div>
              <div className="stat-title">Verify Hash</div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: "500" }}>Check Solana Devnet for cryptographic proof of credential existence.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "12px" }}>
            {scanActive ? (
              <div style={{ borderRadius: "var(--radius-m)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                <div id="reader"></div>
                <button onClick={() => setScanActive(false)} style={{ width: "100%", padding: "12px", background: "#f0f0f0", border: "none", cursor: "pointer", fontWeight: "600" }}>
                  Cancel Scanner
                </button>
              </div>
            ) : (
              <button onClick={() => setScanActive(true)} style={{ width: "100%", padding: "40px", border: "2px dashed var(--border-light)", borderRadius: "var(--radius-m)", cursor: "pointer", background: "#FAFAFA", fontSize: "16px", fontWeight: "600", color: "var(--text-secondary)" }}>
                📷 Scan QR Code
              </button>
            )}

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }}></div>
              <span style={{ padding: "0 16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "700" }}>OR</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border-light)" }}></div>
            </div>

            <div>
              <label className="input-label">Paste Credential Hash (Hex)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Paste 64-character SHA-256 hash here..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value.trim())}
              />
            </div>

            <button
              onClick={() => verifyHash(hashInput)}
              disabled={!hashInput || status === "verifying"}
              className="verify-btn"
              style={{ marginTop: "0", background: "var(--text-primary)", color: "white" }}
            >
              {status === "verifying" ? "Lookup Onchain..." : "Verify Credential"}
            </button>

            {errorMsg && (
              <div style={{ padding: "16px", background: "#FFEBEB", color: "#D32F2F", borderRadius: "var(--radius-s)", fontSize: "14px", fontWeight: "500" }}>
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className="detail-panel border border-[#333]">
        <div className="detail-header">
          <div>
            <div className="detail-label">Status Overview</div>

            {status === "idle" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--text-inverse-secondary)", borderRadius: "50%" }}></span>
                <span style={{ fontWeight: 700, color: "var(--text-inverse-secondary)" }}>Awaiting Query</span>
              </div>
            )}
            {status === "verifying" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "#F39C12", borderRadius: "50%" }}></span>
                <span style={{ fontWeight: 700, color: "#F39C12" }}>Checking Network...</span>
              </div>
            )}
            {status === "valid" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--bg-accent-lime)", borderRadius: "50%", boxShadow: "0 0 8px var(--bg-accent-lime)" }}></span>
                <span style={{ fontWeight: 700, color: "var(--bg-accent-lime)" }}>Cryptographically Verified</span>
              </div>
            )}
            {status === "revoked" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "#E74C3C", borderRadius: "50%", boxShadow: "0 0 8px #E74C3C" }}></span>
                <span style={{ fontWeight: 700, color: "#E74C3C" }}>Credential Revoked</span>
              </div>
            )}
            {status === "not_found" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "#E74C3C", borderRadius: "50%", boxShadow: "0 0 8px #E74C3C" }}></span>
                <span style={{ fontWeight: 700, color: "#E74C3C" }}>Not Found on Solana</span>
              </div>
            )}
            {status === "error" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "#E74C3C", borderRadius: "50%" }}></span>
                <span style={{ fontWeight: 700, color: "#E74C3C" }}>Error</span>
              </div>
            )}
          </div>
        </div>

        {(status === "valid" || status === "revoked") && (
          <div style={{ marginTop: "20px" }}>
            <div className="detail-label">Solana Identity</div>
            <div className="hash-display" style={{ marginTop: "8px" }}>
              {hashInput}
            </div>
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-box">
            <h5>Network</h5>
            <span>Devnet</span>
          </div>
          <div className="detail-box">
            <h5>Result</h5>
            <span style={{ fontSize: "15px" }}>
              {status === "idle" && "Pending"}
              {status === "verifying" && "Checking"}
              {status === "valid" && "Valid PDA"}
              {status === "revoked" && "Revoked PDA"}
              {status === "not_found" && "Empty PDA"}
              {status === "error" && "Error"}
            </span>
          </div>
        </div>

      </aside>
    </>
  );
}
