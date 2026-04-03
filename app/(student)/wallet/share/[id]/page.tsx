"use client";
import { use, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { QrCode, ScanLine, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [verifyURL, setVerifyURL] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVerifyURL(`${window.location.origin}/verify/${id}`);
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!verifyURL) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <Link href="/wallet" className="text-gray-400 hover:text-white text-sm font-medium mb-8 inline-block transition-colors">
          ← Back to Wallet
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-panel p-8 md:p-10 rounded-[2.5rem] relative glow-effect"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">Share Credential</h1>
              <p className="text-gray-400 text-sm">Present this QR to any verifier.</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
              <ScanLine className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl mb-8 flex justify-center shadow-2xl relative">
            <div className="absolute inset-0 ring-4 ring-black/5 rounded-3xl pointer-events-none" />
            <QRCode value={verifyURL} size={250} level="H" fgColor="#000" bgColor="transparent" />
          </div>

          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2">Direct Link</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={verifyURL} 
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 font-mono focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/5"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
