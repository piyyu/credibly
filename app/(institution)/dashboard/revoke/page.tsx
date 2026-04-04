"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram, getCredentialPDA } from "@/lib/solana/client";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle } from "lucide-react";

export default function RevokePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [hashHex, setHashHex] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleRevoke() {
    if (!publicKey || !program || !hashHex) return;
    setProcessing(true);
    setStatus("");
    try {
      const hashBuf = Buffer.from(hashHex, "hex");
      const [credPDA] = getCredentialPDA(hashBuf);
      const txSig = await program.methods
        .revokeCredential(Array.from(hashBuf), reason)
        .accounts({ credentialAccount: credPDA, issuer: publicKey } as any)
        .rpc();
      setStatus(`Revoked. Tx: ${txSig}`);
      setIsError(false);
      setHashHex("");
      setReason("");
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
      setIsError(true);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Revoke Credential</h1>
        <p className="text-sm text-gray-500">Permanently invalidate a credential across the network.</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-5 p-3 bg-red-50 border border-red-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">This action is irreversible. The credential will be permanently revoked on Solana.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Credential Hash</label>
            <input
              type="text"
              placeholder="Enter hex hash..."
              value={hashHex}
              onChange={(e) => setHashHex(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
            <input
              type="text"
              placeholder="e.g. Academic misconduct"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <button
            onClick={handleRevoke}
            disabled={!hashHex || !publicKey || processing}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {processing ? "Broadcasting..." : <><ShieldAlert className="w-4 h-4" /> Permanently Revoke</>}
          </button>
          {status && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm p-3 rounded-lg break-all border ${
                isError ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {status}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
