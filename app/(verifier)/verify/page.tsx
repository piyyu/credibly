"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Shield, ArrowRight } from "lucide-react";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-5">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Verify a Credential</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          Instantly verify the authenticity of any credential issued on the Credibly network.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Paste credential hash (hex)..."
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-9 pr-3 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>
          <button
            onClick={() => router.push(`/verify/${hash}`)}
            disabled={!hash}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
          >
            Verify <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-5 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Cryptographically secure</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Instant validation</span>
        </div>
      </motion.div>
    </div>
  );
}
