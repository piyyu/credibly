import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import idl from "./idl/credibly.json";
import type { Credibly } from "./idl/credibly";

export const PROGRAM_ID = new web3.PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111");

export function useCrediblyProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program<Credibly>(idl as Credibly, provider);
  }, [connection, wallet]);
}

export function getCredentialPDA(credentialHash: Buffer): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), credentialHash],
    PROGRAM_ID
  );
}

export function getInstitutionPDA(institutionPubkey: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("institution"), institutionPubkey.toBuffer()],
    PROGRAM_ID
  );
}
