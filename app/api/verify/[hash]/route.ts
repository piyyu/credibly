import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/lib/solana/idl/credibly.json";
import type { Credibly } from "@/lib/solana/idl/credibly";

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
  try {
    const resolvedParams = await params;
    const hashBuf = Buffer.from(resolvedParams.hash, "hex");
    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), hashBuf],
      PROGRAM_ID
    );

    const provider = new AnchorProvider(connection, {} as never, { commitment: "confirmed" });
    const program = new Program<Credibly>(idl as Credibly, provider);
    const account = await program.account.credentialAccount.fetch(credentialPDA);

    return NextResponse.json({
      valid: !account.revoked,
      exists: true,
      issuer: account.issuer.toBase58(),
      holderDid: account.holderDid,
      ipfsCid: account.ipfsCid,
      issuedAt: new Date(account.issuedAt.toNumber() * 1000).toISOString(),
      revoked: account.revoked,
    });
  } catch {
    return NextResponse.json({ valid: false, exists: false }, { status: 404 });
  }
}
