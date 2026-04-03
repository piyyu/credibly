"use client";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { CheckCircle2, Shield, AlertTriangle, Users } from "lucide-react";

export default function DashboardOverview() {
  const { publicKey } = useWallet();

  const metrics = [
    { title: "Active Credentials", value: "1,204", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Revoked", value: "3", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10" },
    { title: "Verification Requests", value: "24,591", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Trust Tier", value: "Tier 1", icon: Shield, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back. Manage your institutional credentials and trust registry standing.</p>
        {publicKey && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 glass-pill text-xs font-mono text-gray-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <motion.div 
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-2xl glow-effect group cursor-default"
          >
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`p-3 rounded-xl ${metric.bg}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-gray-400">{metric.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 glass-panel rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="text-emerald-500" /> Trust Registry Status
        </h2>
        <div className="bg-black/50 border border-white/5 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
          <p className="text-gray-300 max-w-2xl leading-relaxed relative z-10">
            Your institution is currently verified as <strong className="text-white">Tier 1 (UGC/AICTE Recognised)</strong>. 
            This tier grants your distributed credentials automatic trust overrides across the network. Please ensure the protection of your Solana signing key.
          </p>
        </div>
      </div>
    </div>
  );
}
