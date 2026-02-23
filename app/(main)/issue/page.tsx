"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { QRCodeSVG } from "qrcode.react";
import { hashFile, hashHex } from "@/lib/hash";
import { PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program";

export default function IssuePage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "hashing" | "signing" | "confirming" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txSig, setTxSig] = useState("");
  const [hashResult, setHashResult] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setTxSig("");
      setHashResult("");
      setErrorMsg("");
    }
  };

  const handleIssue = async () => {
    if (!file) return;
    if (!wallet.publicKey || !wallet.signTransaction) {
      setErrorMsg("Wallet not connected");
      return;
    }

    try {
      setStatus("hashing");
      const hashBuffer = await hashFile(file);
      const hex = await hashHex(file);
      setHashResult(hex);

      setStatus("signing");
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        AnchorProvider.defaultOptions()
      );
      const program = new Program(PROGRAM_IDL, provider);

      const pda = deriveCredentialPDA(hashBuffer);

      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        throw new Error("Credential hash already registered.");
      }

      const hashArray = Array.from(hashBuffer);

      const tx = await program.methods
        .issueCredential(hashArray)
        .accountsPartial({
          credential: pda,
          issuer: wallet.publicKey,
        })
        .rpc();

      setStatus("confirming");
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      setTxSig(tx);
      setStatus("success");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred");
      setStatus("error");
    }
  };

  return (
    <>
      <main className="main-grid">
        <div className="card" style={{ maxWidth: '600px' }}>
          <div className="stats-header" style={{ marginBottom: "24px" }}>
            <div>
              <div className="stat-title">Issue New Credential</div>
              <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: "500" }}>Upload a document to anchor its hash on Solana without revealing PII.</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "12px" }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ alignSelf: 'flex-start', marginBottom: "16px" }}>
                <label className="input-label">1. Connect Issuer Wallet</label>
                <WalletMultiButton style={{ borderRadius: "var(--radius-pill)", backgroundColor: "var(--text-primary)" }} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                <label className="input-label">2. Upload PDF Credential</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{
                    border: "2px dashed var(--border-light)",
                    padding: "32px",
                    borderRadius: "var(--radius-m)",
                    cursor: "pointer",
                    background: "#FAFAFA",
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-main)"
                  }}
                />
              </div>

              <button
                onClick={handleIssue}
                disabled={!file || !wallet.publicKey || ["hashing", "signing", "confirming"].includes(status)}
                className="verify-btn"
                style={{ marginTop: "8px" }}
              >
                {status === "idle" && "Issue Credential"}
                {status === "hashing" && "Hashing Document..."}
                {status === "signing" && "Awaiting Wallet Signature..."}
                {status === "confirming" && "Confirming on Solana..."}
                {status === "success" && "Credential Issued!"}
                {status === "error" && "Try Again"}
              </button>

              {errorMsg && (
                <div style={{ padding: "16px", background: "#FFEBEB", color: "#D32F2F", borderRadius: "var(--radius-s)", fontSize: "14px", marginTop: "16px", fontWeight: "500" }}>
                  {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <aside className="detail-panel border border-[#333]">
        <div className="detail-header">
          <div>
            <div className="detail-label">Status</div>
            {status === 'success' ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--bg-accent-lime)", borderRadius: "50%", boxShadow: "0 0 8px var(--bg-accent-lime)" }}></span>
                <span style={{ fontWeight: 700 }}>Anchored</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "8px", height: "8px", background: "var(--text-inverse-secondary)", borderRadius: "50%" }}></span>
                <span style={{ fontWeight: 700, color: "var(--text-inverse-secondary)" }}>Awaiting Input</span>
              </div>
            )}
          </div>
        </div>

        {status === "success" && txSig && (
          <>
            <div style={{ marginTop: "20px" }}>
              <div className="detail-label">Generated Hash (SHA-256)</div>
              <div className="hash-display" style={{ marginTop: "8px" }}>
                {hashResult}
              </div>
            </div>

            <div>
              <div className="detail-label">Solana Block Explorer</div>
              <div className="hash-display">
                <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ color: "var(--text-inverse)" }}>
                  View Transaction ↗
                </a>
              </div>
            </div>

            <div style={{ marginTop: "auto", background: "#FFFFFF", padding: "20px", borderRadius: "var(--radius-m)", display: "flex", justifyContent: "center" }}>
              <QRCodeSVG
                value={JSON.stringify({ hash: hashResult, network: "devnet" })}
                size={180}
              />
            </div>
          </>
        )}
      </aside>
    </>
  );
}
