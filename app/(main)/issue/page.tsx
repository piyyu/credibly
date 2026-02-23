"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor"

import { HashDisplay } from "@/components/ui/HashDisplay"
import { hashFile, hashHex } from "@/lib/hash"
import { PROGRAM_ID, PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program"
import { useToast } from "@/components/ui/Toast"
import Link from "next/link"

export default function IssuePage() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isIssuing, setIsIssuing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ signature: string; hash: string } | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleIssue = async () => {
    if (!file || !publicKey || !signTransaction || !signAllTransactions) return

    setIsIssuing(true)
    setError(null)

    try {
      const hashBuffer = await hashFile(file)
      const hex = await hashHex(file)

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" }
      )
      setProvider(provider)

      const program = new Program(PROGRAM_IDL, provider)
      const credentialPDA = deriveCredentialPDA(hashBuffer)

      const tx = await (program.methods as any)
        .issueCredential(Array.from(hashBuffer))
        .accounts({
          credential: credentialPDA,
          issuer: publicKey,
        })
        .rpc()

      setSuccessData({ signature: tx, hash: hex })
      toast("Credential anchored successfully!", "success")
    } catch (err: any) {
      console.error("Issue credential error:", err)
      if (err?.message?.includes("already in use")) {
        setError("This document has already been anchored on-chain.")
      } else {
        setError(err?.message || "Transaction failed. Please try again.")
      }
    } finally {
      setIsIssuing(false)
    }
  }

  const resetState = () => {
    setFile(null)
    setSuccessData(null)
    setError(null)
  }

  return (
    <div className="inner-page">
      <div className="inner-page-container">
        {/* Title */}
        <div>
          <span className="label">Issuance</span>
          <h1 className="page-title">Anchor Station</h1>
          <p className="page-subtitle">
            Upload an academic record to anchor its cryptographic hash to the Solana devnet.
          </p>
        </div>

        {/* Main card */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {!successData ? (
            <>
              {/* Upload zone */}
              <div
                className={`upload-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFile(e.target.files[0])
                      setError(null)
                    }
                  }}
                />
                <div className={`upload-icon ${file ? "active" : ""}`}>
                  {file ? "✓" : "↑"}
                </div>
                <span className="upload-filename">
                  {file ? file.name : "Drag and drop document"}
                </span>
                <span className="upload-hint">
                  {file ? `${(file.size / 1024).toFixed(2)} KB` : "or click to select file"}
                </span>
              </div>

              {/* Action */}
              <button
                className="btn-pill"
                style={{ width: "100%", opacity: !file || !connected || isIssuing ? 0.4 : 1 }}
                disabled={!file || !connected || isIssuing}
                onClick={handleIssue}
              >
                {isIssuing
                  ? "Processing Transaction..."
                  : !connected
                    ? "Connect Wallet to Issue"
                    : "Anchor Credential to Solana"}
              </button>

              {error && (
                <p style={{ fontSize: "0.8rem", textAlign: "center", color: "#ff6b6b", fontFamily: "monospace" }}>
                  {error}
                </p>
              )}

              <p style={{ fontSize: "0.7rem", textAlign: "center", color: "#666", fontFamily: "monospace" }}>
                This action will require signing a transaction. A small amount of SOL is needed for network fees.
              </p>
            </>
          ) : (
            <div className="result-card">
              <div className="result-icon success">✓</div>
              <h3 className="result-title">Credential Anchored</h3>
              <p className="result-desc">
                The document hash has been permanently written to the Solana devnet blockchain.
              </p>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <HashDisplay label="Transaction Signature" hash={successData.signature} />
                <HashDisplay label="Document SHA-256 Hash" hash={successData.hash} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                <Link
                  href={`/credential/${successData.hash}`}
                  className="btn-pill"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  View Credential Details
                </Link>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <a
                    href={`https://explorer.solana.com/tx/${successData.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill"
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Explorer ↗
                  </a>
                  <button className="btn-pill" style={{ flex: 1 }} onClick={resetState}>
                    Issue Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
