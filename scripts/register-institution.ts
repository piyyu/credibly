/**
 * Register an institution wallet in the Credibly trust registry.
 *
 * Usage:
 *   npx ts-node --esm scripts/register-institution.ts <INSTITUTION_PUBKEY>
 *
 * Example:
 *   npx ts-node --esm scripts/register-institution.ts 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
 *
 * This uses the CLI wallet (~/.config/solana/id.json) as the authority/payer.
 */

import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import fs from "fs";
import path from "path";

// Load IDL
const idlPath = path.resolve(__dirname, "../lib/solana/idl/credibly.json");
const idl = JSON.parse(fs.readFileSync(idlPath, "utf-8"));

const PROGRAM_ID = new web3.PublicKey("HYLVH9iBUSroAyDViFn6fY7WirfPuv1kG89TCyvAz5fx");

async function main() {
  const institutionPubkeyStr = process.argv[2];
  if (!institutionPubkeyStr) {
    console.error("Usage: npx ts-node scripts/register-institution.ts <INSTITUTION_PUBKEY>");
    process.exit(1);
  }

  const institutionPubkey = new web3.PublicKey(institutionPubkeyStr);

  // Load CLI wallet
  const keypairPath = path.resolve(
    process.env.HOME || "~",
    ".config/solana/id.json"
  );
  const secretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(keypairPath, "utf-8"))
  );
  const authority = web3.Keypair.fromSecretKey(secretKey);

  // Connect to devnet
  const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = {
    publicKey: authority.publicKey,
    signTransaction: async (tx: web3.Transaction) => {
      tx.partialSign(authority);
      return tx;
    },
    signAllTransactions: async (txs: web3.Transaction[]) => {
      txs.forEach((tx) => tx.partialSign(authority));
      return txs;
    },
  };

  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  });
  const program = new Program(idl, provider);

  console.log("Authority (payer):", authority.publicKey.toBase58());
  console.log("Institution wallet:", institutionPubkey.toBase58());
  console.log("Program ID:", PROGRAM_ID.toBase58());

  try {
    const txSig = await program.methods
      .registerInstitution("Credibly Demo Institution", 1, `did:sol:${institutionPubkey.toBase58()}`)
      .accounts({
        institution: institutionPubkey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Institution registered successfully!");
    console.log("Transaction:", txSig);
    console.log(`Explorer: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  } catch (err: any) {
    if (err.message?.includes("already in use")) {
      console.log("ℹ️  Institution is already registered.");
    } else {
      console.error("❌ Registration failed:", err.message);
    }
  }
}

main();
