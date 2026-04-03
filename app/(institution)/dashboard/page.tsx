"use client";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, Shield, AlertTriangle, Users, ArrowUpRight } from "lucide-react";

export default function DashboardOverview() {
  const { publicKey } = useWallet();

  const metrics = [
    { title: "Active Credentials", value: "1,204", change: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Revoked", value: "3", change: "0", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    { title: "Verification Requests", value: "24,591", change: "+8%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Trust Tier", value: "Tier 1", change: "UGC", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Manage your institutional credentials and trust registry.</p>
        {publicKey && (
          <div className="mt-3 pill text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              <span className="text-xs font-medium text-gray-400">{metric.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{metric.value}</h3>
            <p className="text-xs text-gray-500">{metric.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Trust Registry Status
          </h2>
          <a href="https://explorer.solana.com" target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
            View on Explorer <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <p className="text-sm text-gray-700 leading-relaxed">
            Your institution is verified as <strong className="text-gray-900">Tier 1 (UGC/AICTE Recognised)</strong>.
            This tier grants automatic trust overrides across the Credibly verification network.
          </p>
        </div>
      </div>
    </div>
  );
}
