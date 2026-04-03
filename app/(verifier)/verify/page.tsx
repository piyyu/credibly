"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Shield, QrCode } from "lucide-react";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-screen overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center relative z-10"
      >
        <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
          <Shield className="w-8 h-8 text-emerald-400" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Verify a Credential</h1>
        <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Instantly verify the cryptographic authenticity of any document issued on the Credibly network.
        </p>

        <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row gap-3 glow-effect relative">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-gray-500 absolute left-4" />
            <input 
              type="text" 
              placeholder="Paste credential hash (hex)..."
              value={hash} 
              onChange={(e) => setHash(e.target.value)}
              className="w-full bg-black/40 border border-transparent rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600" 
            />
          </div>
          <button 
            onClick={() => router.push(`/verify/${hash}`)} 
            disabled={!hash}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            Verify <QrCode className="w-4 h-4 hidden md:block" />
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500/50"></span> Cryptographically secure</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500/50"></span> Instant validation</span>
        </div>
      </motion.div>
    </div>
  );
}
