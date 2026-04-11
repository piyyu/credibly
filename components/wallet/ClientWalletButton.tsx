"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";

export function ClientWalletButton(props: React.ComponentProps<typeof WalletMultiButton>) {
  return <WalletMultiButton {...props} />;
}
