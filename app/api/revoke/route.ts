import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "@/lib/solana/idl/credibly.json";
import type { Credibly } from "@/lib/solana/idl/credibly";

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || "11111111111111111111111111111111");

/**
 * POST /api/revoke
 * Server-side endpoint to check revocation status of a credential.
 * Actual revocation requires a wallet signature from the issuer (done client-side),
 * but this route lets external services (ATS, employer portals) query revocation state.
 *
 * Body: { credentialHash: string (hex) }
 */
export async function POST(req: NextRequest) {
  try {
    const { credentialHash } = await req.json();

    if (!credentialHash || typeof credentialHash !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid credentialHash (hex string required)" },
        { status: 400 }
      );
    }

    const hashBuf = Buffer.from(credentialHash, "hex");
    const [credentialPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), hashBuf],
      PROGRAM_ID
    );

    const provider = new AnchorProvider(connection, {} as never, { commitment: "confirmed" });
    const program = new Program<Credibly>(idl as Credibly, provider);
    const account = await program.account.credentialAccount.fetch(credentialPDA);

    return NextResponse.json({
      credentialHash,
      revoked: account.revoked,
      issuer: account.issuer.toBase58(),
      issuedAt: new Date(account.issuedAt.toNumber() * 1000).toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Credential not found or invalid hash" },
      { status: 404 }
    );
  }
}
