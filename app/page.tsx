import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] relative overflow-hidden">

      <header className="relative z-10 py-6 px-8 md:px-12 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-serif text-[#1C1C1E] tracking-tight">Credibly</span>
        </div>

        <div className="flex items-center gap-8">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[15px] font-medium text-[#49494B] hover:text-[#1C1C1E] transition-colors">Documentation</a>
          <Link href="/dashboard" className="text-[15px] font-medium text-[#1C1C1E] border-b border-[#1C1C1E] pb-0.5 hover:text-[#D95C41] hover:border-[#D95C41] transition-all">
            Access Portal
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full pt-20 pb-32">
        <div className="max-w-[900px] w-full text-center flex flex-col items-center animate-slide-up">

          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-[#D95C41] rounded-full"></span>
            <span className="text-[13px] font-medium text-[#D95C41] uppercase tracking-widest">Solana Network</span>
          </div>

          <h1 className="text-5xl md:text-[80px] font-serif tracking-tight leading-[1.05] mb-8 text-[#1C1C1E]">
            Immutable records, <br />
            <span className="text-[#8A8985] italic">elegantly verified.</span>
          </h1>

          <p className="text-lg md:text-[22px] text-[#49494B] mb-14 max-w-2xl leading-relaxed font-light">
            A research-driven infrastructure to issue and immediately authenticate academic and institutional records on-chain.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link href="/dashboard" className="btn-primary">
              Initialize Subsystem
            </Link>
            <Link href="/verify" className="btn-secondary">
              Verification Engine
            </Link>
          </div>

        </div>

        {/* Abstract Soft Geometry */}
        <div className="w-full max-w-4xl mt-32 relative flex justify-center opacity-60">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8E6DF] to-transparent mb-12"></div>
          <div className="absolute top-[-10px] w-5 h-5 border border-[#E8E6DF] rounded-full bg-[#FAF9F6]"></div>
        </div>
      </main>

      <footer className="py-10 text-center text-[#8A8985] text-[13px] font-medium border-t border-[#E8E6DF] bg-[#FAF9F6] relative z-20">
        © {new Date().getFullYear()} Credibly Protocol &mdash; Open State Architecture
      </footer>
    </div>
  );
}
