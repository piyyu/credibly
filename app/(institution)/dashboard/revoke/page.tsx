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
      setStatus(`Revoked successfully. Tx: ${txSig}`);
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
    <div className="p-8 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Revoke Credential</h1>
        <p className="text-sm text-gray-500">Permanently invalidate a credential across the network.</p>
      </motion.div>

      <div className="card p-8 border-red-100">
        <div className="flex items-center gap-3 mb-6 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">This action is irreversible. The credential will be permanently marked as revoked on Solana.</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Credential Hash</label>
            <input
              type="text"
              placeholder="Enter hex hash..."
              value={hashHex}
              onChange={(e) => setHashHex(e.target.value)}
              className="input-clean font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
            <input
              type="text"
              placeholder="e.g. Academic misconduct, Error in issuance"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-clean"
            />
          </div>

          <button
            onClick={handleRevoke}
            disabled={!hashHex || !publicKey || processing}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors flex justify-center items-center gap-2 text-sm"
          >
            {processing ? "Broadcasting..." : <><ShieldAlert className="w-4 h-4" /> Permanently Revoke</>}
          </button>

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm p-4 rounded-xl break-all border ${
                isError
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
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
