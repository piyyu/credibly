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

  if (loading) return null;

  if (!publicKey) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div className="card p-10 text-center max-w-md">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl mx-auto mb-5 flex items-center justify-center">
          <Fingerprint className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Identity Wallet</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Connect your Solana wallet to view and manage your verifiable academic credentials.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gray-900 !text-white hover:!bg-gray-800 !rounded-xl !font-medium" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">My Wallet</h1>
          <div className="pill text-xs font-mono">
            <span className="text-gray-400">DID:</span> did:sol:{publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-6)}
          </div>
        </div>
        <WalletMultiButton className="!bg-white !text-gray-700 hover:!bg-gray-50 !rounded-xl !border !border-gray-200 !font-medium !text-sm" />
      </div>

      {credentials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-24 px-8">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No Credentials Yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">No verifiable credentials are associated with this wallet. Ask your institution to issue one.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {credentials.map((cred, i) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={cred.id}
              className="card p-6 hover-lift group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verified
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{cred.degree}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {cred.institution}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(cred.issuedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>

              <Link
                href={`/wallet/share/${cred.credentialHashHex}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-colors"
              >
                <QrCode className="w-4 h-4" /> Share via QR
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
