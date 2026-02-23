"use client"

import { useState } from "react"
import { useConnection } from "@solana/wallet-adapter-react"

import { HashDisplay } from "@/components/ui/HashDisplay"
import { hashHex, hexToUint8Array } from "@/lib/hash"
import { deriveCredentialPDA } from "@/lib/program"
import { useToast } from "@/components/ui/Toast"
import Link from "next/link"

type VerifyStatus = "idle" | "verifying" | "valid" | "revoked" | "not_found"

interface CredentialResult {
  issuer: string
  hash: string
  revoked: boolean
}

export default function VerifyPage() {
  const { connection } = useConnection()
  const { toast } = useToast()
  const [hash, setHash] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<VerifyStatus>("idle")
  const [credential, setCredential] = useState<CredentialResult | null>(null)
  const [verifiedHash, setVerifiedHash] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"hash" | "file">("hash")

  const lookupCredential = async (hexHash: string) => {
    setStatus("verifying")
    setError(null)
    setCredential(null)

    try {
      const hashBuffer = hexToUint8Array(hexHash)
      const credentialPDA = deriveCredentialPDA(hashBuffer)

      const accountInfo = await connection.getAccountInfo(credentialPDA)

      if (!accountInfo) {
        setStatus("not_found")
        setVerifiedHash(hexHash)
        return
      }

      const data = accountInfo.data
      const issuerBytes = data.slice(8, 40)
      const { PublicKey } = await import("@solana/web3.js")
      const issuer = new PublicKey(issuerBytes).toBase58()
      const revoked = data[72] === 1

      setCredential({ issuer, hash: hexHash, revoked })
      setVerifiedHash(hexHash)
      setStatus(revoked ? "revoked" : "valid")
    } catch (err: any) {
      console.error("Verification error:", err)
      setError(err?.message || "Verification failed.")
      setStatus("idle")
    }
  }

  const handleVerifyByHash = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = hash.trim()
    if (!trimmed) return
    if (trimmed.length !== 64 || !/^[0-9a-fA-F]+$/.test(trimmed)) {
      setError("Please enter a valid 64-character hex SHA-256 hash.")
      return
    }
    lookupCredential(trimmed)
  }

  const handleVerifyByFile = async () => {
    if (!file) return
    setStatus("verifying")
    setError(null)
    try {
      const hex = await hashHex(file)
      setHash(hex)
      await lookupCredential(hex)
    } catch (err: any) {
      console.error("File hash error:", err)
      setError("Failed to hash file.")
      setStatus("idle")
    }
  }

  const resetAll = () => {
    setStatus("idle")
    setHash("")
    setFile(null)
    setCredential(null)
    setError(null)
    setMode("hash")
  }

  const renderResult = () => {
    switch (status) {
      case "valid":
        return (
          <div className="result-card">
            <div className="result-icon success">✓</div>
            <h3 className="result-title">Verified on Solana</h3>
            <p className="result-desc">
              This credential hash exists on the blockchain and has not been revoked.
            </p>
            <HashDisplay label="Verified Hash" hash={verifiedHash} />
            {credential && <HashDisplay label="Issuer" hash={credential.issuer} />}
          </div>
        )
      case "revoked":
        return (
          <div className="result-card">
            <div className="result-icon error">✕</div>
            <h3 className="result-title">Credential Revoked</h3>
            <p className="result-desc">
              The issuer has actively invalidated this document hash on-chain.
            </p>
            <HashDisplay label="Revoked Hash" hash={verifiedHash} />
            {credential && <HashDisplay label="Issuer" hash={credential.issuer} />}
          </div>
        )
      case "not_found":
        return (
          <div className="result-card">
            <div className="result-icon neutral">?</div>
            <h3 className="result-title">No Record Found</h3>
            <p className="result-desc">
              We could not locate this hash on the Solana devnet.
            </p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="inner-page">
      <div className="inner-page-container" style={{ textAlign: "center" }}>
        {/* Title */}
        <div>
          <span className="label">Verification</span>
          <h1 className="page-title">Explorer</h1>
          <p className="page-subtitle" style={{ margin: "0 auto" }}>
            Check the cryptographic authenticity and revocation status of an anchored document.
          </p>
        </div>

        {/* Main card */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "2rem", textAlign: "left" }}>
          {status === "idle" || status === "verifying" ? (
            <>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <button
                  className="btn-pill"
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.5rem 1.2rem",
                    background: mode === "hash" ? "var(--text-main)" : "transparent",
                    color: mode === "hash" ? "var(--bg-color)" : "var(--text-main)",
                  }}
                  onClick={() => { setMode("hash"); setFile(null); setError(null) }}
                >
                  Paste Hash
                </button>
                <button
                  className="btn-pill"
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.5rem 1.2rem",
                    background: mode === "file" ? "var(--text-main)" : "transparent",
                    color: mode === "file" ? "var(--bg-color)" : "var(--text-main)",
                  }}
                  onClick={() => { setMode("file"); setHash(""); setError(null) }}
                >
                  Upload File
                </button>
              </div>

              {mode === "hash" ? (
                <form onSubmit={handleVerifyByHash} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <input
                    type="text"
                    placeholder="e.g. e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                    value={hash}
                    onChange={(e) => { setHash(e.target.value); setError(null) }}
                    className="input-field"
                    spellCheck={false}
                  />
                  <button
                    type="submit"
                    className="btn-pill"
                    style={{
                      width: "100%",
                      opacity: !hash.trim() || status === "verifying" ? 0.4 : 1,
                    }}
                    disabled={!hash.trim() || status === "verifying"}
                  >
                    {status === "verifying" ? "Querying Ledger..." : "Verify on Solana"}
                  </button>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className={`upload-zone ${file ? "has-file" : ""}`} style={{ cursor: "pointer" }}>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files) setFile(e.target.files[0])
                        setError(null)
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
                  <button
                    className="btn-pill"
                    style={{
                      width: "100%",
                      opacity: !file || status === "verifying" ? 0.4 : 1,
                    }}
                    disabled={!file || status === "verifying"}
                    onClick={handleVerifyByFile}
                  >
                    {status === "verifying" ? "Hashing & Querying..." : "Verify Document on Solana"}
                  </button>
                </div>
              )}

              {error && (
                <p style={{ fontSize: "0.8rem", textAlign: "center", color: "#ff6b6b", fontFamily: "monospace" }}>
                  {error}
                </p>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {renderResult()}
              {(status === "valid" || status === "revoked") && (
                <Link
                  href={`/credential/${verifiedHash}`}
                  className="btn-pill"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  View Full Credential Details
                </Link>
              )}
              <button className="btn-pill" style={{ width: "100%" }} onClick={resetAll}>
                Verify Another Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
