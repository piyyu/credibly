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
      if (stored) setCredentials(JSON.parse(stored));
    }
    setLoading(false);
  }, [publicKey]);

  if (loading) return null;

  if (!publicKey) return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm">
        <div className="w-14 h-14 bg-blue-50 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <Fingerprint className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Identity Wallet</h1>
        <p className="text-sm text-gray-500 mb-5">Connect your Solana wallet to view your credentials.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gray-900 !text-white hover:!bg-gray-800 !rounded-lg !font-medium !text-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 px-6 py-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">My Wallet</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">
            <span className="text-gray-400">DID:</span> did:sol:{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}
          </div>
        </div>
      </div>

      {credentials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-200 text-center py-20 px-6">
          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-900 mb-1">No Credentials Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">Ask your institution to issue one.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              key={cred.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex justify-between items-start mb-5">
                <div className="w-9 h-9 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>

              <h2 className="text-base font-semibold text-gray-900 mb-2">{cred.degree}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400" /> {cred.institution}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(cred.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </div>

              <Link href={`/wallet/share/${cred.credentialHashHex}`} className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg transition-colors">
                <QrCode className="w-4 h-4" /> Share via QR
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
