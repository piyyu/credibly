import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { credentialHash, atsSource, candidateId } = await req.json();

  const result = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${credentialHash}`
  ).then((r) => r.json());

  return NextResponse.json({
    candidate_verified: result.valid,
    candidate_id: candidateId,
    issuer: result.issuer,
    issuer_tier: result.institutionTier,
    verified_at: new Date().toISOString(),
    explorer_url: `https://explorer.solana.com/address/${result.credentialPDA}?cluster=devnet`,
    source: atsSource,
  });
}
