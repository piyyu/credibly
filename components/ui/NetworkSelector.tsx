"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

type Network = "devnet" | "mainnet-beta"

interface NetworkContextValue {
  network: Network
  setNetwork: (n: Network) => void
  rpcEndpoint: string
}

const NetworkContext = createContext<NetworkContextValue>({
  network: "devnet",
  setNetwork: () => {},
  rpcEndpoint: "https://api.devnet.solana.com",
})

export function useNetwork() {
  return useContext(NetworkContext)
}

const RPC_ENDPOINTS: Record<Network, string> = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<Network>("devnet")

  useEffect(() => {
    const saved = localStorage.getItem("credibly-network") as Network | null
    if (saved === "devnet" || saved === "mainnet-beta") {
      setNetworkState(saved)
    }
  }, [])

  const setNetwork = useCallback((n: Network) => {
    setNetworkState(n)
    localStorage.setItem("credibly-network", n)
  }, [])

  const rpcEndpoint = RPC_ENDPOINTS[network]

  return (
    <NetworkContext.Provider value={{ network, setNetwork, rpcEndpoint }}>
      {children}
    </NetworkContext.Provider>
  )
}

export function NetworkSelector() {
  const { network, setNetwork } = useNetwork()

  return (
    <div className="network-selector">
      <button
        className={`network-pill ${network === "devnet" ? "active" : ""}`}
        onClick={() => setNetwork("devnet")}
        title="Solana Devnet"
      >
        <span className="network-dot devnet" />
        Devnet
      </button>
      <button
        className={`network-pill ${network === "mainnet-beta" ? "active" : ""}`}
        onClick={() => setNetwork("mainnet-beta")}
        title="Solana Mainnet Beta"
      >
        <span className="network-dot mainnet" />
        Mainnet
      </button>
    </div>
  )
}
