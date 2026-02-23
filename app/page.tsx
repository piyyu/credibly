import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] relative overflow-hidden">

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none"></div>

      <header className="relative z-10 py-6 px-8 md:px-12 flex justify-between items-center w-full max-w-[1400px] mx-auto border-b border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center border border-[#60a5fa]/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Credibly</span>
        </div>

        <div className="flex items-center gap-8">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-bold text-[#a3a3a3] hover:text-white transition-colors uppercase tracking-widest">Documentation</a>
          <Link href="/dashboard" className="btn-primary text-sm px-8 py-3 uppercase tracking-wider">
            Access Portal
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full mt-16 md:mt-32 pb-32">
        <div className="max-w-[1200px] w-full text-center flex flex-col items-center animate-slide-up">

          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#262626] bg-[#151515] shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-10">
            <span className="w-2.5 h-2.5 bg-[#3b82f6] shadow-[0_0_10px_#3b82f6] animate-pulse"></span>
            <span className="text-xs font-bold text-[#d4d4d4] uppercase tracking-widest">Protocol Live on Devnet Target</span>
          </div>

          <h1 className="text-6xl md:text-[100px] font-black tracking-tighter leading-[1.0] mb-8 text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            Absolute <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#93c5fd] to-[#3b82f6]">Cryptographic</span> <br />
            Certainty.
          </h1>

          <p className="text-xl md:text-2xl text-[#a3a3a3] mb-12 max-w-3xl leading-relaxed font-medium">
            The institutional-grade infrastructure to issue, manage, and instantly verify B2B document hashes on the world's fastest blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto mt-4">
            <Link href="/dashboard" className="btn-primary text-lg px-10 py-5 min-w-[200px] uppercase tracking-wider border border-[#60a5fa]/30">
              Initialize Subsystem
            </Link>
            <Link href="/verify" className="bg-[#151515] text-white font-bold text-lg px-10 py-5 min-w-[200px] uppercase tracking-wider border border-[#262626] hover:border-[#a3a3a3] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              Verification Engine
            </Link>
          </div>

        </div>

        {/* Abstract Geometry Accent */}
        <div className="w-full max-w-7xl mt-32 relative h-80 overflow-hidden flex justify-center">
          <div className="w-full h-full max-w-5xl border-t border-l border-r border-[#262626] bg-[linear-gradient(180deg,#151515_0%,transparent_100%)] shadow-[0_-20px_50px_rgba(59,130,246,0.05)] relative flex items-start justify-center pt-8 overflow-hidden">
            {/* Glow Accent inside geometry */}
            <div className="absolute top-0 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent shadow-[0_0_30px_rgba(59,130,246,1)]"></div>

            <div className="text-center">
              <div className="text-[#3b82f6] font-mono text-sm font-bold uppercase tracking-widest mb-4">Secured Architecture</div>
              <div className="grid grid-cols-4 gap-px bg-[#262626] border border-[#262626]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-24 h-24 bg-[#0a0a0a] flex items-center justify-center p-4">
                    <div className="w-full h-full border border-[#262626] shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#3b82f6]/50"></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-[#737373] text-xs font-bold uppercase tracking-widest border-t border-[#262626] bg-[#0a0a0a] relative z-20">
        © {new Date().getFullYear()} Credibly Protocol | Decentralized Substrate
      </footer>
    </div>
  );
}
