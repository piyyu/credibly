import { Program, web3 } from "@coral-xyz/anchor";
import type { Credibly } from "./idl/credibly";
import { getCredentialPDA } from "./client";
import { uploadCredentialToIPFS, hashVC, type VerifiableCredential } from "@/lib/ipfs/upload";

export async function issueCredentialOnChain(
  program: Program<Credibly>,
  issuer: web3.PublicKey,
  vc: VerifiableCredential
): Promise<{ txSig: string; credentialHash: Buffer; ipfsCID: string }> {
  const ipfsCID = await uploadCredentialToIPFS(vc);
  const credentialHash = hashVC(vc);

  const txSig = await program.methods
    .issueCredential(
      Array.from(credentialHash),
      ipfsCID,
      vc.credentialSubject.id
    )
    .accounts({ issuer })
    .rpc();

  return { txSig, credentialHash, ipfsCID };
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
