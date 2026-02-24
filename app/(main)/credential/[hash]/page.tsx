"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useConnection } from "@solana/wallet-adapter-react"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

import { HashDisplay } from "@/components/ui/HashDisplay"
import { hexToUint8Array } from "@/lib/hash"
import { deriveCredentialPDA, decodeCredentialAccount, credentialTypeLabel } from "@/lib/program"
import {
  getMetadata,
  saveMetadata,
  pinToIPFS,
  getPinataJwt,
  setPinataJwt,
  buildMetadataJSON,
  type CredentialMetadata,
} from "@/lib/metadata"
import { generateCertificatePDF, type CertificateData } from "@/lib/pdf"
import { useToast } from "@/components/ui/Toast"

interface CredentialData {
  issuer: string
  recipient: string
  hash: string
  issuedAt: number
  credentialType: number
  revoked: boolean
  pda: string
}

export default function CredentialDetailPage() {
  const params = useParams()
  const hash = params.hash as string
  const { connection } = useConnection()
  const { toast } = useToast()

  const [credential, setCredential] = useState<CredentialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Metadata
  const [metadata, setMetadata] = useState<CredentialMetadata | null>(null)
  const [editingMeta, setEditingMeta] = useState(false)
  const [metaStudentName, setMetaStudentName] = useState("")
  const [metaInstitution, setMetaInstitution] = useState("")
  const [metaTitle, setMetaTitle] = useState("")

  // IPFS
  const [pinning, setPinning] = useState(false)
  const [showIpfsConfig, setShowIpfsConfig] = useState(false)
  const [pinataJwt, setPinataJwtLocal] = useState("")
  const [showMetadataJson, setShowMetadataJson] = useState(false)

  // PDF
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // ── Fetch credential ──
  useEffect(() => {
    async function lookup() {
      if (!hash || hash.length !== 64) { setNotFound(true); setLoading(false); return }

      try {
        const hashBuffer = hexToUint8Array(hash)
        const credentialPDA = deriveCredentialPDA(hashBuffer)
        const accountInfo = await connection.getAccountInfo(credentialPDA)

        if (!accountInfo) { setNotFound(true); setLoading(false); return }

        const decoded = decodeCredentialAccount(accountInfo.data)
        setCredential({
          issuer: decoded.issuer,
          recipient: decoded.recipient,
          hash,
          issuedAt: decoded.issuedAt,
          credentialType: decoded.credentialType,
          revoked: decoded.revoked,
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

  // ── Load metadata ──
  useEffect(() => {
    if (!hash) return
    const meta = getMetadata(hash)
    if (meta) {
      setMetadata(meta)
      setMetaStudentName(meta.studentName)
      setMetaInstitution(meta.institution)
      setMetaTitle(meta.title)
    }
    const jwt = getPinataJwt()
    if (jwt) setPinataJwtLocal(jwt)
  }, [hash])

  // ── Save metadata ──
  const handleSaveMetadata = () => {
    const meta: CredentialMetadata = {
      studentName: metaStudentName.trim(),
      institution: metaInstitution.trim(),
      title: metaTitle.trim(),
      createdAt: metadata?.createdAt || Date.now(),
      ipfsCid: metadata?.ipfsCid,
    }
    saveMetadata(hash, meta)
    setMetadata(meta)
    setEditingMeta(false)
    toast("Metadata saved locally", "success")
  }

  // ── IPFS pin ──
  const handlePinToIpfs = async () => {
    if (!metadata) { toast("Save metadata first", "error"); return }

    if (pinataJwt.trim()) {
      setPinataJwt(pinataJwt.trim())
    }

    setPinning(true)
    try {
      const cid = await pinToIPFS(hash, { ...metadata })
      setMetadata((prev) => prev ? { ...prev, ipfsCid: cid } : prev)
      toast(`Pinned to IPFS: ${cid}`, "success")
      setShowIpfsConfig(false)
    } catch (err: any) {
      toast(err.message || "IPFS pin failed", "error")
    } finally {
      setPinning(false)
    }
  }

  // ── PDF ──
  const handleDownloadPDF = async () => {
    if (!credential) return
    setGeneratingPdf(true)
    try {
      const certData: CertificateData = {
        ...credential,
        metadata,
      }
      await generateCertificatePDF(certData)
      toast("Certificate PDF downloaded", "success")
    } catch (err: any) {
      console.error("PDF error:", err)
      toast("Failed to generate PDF", "error")
    } finally {
      setGeneratingPdf(false)
    }
  }

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/credential/${hash}`
    : ""

  // ── Loading / Not Found ──
  if (loading) {
    return (
      <div className="inner-page">
        <div className="inner-page-container" style={{ textAlign: "center" }}>
          <div className="result-icon neutral" style={{ margin: "0 auto" }}>⏳</div>
          <h1 className="page-title" style={{ marginTop: "2rem" }}>Loading...</h1>
          <p className="page-subtitle" style={{ margin: "0 auto" }}>Fetching credential from Solana devnet</p>
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
          <p className="page-subtitle" style={{ margin: "0 auto" }}>No credential with this hash was found on-chain.</p>
          <Link href="/verify" className="btn-pill" style={{ marginTop: "2rem" }}>Go to Verify</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="inner-page">
      <div className="inner-page-container">
        {/* Status banner */}
        <div className="credential-status-banner" data-status={credential?.revoked ? "revoked" : "valid"}>
          <span className="credential-status-icon">{credential?.revoked ? "✕" : "✓"}</span>
          <span className="credential-status-text">
            {credential?.revoked ? "This credential has been revoked" : "Credential verified on Solana"}
          </span>
        </div>

        <div>
          <span className="label">Credential Detail</span>
          <h1 className="page-title">On-Chain Record</h1>
        </div>

        {/* ── On-chain data ── */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {credential && (
            <div className="credential-meta-row" style={{ justifyContent: "space-between" }}>
              <span className={`type-badge type-${credential.credentialType}`}>
                {credentialTypeLabel(credential.credentialType)}
              </span>
              <span className="meta-date">
                Issued {new Date(credential.issuedAt * 1000).toLocaleString()}
              </span>
            </div>
          )}

          <HashDisplay label="Document SHA-256 Hash" hash={credential?.hash || ""} />
          <HashDisplay label="Issuer Public Key" hash={credential?.issuer || ""} />
          <HashDisplay label="Recipient Public Key" hash={credential?.recipient || ""} />
          <HashDisplay label="PDA Account" hash={credential?.pda || ""} />

          <div className="hash-block">
            <span className="hash-label">Status</span>
            <div style={{ padding: "1rem", border: "1px solid var(--border-color)", borderRadius: "4px", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className={`status-dot ${credential?.revoked ? "error" : "success"}`} />
              <span style={{ fontSize: "0.9rem" }}>{credential?.revoked ? "Revoked" : "Active & Verified"}</span>
            </div>
          </div>
        </div>

        {/* ── Off-chain Metadata ── */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="label" style={{ margin: 0 }}>Off-Chain Metadata</span>
            <button className="link-small" onClick={() => setEditingMeta(!editingMeta)} style={{ fontSize: "0.65rem" }}>
              {editingMeta ? "Cancel" : metadata ? "Edit" : "Add Metadata"}
            </button>
          </div>

          {editingMeta ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Student / Recipient Name</label>
                <input type="text" className="input-field" placeholder="e.g. John Doe" value={metaStudentName} onChange={(e) => setMetaStudentName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Institution</label>
                <input type="text" className="input-field" placeholder="e.g. MIT" value={metaInstitution} onChange={(e) => setMetaInstitution(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: "0.65rem" }}>Credential Title</label>
                <input type="text" className="input-field" placeholder="e.g. Bachelor of Computer Science" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <button className="btn-pill" style={{ width: "100%" }} onClick={handleSaveMetadata}>Save Metadata</button>
            </div>
          ) : metadata && (metadata.studentName || metadata.institution || metadata.title) ? (
            <div className="metadata-display">
              {metadata.title && (
                <div className="metadata-field">
                  <span className="metadata-field-label">Title</span>
                  <span className="metadata-field-value">{metadata.title}</span>
                </div>
              )}
              {metadata.studentName && (
                <div className="metadata-field">
                  <span className="metadata-field-label">Student</span>
                  <span className="metadata-field-value">{metadata.studentName}</span>
                </div>
              )}
              {metadata.institution && (
                <div className="metadata-field">
                  <span className="metadata-field-label">Institution</span>
                  <span className="metadata-field-value">{metadata.institution}</span>
                </div>
              )}
              {metadata.ipfsCid && (
                <div className="metadata-field">
                  <span className="metadata-field-label">IPFS CID</span>
                  <span className="metadata-field-value" style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${metadata.ipfsCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#14F195", textDecoration: "none" }}
                    >
                      {metadata.ipfsCid} ↗
                    </a>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              No off-chain metadata stored. Click &quot;Add Metadata&quot; to attach student name, institution, and title.
            </p>
          )}

          {/* IPFS Pinning */}
          {metadata && (metadata.studentName || metadata.institution || metadata.title) && !metadata.ipfsCid && (
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              {!showIpfsConfig ? (
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button className="link-small" onClick={() => setShowIpfsConfig(true)} style={{ fontSize: "0.65rem" }}>
                    Pin to IPFS
                  </button>
                  <button className="link-small" onClick={() => setShowMetadataJson(!showMetadataJson)} style={{ fontSize: "0.65rem" }}>
                    {showMetadataJson ? "Hide JSON" : "View JSON"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="form-label" style={{ fontSize: "0.65rem" }}>
                    Pinata JWT
                    <span className="form-hint">Free at pinata.cloud — stored locally</span>
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="eyJhbGciOi..."
                    value={pinataJwt}
                    onChange={(e) => setPinataJwtLocal(e.target.value)}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn-pill" style={{ flex: 1, fontSize: "0.75rem" }} onClick={handlePinToIpfs} disabled={pinning}>
                      {pinning ? "Pinning..." : "Pin to IPFS"}
                    </button>
                    <button className="link-small" onClick={() => setShowIpfsConfig(false)} style={{ fontSize: "0.65rem" }}>Cancel</button>
                  </div>
                </div>
              )}
              {showMetadataJson && (
                <pre style={{
                  marginTop: "0.75rem",
                  padding: "1rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontFamily: "monospace",
                  color: "var(--text-muted)",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                }}>
                  {buildMetadataJSON(hash, metadata)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* ── Share & QR ── */}
        <div className="card-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
          <span className="label" style={{ textAlign: "center" }}>Share & Verify</span>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", textAlign: "center", maxWidth: 400 }}>
            Share this QR code or link for anyone to independently verify this credential on-chain.
          </p>

          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", display: "inline-flex" }}>
            <QRCodeSVG value={shareUrl} size={200} level="M" bgColor="#ffffff" fgColor="#111111" />
          </div>

          <HashDisplay label="Shareable Link" hash={shareUrl} />

          {/* ── Download Certificate PDF ── */}
          <button
            className="btn-pill"
            style={{ width: "100%", opacity: generatingPdf ? 0.5 : 1 }}
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
          >
            {generatingPdf ? "Generating PDF..." : "Download Certificate PDF"}
          </button>

          <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
            <Link href="/verify" className="btn-pill" style={{ flex: 1, textAlign: "center" }}>Verify Another</Link>
            <Link href="/dashboard" className="btn-pill" style={{ flex: 1, textAlign: "center" }}>Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
