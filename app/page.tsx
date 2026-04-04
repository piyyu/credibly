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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-amber-200 to-emerald-300 opacity-80" />
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full h-24" preserveAspectRatio="none">
            <path d="M0 120L60 105C120 90 240 60 360 52C480 45 600 60 720 68C840 75 960 75 1080 67C1200 60 1320 45 1380 38L1440 30V120H0Z" fill="#fafafa"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-36 text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-gray-200 text-sm text-gray-600 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Powered by Solana
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-5 leading-tight">
              The new standard<br />in credentials
            </motion.h1>

            <motion.p variants={fadeUp} className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
              Tamper-proof academic credentials, instantly verifiable anywhere in the world. Built for institutions, students, and employers.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-row gap-3 justify-center">
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/verify" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Verify Credential
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-6 -mt-10 relative z-20 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 grid grid-cols-3 divide-x divide-gray-100">
          {[
            { value: "150+", label: "Institutions" },
            { value: "5%", label: "Fraud Reduction" },
            { value: "4.8", label: "Trust Score" },
          ].map((s) => (
            <div key={s.label} className="text-center px-3">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{s.value}</div>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Designed to connect. Built to scale.</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">Complete verification infrastructure — from issuance to employer lookups.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: ShieldCheck, title: "Cryptographic Trust", desc: "Credentials hashed and anchored to Solana PDAs. Impossible to forge.", color: "bg-emerald-50 text-emerald-600" },
            { icon: Zap, title: "Instant Verification", desc: "Scan a QR code and get a definitive result in under 2 seconds.", color: "bg-amber-50 text-amber-600" },
            { icon: Database, title: "Self-Sovereign Identity", desc: "Students own their credentials — no centralized database needed.", color: "bg-blue-50 text-blue-600" },
          ].map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">How it works</h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto text-center mb-12">Zero PII on-chain. Full GDPR & DPDPA compliance by design.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Building2, title: "Onboard", desc: "Institution registers on Solana." },
              { step: "02", icon: GraduationCap, title: "Issue", desc: "W3C VC hashed and anchored." },
              { step: "03", icon: Globe, title: "Receive", desc: "Student gets it in their wallet." },
              { step: "04", icon: CheckCircle2, title: "Verify", desc: "Employer scans QR — instant." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs font-bold text-emerald-600 mb-2">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-amber-50/60" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Ready to get started?</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Join 150+ institutions already using Credibly.</p>
            <div className="flex flex-row gap-3 justify-center">
              <Link href="/dashboard" className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Open Dashboard
              </Link>
              <Link href="/verify" className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Try Verification
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
