"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram, getCredentialPDA } from "@/lib/solana/client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, Key, Info } from "lucide-react";

export default function RevokePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [hashHex, setHashHex] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Hex validation (64 chars, 0-9 a-f)
  const isValidHex = hashHex.length === 64 && /^[0-9A-Fa-f]{64}$/i.test(hashHex);

  function initiateRevoke() {
    if (!isValidHex) {
      setIsError(true);
      setStatus("Invalid Hash. Must be a 64-character hex string.");
      return;
    }
    setShowConfirm(true);
  }

  async function handleConfirmRevoke() {
    if (!publicKey || !program || !isValidHex) return;
    setProcessing(true);
    setStatus("");
    try {
      const hashBuf = Buffer.from(hashHex, "hex");
      const [credPDA] = getCredentialPDA(hashBuf);
      const txSig = await program.methods
        .revokeCredential(Array.from(hashBuf), reason)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .accounts({ credentialAccount: credPDA, issuer: publicKey } as any)
        .rpc();
        
      setStatus(`Successfully revoked on-chain. TX: ${txSig}`);
      setIsError(false);
      setHashHex("");
      setReason("");
      setShowConfirm(false);
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
        <p className="text-sm text-gray-500">Permanently invalidate a verifiable credential across the network.</p>
      </motion.div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Revocation</h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              You are about to permanently flag this credential hash as <strong className="text-red-600 font-semibold">REVOKED</strong> on the Solana blockchain. This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full max-w-xs">
              <button 
                onClick={() => setShowConfirm(false)}
                disabled={processing}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmRevoke}
                disabled={processing}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {processing ? <span className="animate-pulse">Revoking...</span> : "Yes, Revoke"}
              </button>
            </div>
          </motion.div>
        )}

        <div className="flex items-start gap-3 mb-6 p-4 bg-red-50/50 border border-red-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h4>
            <p className="text-xs text-red-700 leading-relaxed">
              Revoking a credential sets its on-chain state to invalid. Any employer or service verifying this specific hash will immediately see it as revoked. Use with extreme caution.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Key className="w-4 h-4 text-gray-400" /> Credential Hash
            </label>
            <input
              type="text"
              placeholder="64-character hex hash..."
              value={hashHex}
              onChange={(e) => setHashHex(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-all font-mono ${
                hashHex.length > 0 && !isValidHex ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:border-emerald-300 focus:ring-emerald-100"
              }`}
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Info className="w-3 h-3" /> The SHA-256 hash of the Verifiable Credential.
              </p>
              <span className={`text-[10px] font-mono ${isValidHex ? 'text-emerald-500' : 'text-gray-400'}`}>
                {hashHex.length}/64
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (Public Log)</label>
            <input
              type="text"
              placeholder="e.g. Academic misconduct, Issued in error"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <button
            onClick={initiateRevoke}
            disabled={!hashHex || !publicKey || processing}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2 mt-2 shadow-sm"
          >
            <ShieldAlert className="w-4 h-4" /> Initialize Revocation
          </button>

          <AnimatePresence>
            {status && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-xs p-3 rounded-lg overflow-hidden break-all border mt-4 ${
                  isError ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {status}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
