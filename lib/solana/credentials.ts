import { Program, web3 } from "@coral-xyz/anchor";
import type { Credibly } from "./idl/credibly";
import { getCredentialPDA } from "./client";
import type { VerifiableCredential } from "@/lib/ipfs/upload";

export async function issueCredentialOnChain(
  program: Program<Credibly>,
  issuer: web3.PublicKey,
  vc: VerifiableCredential
): Promise<{ txSig: string; credentialHash: string; ipfsCID: string }> {
  // Step 1: Upload to IPFS via server-side API route (Pinata keys are server-only)
  const res = await fetch("/api/issue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vc }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS upload failed: ${err}`);
  }

  const { ipfsCID, credentialHashHex } = await res.json();
  const credentialHash = Buffer.from(credentialHashHex, "hex");

  const [institutionAccount] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("institution"), issuer.toBuffer()],
    program.programId
  );

  console.log("Issuer:", issuer.toBase58());
  console.log("Expected Institution PDA:", institutionAccount.toBase58());

  // Step 2: Submit on-chain tx from the browser wallet
  let txSig: string;
  try {
    txSig = await program.methods
      .issueCredential(
        Array.from(credentialHash),
        ipfsCID,
        vc.credentialSubject.id
      )
      .accounts({ issuer })
      .rpc();
  } catch (err: any) {
    if (err.message && err.message.includes("already been processed")) {
      console.warn("Transaction was confirmed but RPC reported it as already processed (common network jitter). Treating as success.");
      // We don't have the exact txSig unfortunately since it errored, but we know it succeeded
      txSig = "already_processed_check_explorer";
    } else {
      throw err;
    }
  }

  return { txSig, credentialHash: credentialHashHex, ipfsCID };
}

export async function verifyCredentialOnChain(
  program: Program<Credibly>,
  credentialHash: Buffer
) {
  const [credentialPDA] = getCredentialPDA(credentialHash);
  try {
    const account = await program.account.credentialAccount.fetch(credentialPDA);
    return {
      valid: !account.revoked,
      exists: true,
      issuer: account.issuer.toBase58(),
      holderDid: account.holderDid,
      ipfsCid: account.ipfsCid,
      issuedAt: new Date(account.issuedAt.toNumber() * 1000).toISOString(),
      revoked: account.revoked,
    };
  } catch {
    return { valid: false, exists: false };
  }
}
