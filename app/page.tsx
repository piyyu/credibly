"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Database } from "lucide-react";

export default function Home() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

        <motion.div 
          className="text-center max-w-4xl relative z-10"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill mb-8 text-sm font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Built on Solana for global scale
          </motion.div>
          <motion.h1 variants={item} className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight">
            Trust <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Decentralized.</span>
          </motion.h1>
          <motion.p variants={item} className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Tamper-proof academic credentials, instantly verifiable anywhere in the world. Zero fraud, infinite scaling.
          </motion.p>
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors w-full sm:w-auto flex justify-center items-center gap-2 group">
              Issue Credentials <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/verify" className="px-8 py-4 glass-panel text-white font-semibold rounded-xl hover:bg-white/10 transition-colors w-full sm:w-auto glow-effect text-center flex justify-center">
              Verify a Credential
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Outline */}
      <section className="w-full max-w-7xl px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: "Cryptographic Trust", desc: "Credentials hashed and anchored to Solana PDAs. Impossible to forge or alter." },
          { icon: Zap, title: "Instant Verification", desc: "Verifiers scan a QR code and receive an absolute truth query in milliseconds." },
          { icon: Database, title: "Permanent SSI", desc: "Self-Sovereign Identity wallets give students lifelong control without centralized databases." }
        ].map((feature, i) => (
          <div key={i} className="glass-panel p-8 rounded-3xl relative overflow-hidden group cursor-default">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <feature.icon className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
