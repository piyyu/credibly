"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, GraduationCap, Building2, Calendar, Fingerprint } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      const stored = localStorage.getItem(`credibly_${publicKey.toBase58()}`);
      if (stored) {
        setCredentials(JSON.parse(stored));
      }
    }
    setLoading(false);
  }, [publicKey]);

  // Loading state handled smoothly
  if (loading) return null;

  if (!publicKey) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-12 rounded-3xl text-center max-w-lg glow-effect">
        <div className="w-20 h-20 bg-white/5 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <Fingerprint className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Identity Wallet</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">Connect your Solana wallet to access and manage your verifiable academic credentials.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-200 transition-colors !rounded-xl !font-bold" />
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Wallet</h1>
          <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 glass-pill text-xs font-mono text-gray-300">
            <span className="text-gray-500">DID:</span> did:sol:{publicKey.toBase58()}
          </div>
        </div>
        <WalletMultiButton className="!bg-white/10 hover:!bg-white/20 !text-white transition-colors !rounded-xl border border-white/10" />
      </div>

      {credentials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 glass-panel rounded-3xl">
          <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Credentials Found</h2>
          <p className="text-gray-400 max-w-md mx-auto">You don't have any verifiable credentials associated with this wallet yet. Ask your institution to issue one.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {credentials.map((cred, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={cred.id}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-8 w-48 h-48 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
              
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono rounded-full uppercase tracking-wider">
                    Verified
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <h2 className="text-2xl font-bold tracking-tight">{cred.degree}</h2>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-sm">{cred.institution}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Issued: {new Date(cred.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <Link href={`/wallet/share/${cred.credentialHashHex}`} className="w-full relative overflow-hidden glass-panel px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm font-semibold group/btn">
                  <QrCode className="w-4 h-4" />
                  <span>Share via QR</span>
                  <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-center" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
