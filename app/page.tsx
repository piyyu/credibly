"use client";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, Database, GraduationCap, Building2, CheckCircle2, Globe } from "lucide-react";

export default function Home() {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="flex flex-col">
      {/* Hero with warm landscape gradient */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 hero-gradient opacity-90" />
        {/* Soft hills overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 52.5C480 45 600 60 720 67.5C840 75 960 75 1080 67.5C1200 60 1320 45 1380 37.5L1440 30V120H0Z" fill="#fafafa"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-40 text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="pill mx-auto mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Powered by Solana
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              The new standard<br />
              <span className="text-gray-800">in credentials</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Tamper-proof academic credentials, instantly verifiable anywhere in the world. Built for institutions, students, and employers.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors group">
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/verify" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Verify Credential
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats row */}
      <section className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="card p-8 grid grid-cols-3 divide-x divide-gray-100">
          {[
            { value: "150+", label: "Institutions Onboarded" },
            { value: "5%", label: "Fraud Reduction" },
            { value: "4.8", label: "Trust Score" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Designed to connect.<br />Built to scale.</h2>
          <p className="text-gray-500 max-w-xl mx-auto">A complete verification infrastructure — from issuance to employer lookups — powered by Solana&apos;s speed and permanence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Cryptographic Trust", desc: "Credentials hashed and anchored to Solana PDAs. Impossible to forge or alter.", color: "bg-emerald-50 text-emerald-600" },
            { icon: Zap, title: "Instant Verification", desc: "Verifiers scan a QR code and receive a definitive result in under 2 seconds.", color: "bg-amber-50 text-amber-600" },
            { icon: Database, title: "Self-Sovereign Identity", desc: "Students own their credentials in decentralized wallets — no central database.", color: "bg-blue-50 text-blue-600" },
          ].map((feature, i) => (
            <div key={i} className="card p-8 hover-lift">
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy at every step</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Zero PII on-chain. Only cryptographic hashes stored on Solana. Full GDPR & DPDPA compliance by design.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: Building2, title: "Institution Onboards", desc: "Admin registers via Solana transaction, creating a trust registry PDA." },
              { step: "02", icon: GraduationCap, title: "Issue Credential", desc: "W3C VC built, hashed, uploaded to IPFS, then anchored on-chain." },
              { step: "03", icon: Globe, title: "Student Receives", desc: "Credential appears in the student's decentralized wallet automatically." },
              { step: "04", icon: CheckCircle2, title: "Verify Instantly", desc: "Employer scans QR — truth query resolves in under 2 seconds." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs font-bold text-emerald-600 mb-3">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="card p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-amber-50 opacity-50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-8">Join 150+ institutions already using Credibly to issue tamper-proof credentials on Solana.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors">
                Open Dashboard
              </Link>
              <Link href="/verify" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                Try Verification
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
