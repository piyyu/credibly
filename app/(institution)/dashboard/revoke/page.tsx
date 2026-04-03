"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram, getCredentialPDA } from "@/lib/solana/client";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";

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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-red-400">Revoke Credential</h1>
        <p className="text-gray-400">Irreversibly invalidate a credential globally across the verification network.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="glass-panel p-8 md:p-10 rounded-3xl border border-red-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cryptographic Hash</label>
              <input type="text" placeholder="Enter hex hash associated with credential..."
                value={hashHex} onChange={(e) => setHashHex(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Reason for Revocation</label>
              <input type="text" placeholder="e.g. Academic misconduct, Error in issuance"
                value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all" />
            </div>
            
            <button onClick={handleRevoke} disabled={!hashHex || !publicKey || processing}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-50 transition-colors mt-4 flex justify-center items-center gap-2">
              {processing ? "Broadcasting to Solana..." : <><ShieldAlert className="w-5 h-5" /> Permanently Revoke</>}
            </button>
            
            {status && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className={`text-sm font-mono p-4 rounded-lg mt-4 break-all border ${isError ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                {status}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
