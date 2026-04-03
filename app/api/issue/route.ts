import { NextRequest, NextResponse } from "next/server";
import { uploadCredentialToIPFS, hashVC } from "@/lib/ipfs/upload";

export async function POST(req: NextRequest) {
  const { vc } = await req.json();
  const ipfsCID = await uploadCredentialToIPFS(vc);
  const credentialHashHex = hashVC(vc).toString("hex");

  // Client receives the hash + CID, then signs and submits the tx from their wallet
  return NextResponse.json({ ipfsCID, credentialHashHex });
}
