"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ToastProvider } from "@/components/ui/Toast";
import { NetworkProvider, useNetwork } from "@/components/ui/NetworkSelector";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

function SolanaProviders({ children }: { children: React.ReactNode }) {
    const { rpcEndpoint } = useNetwork();

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter()
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={rpcEndpoint}>
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

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NetworkProvider>
            <SolanaProviders>
                {children}
            </SolanaProviders>
        </NetworkProvider>
    );
}
