"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ToastProvider } from "@/components/ui/Toast";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
    // We strictly use devnet for the MVP
    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter()
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
