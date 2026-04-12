"use client";
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import WalletMultiButton with SSR disabled to prevent
// hydration mismatches — the wallet adapter renders differently on
// server vs client (icon availability, wallet state).
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export function ClientWalletButton(props: React.ComponentProps<typeof WalletMultiButton>) {
  return <WalletMultiButton {...props} />;
}
