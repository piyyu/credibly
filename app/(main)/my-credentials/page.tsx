"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import {
  PROGRAM_ID,
  ACCOUNT_SIZE,
  OFFSET_RECIPIENT,
  decodeCredentialAccount,
  credentialTypeLabel,
} from "@/lib/program"
import { getAllMetadata, type CredentialMetadata } from "@/lib/metadata"

interface ReceivedCredential {
  pubkey: string
  issuer: string
  hash: string
  issuedAt: number
  credentialType: number
  revoked: boolean
}

export default function MyCredentialsPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [credentials, setCredentials] = useState<ReceivedCredential[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all")
  const [metaMap, setMetaMap] = useState<Record<string, CredentialMetadata>>({})

  const fetchReceivedCredentials = useCallback(async () => {
    if (!connected || !publicKey) return

    setLoading(true)
    try {
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: ACCOUNT_SIZE },
          {
            memcmp: {
              offset: OFFSET_RECIPIENT,
              bytes: publicKey.toBase58(),
            },
          },
        ],
      })

      const decoded: ReceivedCredential[] = accounts.map((acc) => {
        const cred = decodeCredentialAccount(acc.account.data)
        return {
          pubkey: acc.pubkey.toBase58(),
          issuer: cred.issuer,
          hash: cred.hash,
          issuedAt: cred.issuedAt,
          credentialType: cred.credentialType,
          revoked: cred.revoked,
        }
      })

      // Sort by issued_at descending (newest first)
      decoded.sort((a, b) => b.issuedAt - a.issuedAt)
      setCredentials(decoded)
      setMetaMap(getAllMetadata())
    } catch (err) {
      console.error("Error fetching received credentials:", err)
    } finally {
      setLoading(false)
    }
  }, [connected, publicKey, connection])

  useEffect(() => {
    fetchReceivedCredentials()
  }, [fetchReceivedCredentials])

  const filtered = credentials.filter((c) => {
    if (filter === "active") return !c.revoked
    if (filter === "revoked") return c.revoked
    return true
  })

  const activeCount = credentials.filter((c) => !c.revoked).length
  const revokedCount = credentials.filter((c) => c.revoked).length

  return (
    <>
      {/* Header */}
      <div className="dash-grid">
        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-title">Received Credentials</span>
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
              : "Connect wallet to view credentials issued to you"}
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-header">
            <span className="dash-stat-title">Your Wallet</span>
          </div>
          <div className="dash-stat-sub" style={{ fontFamily: "monospace", fontSize: "0.75rem", wordBreak: "break-all", marginTop: "0.5rem" }}>
            {connected ? publicKey?.toBase58() : "Not connected"}
          </div>
          <div className="dash-stat-sub" style={{ marginTop: "0.5rem" }}>
            Credentials issued to this wallet address appear here automatically.
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="dash-list">
        <div className="dash-list-header">
          <h3>Credentials Issued to You</h3>
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
              <p>Connect a Solana wallet to see credentials issued to you</p>
            </div>
          </div>
        ) : loading ? (
          <div className="dash-list-item">
            <div className="dash-list-icon">⏳</div>
            <div className="dash-list-details">
              <h4>Loading credentials...</h4>
              <p>Querying Solana devnet for credentials assigned to your wallet</p>
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
                  : "No credentials have been issued to your wallet address yet."}
              </p>
            </div>
          </div>
        ) : (
          filtered.map((cred) => (
            <Link
              key={cred.pubkey}
              href={`/credential/${cred.hash}`}
              className="dash-list-item"
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              <div className="dash-list-icon">
                {cred.revoked ? "✕" : "🎓"}
              </div>
              <div className="dash-list-details">
                <h4 style={{ fontFamily: metaMap[cred.hash]?.title ? "var(--font-main)" : "monospace", fontSize: "0.8rem" }}>
                  {metaMap[cred.hash]?.title || `${cred.hash.slice(0, 16)}...${cred.hash.slice(-16)}`}
                </h4>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <span className={`type-badge type-${cred.credentialType}`} style={{ fontSize: "0.65rem" }}>
                    {credentialTypeLabel(cred.credentialType)}
                  </span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                    {new Date(cred.issuedAt * 1000).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>
                    from {cred.issuer.slice(0, 6)}...{cred.issuer.slice(-4)}
                  </span>
                </div>
              </div>
              <span className={`dash-list-badge ${cred.revoked ? "pending" : "onchain"}`}>
                {cred.revoked ? "✕ Revoked" : "⚡ Active"}
              </span>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
