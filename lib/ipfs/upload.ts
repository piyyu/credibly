import PinataClient from "@pinata/sdk";
import crypto from "crypto";

const pinata = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY!,
  pinataSecretApiKey: process.env.PINATA_SECRET!,
});

export interface VerifiableCredential {
  "@context": string[];
  type: string[];
  issuer: string;
  issuanceDate: string;
  credentialSubject: {
    id: string;
    degree: string;
    institution: string;
    graduationYear: number;
    [key: string]: unknown;
  };
}

export async function uploadCredentialToIPFS(vc: VerifiableCredential): Promise<string> {
  const result = await pinata.pinJSONToIPFS(vc, {
    pinataMetadata: { name: `credibly-vc-${Date.now()}` },
  });
  return result.IpfsHash;
}

export async function fetchCredentialFromIPFS(cid: string): Promise<VerifiableCredential> {
  const url = `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${cid}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPFS fetch failed: ${res.statusText}`);
  return res.json();
}

export function hashVC(vc: VerifiableCredential): Buffer {
  const sorted = JSON.stringify(vc, Object.keys(vc).sort());
  return crypto.createHash("sha256").update(sorted).digest();
}
