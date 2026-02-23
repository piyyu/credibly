"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useConnection } from "@solana/wallet-adapter-react"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

import { HashDisplay } from "@/components/ui/HashDisplay"
import { hexToUint8Array } from "@/lib/hash"
import { deriveCredentialPDA } from "@/lib/program"

interface CredentialData {
  issuer: string
  hash: string
  revoked: boolean
  pda: string
}

export default function CredentialDetailPage() {
  const params = useParams()
  const hash = params.hash as string
  const { connection } = useConnection()
  const [credential, setCredential] = useState<CredentialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function lookup() {
      if (!hash || hash.length !== 64) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const hashBuffer = hexToUint8Array(hash)
        const credentialPDA = deriveCredentialPDA(hashBuffer)

        const accountInfo = await connection.getAccountInfo(credentialPDA)

        if (!accountInfo) {
          setNotFound(true)
          setLoading(false)
          return
        }

        const data = accountInfo.data
        const issuerBytes = data.slice(8, 40)
        const { PublicKey } = await import("@solana/web3.js")
        const issuer = new PublicKey(issuerBytes).toBase58()
        const revoked = data[72] === 1

        setCredential({
          issuer,
          hash,
          revoked,
          pda: credentialPDA.toBase58(),
        })
      } catch (err) {
        console.error("Lookup error:", err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    lookup()
  }, [hash, connection])

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/credential/${hash}`
    : ""

  if (loading) {
    return (
      <div className="inner-page">
        <div className="inner-page-container" style={{ textAlign: "center" }}>
          <div className="result-icon neutral" style={{ margin: "0 auto" }}>⏳</div>
          <h1 className="page-title" style={{ marginTop: "2rem" }}>Loading...</h1>
          <p className="page-subtitle" style={{ margin: "0 auto" }}>
            Fetching credential from Solana devnet
          </p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="inner-page">
        <div className="inner-page-container" style={{ textAlign: "center" }}>
          <div className="result-icon neutral" style={{ margin: "0 auto" }}>?</div>
          <h1 className="page-title" style={{ marginTop: "2rem" }}>Not Found</h1>
          <p className="page-subtitle" style={{ margin: "0 auto" }}>
            No credential with this hash was found on-chain.
          </p>
          <Link href="/verify" className="btn-pill" style={{ marginTop: "2rem" }}>
            Go to Verify
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="inner-page">
      <div className="inner-page-container">
        {/* Status banner */}
        <div className="credential-status-banner" data-status={credential?.revoked ? "revoked" : "valid"}>
          <span className="credential-status-icon">
            {credential?.revoked ? "✕" : "✓"}
          </span>
          <span className="credential-status-text">
            {credential?.revoked ? "This credential has been revoked" : "Credential verified on Solana"}
          </span>
        </div>

        {/* Title */}
        <div>
          <span className="label">Credential Detail</span>
          <h1 className="page-title">On-Chain Record</h1>
        </div>

        {/* Info card */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <HashDisplay label="Document SHA-256 Hash" hash={credential?.hash || ""} />
          <HashDisplay label="Issuer Public Key" hash={credential?.issuer || ""} />
          <HashDisplay label="PDA Account" hash={credential?.pda || ""} />

          <div className="hash-block">
            <span className="hash-label">Status</span>
            <div style={{
              padding: "1rem",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}>
              <span className={`status-dot ${credential?.revoked ? "error" : "success"}`} />
              <span style={{ fontSize: "0.9rem" }}>
                {credential?.revoked ? "Revoked" : "Active & Verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Share section with QR */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <span className="label" style={{ textAlign: "center" }}>Share & Verify</span>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", maxWidth: 400 }}>
            Share this QR code or link for anyone to independently verify this credential on-chain.
          </p>

          <div style={{
            background: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            display: "inline-flex",
          }}>
            <QRCodeSVG
              value={shareUrl}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </div>

          <HashDisplay label="Shareable Link" hash={shareUrl} />

          <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
            <Link
              href={`/verify`}
              className="btn-pill"
              style={{ flex: 1, textAlign: "center" }}
            >
              Verify Another
            </Link>
            <Link
              href="/dashboard"
              className="btn-pill"
              style={{ flex: 1, textAlign: "center" }}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
