"use client"

import * as React from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { cn } from "@/lib/utils"

export function WalletBadge({ className }: { className?: string }) {
  const { publicKey, connected, disconnecting, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [showMenu, setShowMenu] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const displayKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : ""

  // Close menu on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (!connected || disconnecting) {
    return (
      <button
        onClick={() => setVisible(true)}
        className={cn("btn-pill", className)}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu((v) => !v)}
        className={cn("wallet-badge", className)}
        style={{ cursor: "pointer", background: "transparent", outline: "none" }}
      >
        <span className="wallet-dot" style={{ background: "#14F195" }} />
        <span>{displayKey}</span>
      </button>
      {showMenu && (
        <div className="wallet-dropdown">
          <div className="wallet-dropdown-addr">
            {publicKey?.toBase58()}
          </div>
          <button
            className="wallet-dropdown-item"
            onClick={() => {
              navigator.clipboard.writeText(publicKey?.toBase58() || "")
              setShowMenu(false)
            }}
          >
            Copy Address
          </button>
          <button
            className="wallet-dropdown-item wallet-dropdown-disconnect"
            onClick={() => {
              disconnect()
              setShowMenu(false)
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
