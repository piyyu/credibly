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

  // ── Badge color map ──
  const typeBadgeClasses: Record<number, string> = {
    0: "bg-[rgba(20,241,149,0.15)] text-[#14F195] border-[rgba(20,241,149,0.25)]",
    1: "bg-[rgba(153,69,255,0.15)] text-[#9945FF] border-[rgba(153,69,255,0.25)]",
    2: "bg-[rgba(59,130,246,0.12)] text-blue-500 border-[rgba(59,130,246,0.25)]",
    3: "bg-[rgba(245,158,11,0.12)] text-amber-500 border-[rgba(245,158,11,0.25)]",
    4: "bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)] border-[var(--border-color)]",
  }

  // ── Loading / Not Found ──
  if (loading) {
    return (
      <div className="flex flex-col items-center py-8 pb-16">
        <div className="w-full max-w-[720px] flex flex-col gap-7 text-center">
          <div className="w-16 h-16 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-2xl text-[var(--text-muted)] mx-auto">⏳</div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold tracking-[-0.04em] mt-8">Loading...</h1>
          <p className="text-base text-[var(--text-muted)] max-w-[500px] leading-relaxed mx-auto">Fetching credential from Solana devnet</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center py-8 pb-16">
        <div className="w-full max-w-[720px] flex flex-col gap-7 text-center">
          <div className="w-16 h-16 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-2xl text-[var(--text-muted)] mx-auto">?</div>
          <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold tracking-[-0.04em] mt-8">Not Found</h1>
          <p className="text-base text-[var(--text-muted)] max-w-[500px] leading-relaxed mx-auto">No credential with this hash was found on-chain.</p>
          <Link href="/verify" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-sm font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] mt-8">Go to Verify</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 pb-16">
      <div className="w-full max-w-[720px] flex flex-col gap-7">
        {/* Status banner */}
        <div className={`flex items-center gap-3 py-3.5 px-5 border rounded-lg ${
          credential?.revoked
            ? "border-[rgba(239,68,68,0.25)] bg-[var(--error-bg)]"
            : "border-[rgba(20,241,149,0.25)] bg-[rgba(20,241,149,0.15)]"
        }`}>
          <span className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm shrink-0 ${
            credential?.revoked
              ? "border-[rgba(239,68,68,0.4)] text-[var(--error)] bg-[var(--error-bg)]"
              : "border-[rgba(20,241,149,0.4)] text-[#14F195] bg-[rgba(20,241,149,0.15)]"
          }`}>{credential?.revoked ? "✕" : "✓"}</span>
          <span className="text-sm font-medium">
            {credential?.revoked ? "This credential has been revoked" : "Credential verified on Solana"}
          </span>
        </div>

        <div>
          <span className="label">Credential Detail</span>
          <h1 className="text-[clamp(2rem,4vw,3rem)] leading-[1.1] font-bold tracking-[-0.04em] mb-2">On-Chain Record</h1>
        </div>

        {/* ── On-chain data ── */}
        <div className="border border-[var(--border-color)] rounded-lg p-8 bg-[var(--bg-card)] transition-colors duration-150 hover:border-[var(--border-hover)] flex flex-col gap-6">
          {credential && (
            <div className="flex items-center gap-4 flex-wrap justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[0.65rem] font-semibold tracking-wide font-mono border ${typeBadgeClasses[credential.credentialType] || typeBadgeClasses[4]}`}>
                {credentialTypeLabel(credential.credentialType)}
              </span>
              <span className="text-[0.7rem] text-[var(--text-muted)] font-mono">
                Issued {new Date(credential.issuedAt * 1000).toLocaleString()}
              </span>
            </div>
          )}

          <HashDisplay label="Document SHA-256 Hash" hash={credential?.hash || ""} />
          <HashDisplay label="Issuer Public Key" hash={credential?.issuer || ""} />
          <HashDisplay label="Recipient Public Key" hash={credential?.recipient || ""} />
          <HashDisplay label="PDA Account" hash={credential?.pda || ""} />

          <div className="w-full flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.08em] text-[var(--text-muted)] font-semibold font-mono">Status</span>
            <div className="p-4 border border-[var(--border-color)] rounded flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${credential?.revoked ? "bg-[var(--error)]" : "bg-[#14F195]"}`} />
              <span className="text-sm">{credential?.revoked ? "Revoked" : "Active & Verified"}</span>
            </div>
          </div>
        </div>

        {/* ── Off-chain Metadata ── */}
        <div className="border border-[var(--border-color)] rounded-lg p-8 bg-[var(--bg-card)] transition-colors duration-150 hover:border-[var(--border-hover)] flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <span className="label !m-0">Off-Chain Metadata</span>
            <button className="text-[0.65rem] font-medium text-[#14F195] hover:text-[var(--accent-hover)] transition-all duration-150 inline-flex items-center gap-1.5" onClick={() => setEditingMeta(!editingMeta)}>
              {editingMeta ? "Cancel" : metadata ? "Edit" : "Add Metadata"}
            </button>
          </div>

          {editingMeta ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-semibold text-[var(--text-primary)] flex items-center gap-3">Student / Recipient Name</label>
                <input type="text" className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text-primary)] transition-colors duration-150 outline-none placeholder:text-[var(--text-dim)] focus:border-[#14F195] focus:shadow-[0_0_0_2px_rgba(20,241,149,0.15)]" placeholder="e.g. John Doe" value={metaStudentName} onChange={(e) => setMetaStudentName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-semibold text-[var(--text-primary)] flex items-center gap-3">Institution</label>
                <input type="text" className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text-primary)] transition-colors duration-150 outline-none placeholder:text-[var(--text-dim)] focus:border-[#14F195] focus:shadow-[0_0_0_2px_rgba(20,241,149,0.15)]" placeholder="e.g. MIT" value={metaInstitution} onChange={(e) => setMetaInstitution(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.65rem] font-semibold text-[var(--text-primary)] flex items-center gap-3">Credential Title</label>
                <input type="text" className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text-primary)] transition-colors duration-150 outline-none placeholder:text-[var(--text-dim)] focus:border-[#14F195] focus:shadow-[0_0_0_2px_rgba(20,241,149,0.15)]" placeholder="e.g. Bachelor of Computer Science" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-sm font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]" onClick={handleSaveMetadata}>Save Metadata</button>
            </div>
          ) : metadata && (metadata.studentName || metadata.institution || metadata.title) ? (
            <div className="flex flex-col gap-2">
              {metadata.title && (
                <div className="flex flex-col gap-0.5 p-3 px-4 border border-[var(--border-color)] rounded-lg transition-colors duration-150 hover:border-[var(--border-hover)]">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] font-mono">Title</span>
                  <span className="text-[0.95rem] font-medium text-[var(--text-primary)]">{metadata.title}</span>
                </div>
              )}
              {metadata.studentName && (
                <div className="flex flex-col gap-0.5 p-3 px-4 border border-[var(--border-color)] rounded-lg transition-colors duration-150 hover:border-[var(--border-hover)]">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] font-mono">Student</span>
                  <span className="text-[0.95rem] font-medium text-[var(--text-primary)]">{metadata.studentName}</span>
                </div>
              )}
              {metadata.institution && (
                <div className="flex flex-col gap-0.5 p-3 px-4 border border-[var(--border-color)] rounded-lg transition-colors duration-150 hover:border-[var(--border-hover)]">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] font-mono">Institution</span>
                  <span className="text-[0.95rem] font-medium text-[var(--text-primary)]">{metadata.institution}</span>
                </div>
              )}
              {metadata.ipfsCid && (
                <div className="flex flex-col gap-0.5 p-3 px-4 border border-[var(--border-color)] rounded-lg transition-colors duration-150 hover:border-[var(--border-hover)]">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] font-mono">IPFS CID</span>
                  <span className="text-[0.95rem] font-medium text-[var(--text-primary)] font-mono text-xs">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${metadata.ipfsCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#14F195] no-underline"
                    >
                      {metadata.ipfsCid} ↗
                    </a>
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              No off-chain metadata stored. Click &quot;Add Metadata&quot; to attach student name, institution, and title.
            </p>
          )}

          {/* IPFS Pinning */}
          {metadata && (metadata.studentName || metadata.institution || metadata.title) && !metadata.ipfsCid && (
            <div className="border-t border-[var(--border-color)] pt-4">
              {!showIpfsConfig ? (
                <div className="flex gap-3">
                  <button className="text-[0.65rem] font-medium text-[#14F195] hover:text-[var(--accent-hover)] transition-all duration-150 inline-flex items-center gap-1.5" onClick={() => setShowIpfsConfig(true)}>
                    Pin to IPFS
                  </button>
                  <button className="text-[0.65rem] font-medium text-[#14F195] hover:text-[var(--accent-hover)] transition-all duration-150 inline-flex items-center gap-1.5" onClick={() => setShowMetadataJson(!showMetadataJson)}>
                    {showMetadataJson ? "Hide JSON" : "View JSON"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="text-[0.65rem] font-semibold text-[var(--text-primary)] flex items-center gap-3">
                    Pinata JWT
                    <span className="text-[0.7rem] font-normal text-[var(--text-muted)] normal-case tracking-normal">Free at pinata.cloud — stored locally</span>
                  </label>
                  <input
                    type="password"
                    className="w-full bg-transparent border border-[var(--border-color)] rounded-lg px-4 py-3 font-mono text-sm text-[var(--text-primary)] transition-colors duration-150 outline-none placeholder:text-[var(--text-dim)] focus:border-[#14F195] focus:shadow-[0_0_0_2px_rgba(20,241,149,0.15)]"
                    placeholder="eyJhbGciOi..."
                    value={pinataJwt}
                    onChange={(e) => setPinataJwtLocal(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-xs font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]" onClick={handlePinToIpfs} disabled={pinning}>
                      {pinning ? "Pinning..." : "Pin to IPFS"}
                    </button>
                    <button className="text-[0.65rem] font-medium text-[#14F195] hover:text-[var(--accent-hover)] transition-all duration-150 inline-flex items-center gap-1.5" onClick={() => setShowIpfsConfig(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {showMetadataJson && (
                <pre className="mt-3 p-4 border border-[var(--border-color)] rounded text-[0.7rem] font-mono text-[var(--text-muted)] overflow-auto whitespace-pre-wrap">
                  {buildMetadataJSON(hash, metadata)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* ── Share & QR ── */}
        <div className="border border-[var(--border-color)] rounded-lg p-8 bg-[var(--bg-card)] transition-colors duration-150 hover:border-[var(--border-hover)] flex flex-col items-center gap-8">
          <span className="label text-center">Share & Verify</span>
          <p className="text-sm text-[var(--text-muted)] text-center max-w-[400px]">
            Share this QR code or link for anyone to independently verify this credential on-chain.
          </p>

          <div className="bg-white p-6 rounded-lg inline-flex">
            <QRCodeSVG value={shareUrl} size={200} level="M" bgColor="#ffffff" fgColor="#111111" />
          </div>

          <HashDisplay label="Shareable Link" hash={shareUrl} />

          {/* ── Download Certificate PDF ── */}
          <button
            className={`w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-sm font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] ${generatingPdf ? "opacity-50" : ""}`}
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
          >
            {generatingPdf ? "Generating PDF..." : "Download Certificate PDF"}
          </button>

          <div className="flex gap-4 w-full">
            <Link href="/verify" className="flex-1 text-center inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-sm font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]">Verify Another</Link>
            <Link href="/dashboard" className="flex-1 text-center inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-[var(--border-color)] rounded-lg bg-transparent text-[var(--text-primary)] text-sm font-medium transition-all duration-150 hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
