"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor"
import { PROGRAM_ID, PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program"
import { hexToUint8Array } from "@/lib/hash"
import { useToast } from "@/components/ui/Toast"

interface CredentialAccount {
  pubkey: string
  issuer: string
  hash: string
  revoked: boolean
}

export default function DashboardPage() {
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [credentials, setCredentials] = useState<CredentialAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null) // hash of credential being revoked
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all")

  const fetchCredentials = useCallback(async () => {
    if (!connected || !publicKey) return

    setLoading(true)
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: 80 },
          {
            memcmp: {
              offset: 8,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      })

      const decoded: CredentialAccount[] = accounts.map((acc) => {
        const data = acc.account.data
        const issuerBytes = data.slice(8, 40)
        const hashBytes = data.slice(40, 72)
        const revoked = data[72] === 1

        const issuer = new PublicKey(issuerBytes).toBase58()
        const hash = Array.from(hashBytes)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")

        return {
          pubkey: acc.pubkey.toBase58(),
          issuer,
          hash,
          revoked,
        }
      })

      setCredentials(decoded)
    } catch (err) {
      console.error("Error fetching credentials:", err)
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey, connection])

  useEffect(() => {
    fetchCredentials()
  }, [fetchCredentials])

  const handleRevoke = async (credHash: string) => {
    if (!publicKey || !signTransaction || !signAllTransactions) return

    setRevoking(credHash)
    try {
      const hashBuffer = hexToUint8Array(credHash)
      const credentialPDA = deriveCredentialPDA(hashBuffer)

      const provider = new AnchorProvider(
        connection,
        { publicKey, signTransaction, signAllTransactions },
        { commitment: "confirmed" }
      )
      setProvider(provider)

      const program = new Program(PROGRAM_IDL, provider)

      await (program.methods as any)
        .revokeCredential(Array.from(hashBuffer))
        .accounts({
          credential: credentialPDA,
          issuer: publicKey,
        })
        .rpc()

      toast("Credential revoked successfully", "success")
      await fetchCredentials() // refresh the list
    } catch (err: any) {
      console.error("Revoke error:", err)
      toast(err?.message || "Failed to revoke credential", "error")
    } finally {
      setRevoking(null)
    }
  }

  const filtered = credentials.filter((c) => {
    if (filter === "active") return !c.revoked
    if (filter === "revoked") return c.revoked
    return true
  })

  const activeCount = credentials.filter((c) => !c.revoked).length
  const revokedCount = credentials.filter((c) => c.revoked).length

  return (
    <>
      {/* Top Stats Row */}
      <div className="dash-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-title">Your Credentials</span>
            <span className="dash-stat-pill">
              {connected ? `✓ ${activeCount} active` : "—"}
            </span>
          </div>
          <div className="dash-stat-value">
            {connected ? credentials.length : "—"}
          </div>
          <div className="dash-stat-sub">
            {connected
              ? loading
                ? "Loading from Solana devnet..."
                : `${activeCount} active · ${revokedCount} revoked`
              : "Connect wallet to view your credentials"}
          </div>
        </div>

        <Link href="/issue" className="dash-cta-card">
          <div>
            <h2>Issue New Credentials</h2>
            <p>Upload documents and anchor them permanently on Solana.</p>
          </div>
          <div className="dash-cta-action">
            <span>Start Process</span>
            <span>→</span>
          </div>
        </Link>
      </div>

      {/* Credential List */}
      <div className="dash-list">
        <div className="dash-list-header">
          <h3>
            {connected ? "Your Issued Credentials" : "Recent Credentials"}
          </h3>
          <div className="dash-filter-group">
            <button
              className={`dash-filter-pill ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`dash-filter-pill ${filter === "active" ? "active" : ""}`}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={`dash-filter-pill ${filter === "revoked" ? "active" : ""}`}
              onClick={() => setFilter("revoked")}
            >
              Revoked
            </button>
          </div>
        </div>

        {!connected ? (
          <div className="dash-list-item">
            <div className="dash-list-icon">🔗</div>
            <div className="dash-list-details">
              <h4>Connect your wallet</h4>
              <p>Connect a Solana wallet to see credentials you&apos;ve issued</p>
            </div>
          </div>
        ) : loading ? (
          <div className="dash-list-item">
            <div className="dash-list-icon">⏳</div>
            <div className="dash-list-details">
              <h4>Loading credentials...</h4>
              <p>Querying Solana devnet</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="dash-list-item">
            <div className="dash-list-icon">📭</div>
            <div className="dash-list-details">
              <h4>No credentials found</h4>
              <p>
                {filter !== "all"
                  ? `No ${filter} credentials. Try changing the filter.`
                  : "You haven't issued any credentials yet. Start by issuing one!"}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((cred) => (
            <div key={cred.pubkey} className="dash-list-item">
              <div className="dash-list-icon">
                {cred.revoked ? "✕" : "📄"}
              </div>
              <Link href={`/credential/${cred.hash}`} className="dash-list-details" style={{ textDecoration: "none", color: "inherit" }}>
                <h4 style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {cred.hash.slice(0, 16)}...{cred.hash.slice(-16)}
                </h4>
                <p>PDA: {cred.pubkey.slice(0, 8)}...{cred.pubkey.slice(-8)}</p>
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  className={`dash-list-badge ${cred.revoked ? "pending" : "onchain"}`}
                >
                  {cred.revoked ? "✕ Revoked" : "⚡ Active"}
                </span>
                {!cred.revoked && (
                  <button
                    className="dash-revoke-btn"
                    onClick={() => handleRevoke(cred.hash)}
                    disabled={revoking === cred.hash}
                    title="Revoke this credential"
                  >
                    {revoking === cred.hash ? "..." : "Revoke"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Side Info Panel */}
      <div className="dash-side">
        <div className="dash-side-item">
          <span className="dash-side-label">Status</span>
          <span className="dash-side-value">
            <span
              className="status-dot active"
              style={{ marginRight: "8px" }}
            />
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="dash-side-item">
          <span className="dash-side-label">Total Issued</span>
          <span className="dash-side-value large">
            {connected ? credentials.length : "—"}
          </span>
        </div>

        <div className="dash-side-item full">
          <span className="dash-side-label">Registry Program</span>
          <div className="dash-side-hash">
            {PROGRAM_ID.toBase58()}
            <br />
            <span style={{ opacity: 0.5 }}>Network: Solana Devnet</span>
          </div>
        </div>

        <div className="dash-box">
          <h5>Active</h5>
          <span>{connected ? activeCount : "—"}</span>
        </div>

        <div className="dash-box">
          <h5>Revoked</h5>
          <span>{connected ? revokedCount : "—"}</span>
        </div>
      </div>
    </>
  )
}
