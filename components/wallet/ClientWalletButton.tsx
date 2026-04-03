"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";

export function ClientWalletButton(props: any) {
  return <WalletMultiButton {...props} />;
}
