"use client";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, Shield, AlertTriangle, Users, ArrowUpRight } from "lucide-react";

export default function DashboardOverview() {
  const { publicKey } = useWallet();

  const metrics = [
    { title: "Active Credentials", value: "1,204", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Revoked", value: "3", change: "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    { title: "Verifications", value: "24,591", change: "+8%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Trust Tier", value: "Tier 1", change: "UGC", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your institutional credentials and trust registry.</p>
        {publicKey && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-mono text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-[11px] font-medium text-gray-400">{m.change}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{m.value}</div>
            <p className="text-xs text-gray-500 mt-0.5">{m.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> Trust Registry
          </h2>
          <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
            Explorer <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Your institution is verified as <strong className="text-gray-900">Tier 1 (UGC/AICTE Recognised)</strong>.
            Automatic trust overrides across the network.
          </p>
        </div>
      </div>
    </div>
  );
}
