"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

interface StoredCredential {
  id: string;
  degree: string;
  institution: string;
  issuedAt: string;
  credentialHashHex: string;
}

export default function WalletPage() {
  const { publicKey } = useWallet();
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);

  useEffect(() => {
    if (!publicKey) return;
    const stored = localStorage.getItem(`credibly_${publicKey.toBase58()}`);
    if (stored) setCredentials(JSON.parse(stored));
  }, [publicKey]);

  if (!publicKey) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">My Credentials</h1>
      <p className="text-gray-400">Connect your Solana wallet to view credentials</p>
      <WalletMultiButton />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Credentials</h1>
          <WalletMultiButton />
        </div>
        <p className="text-gray-600 text-sm mb-6 font-mono">DID: did:sol:{publicKey.toBase58()}</p>

        {credentials.length === 0 ? (
          <p className="text-center py-20 text-gray-500">No credentials yet. Ask your institution to issue to your DID above.</p>
        ) : (
          <div className="grid gap-4">
            {credentials.map((cred) => (
              <div key={cred.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{cred.degree}</h2>
                  <p className="text-gray-400">{cred.institution}</p>
                  <p className="text-gray-600 text-sm mt-1">{new Date(cred.issuedAt).toLocaleDateString()}</p>
                </div>
                <Link href={`/wallet/share/${cred.credentialHashHex}`}
                  className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg text-sm hover:bg-green-400 transition">
                  Share / QR
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
