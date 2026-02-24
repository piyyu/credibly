"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor"
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

import { HashDisplay } from "@/components/ui/HashDisplay"
import { hashFile, hashHex } from "@/lib/hash"
import {
  PROGRAM_IDL,
  deriveCredentialPDA,
  CREDENTIAL_TYPES,
  type CredentialTypeValue,
} from "@/lib/program"
import { useToast } from "@/components/ui/Toast"
import { saveMetadata, type CredentialMetadata } from "@/lib/metadata"
import Link from "next/link"

type TxStage = "idle" | "hashing" | "submitting" | "confirming" | "finalized" | "error"
type IssueMode = "single" | "batch"

interface BatchItem {
  id: string
  file: File
  status: "pending" | "hashing" | "submitting" | "confirming" | "done" | "error"
  hash?: string
  signature?: string
  error?: string
}

let batchIdCounter = 0

export default function IssuePage() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  const [mode, setMode] = useState<IssueMode>("single")

  // Single mode
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{ signature: string; hash: string } | null>(null)
  const [txStage, setTxStage] = useState<TxStage>("idle")

  // Batch mode
  const [batchFiles, setBatchFiles] = useState<BatchItem[]>([])
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchDone, setBatchDone] = useState(false)

  // Shared fields
  const [recipientInput, setRecipientInput] = useState("")
  const [credentialType, setCredentialType] = useState<CredentialTypeValue>(0)
  const [solBalance, setSolBalance] = useState<number | null>(null)

  // Off-chain metadata
  const [studentName, setStudentName] = useState("")
  const [institution, setInstitution] = useState("")
  const [credentialTitle, setCredentialTitle] = useState("")

  useEffect(() => {
    if (!publicKey || !connected) { setSolBalance(null); return }
    let cancelled = false
    connection.getBalance(publicKey).then((lamports) => {
      if (!cancelled) setSolBalance(lamports / LAMPORTS_PER_SOL)
    })
    return () => { cancelled = true }
  }, [publicKey, connected, connection])

  const lowBalance = solBalance !== null && solBalance < 0.01

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    if (mode === "batch") {
      addBatchFiles(files)
    } else {
      setFile(files[0])
      setError(null)
    }
  }

  const addBatchFiles = (fileList: FileList) => {
    const items: BatchItem[] = Array.from(fileList).map((f) => ({
      id: `batch-${++batchIdCounter}`,
      file: f,
      status: "pending" as const,
    }))
    setBatchFiles((prev) => [...prev, ...items])
  }

  const removeBatchFile = (id: string) => {
    setBatchFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const updateBatchItem = useCallback(
    (id: string, updates: Partial<BatchItem>) => {
      setBatchFiles((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
    },
    []
  )

  const buildProgram = () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null
    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions },
      { commitment: "confirmed" }
    )
    setProvider(provider)
    return new Program(PROGRAM_IDL, provider)
  }

  const parseRecipient = (): PublicKey | null => {
    const trimmed = recipientInput.trim()
    if (!trimmed) return publicKey!
    try { return new PublicKey(trimmed) }
    catch { return null }
  }

  // ── Single issue ──
  const handleIssueSingle = async () => {
    if (!file || !publicKey || !signTransaction || !signAllTransactions) return

    const recipientPubkey = parseRecipient()
    if (!recipientPubkey) { setError("Invalid recipient wallet address."); return }

    setTxStage("hashing")
    setError(null)

    try {
      const hashBuffer = await hashFile(file)
      const hex = await hashHex(file)
      setTxStage("submitting")

      const program = buildProgram()!
      const credentialPDA = deriveCredentialPDA(hashBuffer)

      const tx = await (program.methods as any)
        .issueCredential(Array.from(hashBuffer), recipientPubkey, credentialType)
        .accounts({ credential: credentialPDA, issuer: publicKey })
        .rpc()

      setTxStage("confirming")
      try { await connection.confirmTransaction(tx, "finalized"); setTxStage("finalized") }
      catch { /* timeout ok */ }

      connection.getBalance(publicKey).then((l) => setSolBalance(l / LAMPORTS_PER_SOL))

      // Save off-chain metadata
      if (studentName.trim() || institution.trim() || credentialTitle.trim()) {
        const meta: CredentialMetadata = {
          studentName: studentName.trim(),
          institution: institution.trim(),
          title: credentialTitle.trim(),
          createdAt: Date.now(),
        }
        saveMetadata(hex, meta)
      }

      setSuccessData({ signature: tx, hash: hex })
      toast("Credential anchored successfully!", "success")
    } catch (err: any) {
      console.error("Issue credential error:", err)
      setTxStage("error")
      if (err?.message?.includes("already in use")) {
        setError("This document has already been anchored on-chain.")
      } else if (err?.message?.includes("Insufficient")) {
        setError("Insufficient SOL balance. You need SOL for transaction fees.")
      } else {
        setError(err?.message || "Transaction failed. Please try again.")
      }
    }
  }

  // ── Batch issue ──
  const handleIssueBatch = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) return
    if (batchFiles.length === 0) return

    const recipientPubkey = parseRecipient()
    if (!recipientPubkey) { toast("Invalid recipient wallet address.", "error"); return }

    const program = buildProgram()
    if (!program) return

    setBatchProcessing(true)

    for (const item of batchFiles) {
      if (item.status === "done") continue

      updateBatchItem(item.id, { status: "hashing" })
      try {
        const hashBuffer = await hashFile(item.file)
        const hex = await hashHex(item.file)
        updateBatchItem(item.id, { status: "submitting", hash: hex })

        const credentialPDA = deriveCredentialPDA(hashBuffer)
        const tx = await (program.methods as any)
          .issueCredential(Array.from(hashBuffer), recipientPubkey, credentialType)
          .accounts({ credential: credentialPDA, issuer: publicKey })
          .rpc()

        updateBatchItem(item.id, { status: "confirming", signature: tx })
        try { await connection.confirmTransaction(tx, "confirmed") }
        catch { /* timeout ok */ }

        // Save per-file metadata
        if (institution.trim() || studentName.trim()) {
          const meta: CredentialMetadata = {
            studentName: studentName.trim(),
            institution: institution.trim(),
            title: item.file.name.replace(/\.[^/.]+$/, ""),
            createdAt: Date.now(),
          }
          saveMetadata(hex, meta)
        }

        updateBatchItem(item.id, { status: "done" })
      } catch (err: any) {
        console.error(`Batch error (${item.file.name}):`, err)
        const msg = err?.message?.includes("already in use")
          ? "Already anchored"
          : err?.message?.slice(0, 80) || "Failed"
        updateBatchItem(item.id, { status: "error", error: msg })
      }
    }

    connection.getBalance(publicKey).then((l) => setSolBalance(l / LAMPORTS_PER_SOL))
    setBatchProcessing(false)
    setBatchDone(true)
    toast("Batch issuance complete!", "success")
  }

  const resetState = () => {
    setFile(null); setSuccessData(null); setError(null)
    setRecipientInput(""); setCredentialType(0); setTxStage("idle")
    setStudentName(""); setInstitution(""); setCredentialTitle("")
    setBatchFiles([]); setBatchProcessing(false); setBatchDone(false)
  }

  const isProcessing = txStage !== "idle" && txStage !== "error"

  const txStageLabel: Record<TxStage, string> = {
    idle: "Anchor Credential to Solana",
    hashing: "Hashing document...",
    submitting: "Submitting transaction...",
    confirming: "Confirming on-chain...",
    finalized: "Finalized ✓",
    error: "Transaction failed",
  }

  const batchDoneCount = batchFiles.filter((f) => f.status === "done").length
  const batchErrorCount = batchFiles.filter((f) => f.status === "error").length

  return (
    <div className="inner-page">
      <div className="inner-page-container">
        <div>
          <span className="label">Issuance</span>
          <h1 className="page-title">Anchor Station</h1>
          <p className="page-subtitle">
            Upload academic records to anchor their cryptographic hash to the Solana devnet.
          </p>
        </div>

        {connected && solBalance !== null && (
          <div className={`balance-indicator ${lowBalance ? "low" : ""}`}>
            <span className="balance-dot" />
            <span>{solBalance.toFixed(4)} SOL</span>
            {lowBalance && <span className="balance-warn">⚠ Low balance — you need SOL for tx fees</span>}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-toggle-btn ${mode === "single" ? "active" : ""}`}
            onClick={() => { setMode("single"); setBatchFiles([]); setBatchDone(false) }}
          >
            Single
          </button>
          <button
            className={`mode-toggle-btn ${mode === "batch" ? "active" : ""}`}
            onClick={() => { setMode("batch"); setFile(null); setSuccessData(null); setTxStage("idle") }}
          >
            Batch
          </button>
        </div>

        {/* ═══ SINGLE MODE ═══ */}
        {mode === "single" && (
          <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {!successData ? (
              <>
                <div
                  className={`upload-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" onChange={(e) => { if (e.target.files) { setFile(e.target.files[0]); setError(null) } }} />
                  <div className={`upload-icon ${file ? "active" : ""}`}>{file ? "✓" : "↑"}</div>
                  <span className="upload-filename">{file ? file.name : "Drag and drop document"}</span>
                  <span className="upload-hint">{file ? `${(file.size / 1024).toFixed(2)} KB` : "or click to select file"}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Credential Type</label>
                  <div className="credential-type-selector">
                    {CREDENTIAL_TYPES.map((t) => (
                      <button key={t.value} className={`type-chip ${credentialType === t.value ? "active" : ""}`} onClick={() => setCredentialType(t.value as CredentialTypeValue)} type="button">{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Recipient Wallet Address
                    <span className="form-hint">Leave blank to assign to yourself</span>
                  </label>
                  <input type="text" className="input-field" placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} spellCheck={false} />
                </div>

                {/* Off-chain Metadata */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                  <span className="form-label" style={{ marginBottom: "1rem", display: "block" }}>
                    Off-Chain Metadata
                    <span className="form-hint">Optional — stored locally &amp; pinnable to IPFS</span>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.65rem" }}>Student / Recipient Name</label>
                      <input type="text" className="input-field" placeholder="e.g. John Doe" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.65rem" }}>Institution</label>
                      <input type="text" className="input-field" placeholder="e.g. Massachusetts Institute of Technology" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.65rem" }}>Credential Title</label>
                      <input type="text" className="input-field" placeholder="e.g. Bachelor of Computer Science" value={credentialTitle} onChange={(e) => setCredentialTitle(e.target.value)} />
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="tx-progress">
                    <div className="tx-progress-bar">
                      <div className="tx-progress-fill" style={{ width: txStage === "hashing" ? "25%" : txStage === "submitting" ? "50%" : txStage === "confirming" ? "80%" : "100%" }} />
                    </div>
                    <span className="tx-progress-label">{txStageLabel[txStage]}</span>
                  </div>
                )}

                <button
                  className="btn-pill"
                  style={{ width: "100%", opacity: !file || !connected || isProcessing || lowBalance ? 0.4 : 1 }}
                  disabled={!file || !connected || isProcessing || lowBalance}
                  onClick={handleIssueSingle}
                >
                  {isProcessing ? txStageLabel[txStage] : !connected ? "Connect Wallet to Issue" : lowBalance ? "Insufficient SOL Balance" : "Anchor Credential to Solana"}
                </button>

                {error && <p style={{ fontSize: "0.8rem", textAlign: "center", color: "#ff6b6b", fontFamily: "monospace" }}>{error}</p>}
                <p style={{ fontSize: "0.7rem", textAlign: "center", color: "#666", fontFamily: "monospace" }}>
                  This action will require signing a transaction. A small amount of SOL is needed for network fees.
                </p>
              </>
            ) : (
              <div className="result-card">
                <div className="result-icon success">✓</div>
                <h3 className="result-title">Credential Anchored</h3>
                <p className="result-desc">The document hash has been permanently written to the Solana devnet blockchain.</p>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <HashDisplay label="Transaction Signature" hash={successData.signature} />
                  <HashDisplay label="Document SHA-256 Hash" hash={successData.hash} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%" }}>
                  <Link href={`/credential/${successData.hash}`} className="btn-pill" style={{ width: "100%", textAlign: "center" }}>View Credential Details</Link>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <a href={`https://explorer.solana.com/tx/${successData.signature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="btn-pill" style={{ flex: 1, textAlign: "center" }}>Explorer ↗</a>
                    <button className="btn-pill" style={{ flex: 1 }} onClick={resetState}>Issue Another</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ BATCH MODE ═══ */}
        {mode === "batch" && (
          <div className="card-panel" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {!batchDone ? (
              <>
                <div
                  className={`upload-zone ${isDragging ? "dragging" : ""} ${batchFiles.length > 0 ? "has-file" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input type="file" multiple onChange={(e) => { if (e.target.files) addBatchFiles(e.target.files) }} />
                  <div className={`upload-icon ${batchFiles.length > 0 ? "active" : ""}`}>
                    {batchFiles.length > 0 ? batchFiles.length : "↑"}
                  </div>
                  <span className="upload-filename">
                    {batchFiles.length > 0 ? `${batchFiles.length} file${batchFiles.length > 1 ? "s" : ""} selected` : "Drag and drop multiple documents"}
                  </span>
                  <span className="upload-hint">
                    {batchFiles.length > 0 ? "Drop more to add to queue" : "or click to select files"}
                  </span>
                </div>

                {batchFiles.length > 0 && (
                  <div className="batch-queue">
                    <div className="batch-queue-header">
                      <span>File Queue ({batchFiles.length})</span>
                      {!batchProcessing && (
                        <button className="link-small" onClick={() => setBatchFiles([])} style={{ fontSize: "0.65rem" }}>Clear All</button>
                      )}
                    </div>
                    {batchFiles.map((item) => (
                      <div key={item.id} className="batch-queue-item">
                        <div className="batch-queue-icon">
                          {item.status === "pending" && "⏳"}
                          {item.status === "hashing" && "⚙"}
                          {item.status === "submitting" && "→"}
                          {item.status === "confirming" && "◎"}
                          {item.status === "done" && "✓"}
                          {item.status === "error" && "✕"}
                        </div>
                        <div className="batch-queue-details">
                          <span className="batch-queue-name">{item.file.name}</span>
                          <span className="batch-queue-meta">
                            {item.status === "pending" && `${(item.file.size / 1024).toFixed(1)} KB`}
                            {item.status === "hashing" && "Hashing..."}
                            {item.status === "submitting" && "Submitting tx..."}
                            {item.status === "confirming" && "Confirming..."}
                            {item.status === "done" && <span style={{ color: "#14F195" }}>Anchored — {item.hash?.slice(0, 8)}...{item.hash?.slice(-8)}</span>}
                            {item.status === "error" && <span style={{ color: "#ff6b6b" }}>{item.error}</span>}
                          </span>
                        </div>
                        {item.status === "pending" && !batchProcessing && (
                          <button className="batch-queue-remove" onClick={() => removeBatchFile(item.id)} title="Remove">✕</button>
                        )}
                        {item.status === "done" && item.hash && (
                          <Link href={`/credential/${item.hash}`} className="link-small" style={{ fontSize: "0.6rem" }}>View</Link>
                        )}
                      </div>
                    ))}
                    {batchProcessing && (
                      <div className="tx-progress" style={{ padding: "0.75rem 1rem" }}>
                        <div className="tx-progress-bar">
                          <div className="tx-progress-fill" style={{ width: `${((batchDoneCount + batchErrorCount) / batchFiles.length) * 100}%` }} />
                        </div>
                        <span className="tx-progress-label">{batchDoneCount + batchErrorCount} / {batchFiles.length} processed</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Credential Type</label>
                  <div className="credential-type-selector">
                    {CREDENTIAL_TYPES.map((t) => (
                      <button key={t.value} className={`type-chip ${credentialType === t.value ? "active" : ""}`} onClick={() => setCredentialType(t.value as CredentialTypeValue)} type="button">{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Recipient Wallet Address
                    <span className="form-hint">Leave blank to assign to yourself</span>
                  </label>
                  <input type="text" className="input-field" placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" value={recipientInput} onChange={(e) => setRecipientInput(e.target.value)} spellCheck={false} />
                </div>

                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                  <span className="form-label" style={{ marginBottom: "1rem", display: "block" }}>
                    Shared Metadata
                    <span className="form-hint">Applied to all files in this batch</span>
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.65rem" }}>Student / Recipient Name</label>
                      <input type="text" className="input-field" placeholder="e.g. John Doe" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: "0.65rem" }}>Institution</label>
                      <input type="text" className="input-field" placeholder="e.g. Massachusetts Institute of Technology" value={institution} onChange={(e) => setInstitution(e.target.value)} />
                    </div>
                  </div>
                </div>

                <button
                  className="btn-pill"
                  style={{ width: "100%", opacity: batchFiles.length === 0 || !connected || batchProcessing || lowBalance ? 0.4 : 1 }}
                  disabled={batchFiles.length === 0 || !connected || batchProcessing || lowBalance}
                  onClick={handleIssueBatch}
                >
                  {batchProcessing
                    ? `Processing ${batchDoneCount + batchErrorCount}/${batchFiles.length}...`
                    : !connected ? "Connect Wallet to Issue"
                    : lowBalance ? "Insufficient SOL Balance"
                    : `Anchor ${batchFiles.length} Credential${batchFiles.length !== 1 ? "s" : ""} to Solana`}
                </button>
              </>
            ) : (
              <div className="result-card">
                <div className="result-icon success">✓</div>
                <h3 className="result-title">Batch Complete</h3>
                <p className="result-desc">
                  {batchDoneCount} credential{batchDoneCount !== 1 ? "s" : ""} anchored{batchErrorCount > 0 ? `, ${batchErrorCount} failed` : ""}.
                </p>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {batchFiles.map((item) => (
                    <div key={item.id} className="batch-summary-row">
                      <span style={{ color: item.status === "done" ? "#14F195" : "#ff6b6b" }}>{item.status === "done" ? "✓" : "✕"}</span>
                      <span style={{ flex: 1, fontSize: "0.8rem" }}>{item.file.name}</span>
                      {item.status === "done" && item.hash && <Link href={`/credential/${item.hash}`} className="link-small" style={{ fontSize: "0.6rem" }}>View</Link>}
                      {item.status === "error" && <span style={{ fontSize: "0.7rem", color: "#ff6b6b" }}>{item.error}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                  <Link href="/dashboard" className="btn-pill" style={{ flex: 1, textAlign: "center" }}>Dashboard</Link>
                  <button className="btn-pill" style={{ flex: 1 }} onClick={resetState}>Issue More</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
