"use client";
import { use, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { ScanLine, Copy, Check, ArrowLeft } from "lucide-react";
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div className="w-full max-w-md">
        <Link href="/wallet" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Wallet
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-0.5">Share Credential</h1>
              <p className="text-sm text-gray-500">Present this QR to any verifier.</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-8 rounded-2xl mb-6 flex justify-center shadow-sm">
            <QRCode value={verifyURL} size={220} level="H" fgColor="#171717" bgColor="transparent" />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Verification Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={verifyURL}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-xs text-gray-600 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-100"
                title="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
