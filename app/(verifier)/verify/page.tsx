"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Shield, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl text-center"
      >
        <div className="mx-auto w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6">
          <Shield className="w-7 h-7 text-emerald-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Verify a Credential</h1>
        <p className="text-gray-500 text-base mb-10 max-w-md mx-auto leading-relaxed">
          Instantly verify the authenticity of any credential issued on the Credibly network.
        </p>

        <div className="card p-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Paste credential hash (hex)..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => router.push(`/verify/${hash}`)}
            disabled={!hash}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Verify <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cryptographically secure</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Instant validation</span>
        </div>
      </motion.div>
    </div>
  );
}
