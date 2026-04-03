"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram } from "@/lib/solana/client";

export default function RevokePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [hashHex, setHashHex] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");

  async function handleRevoke() {
    if (!publicKey || !program || !hashHex) return;
    try {
      const hashBuf = Buffer.from(hashHex, "hex");
      const txSig = await program.methods
        .revokeCredential(Array.from(hashBuf), reason)
        .accounts({ issuer: publicKey })
        .rpc();
      setStatus(`Revoked. Tx: ${txSig}`);
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Revoke Credential</h1>
      <div className="space-y-4">
        <input type="text" placeholder="Credential hash (hex)"
          value={hashHex} onChange={(e) => setHashHex(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500" />
        <input type="text" placeholder="Reason for revocation"
          value={reason} onChange={(e) => setReason(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500" />
        <button onClick={handleRevoke} disabled={!hashHex || !publicKey}
          className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 disabled:opacity-50 transition">
          Revoke Credential
        </button>
        {status && <p className="text-sm text-gray-400 font-mono">{status}</p>}
      </div>
    </div>
  );
}
