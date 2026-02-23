import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[rgba(153,69,255,0.15)] blur-[120px] rounded-full mix-blend-screen animate-[float_8s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[rgba(20,241,149,0.1)] blur-[150px] rounded-full mix-blend-screen animate-[float_10s_ease-in-out_infinite_reverse]"></div>
      </div>

      <header className="relative z-10 py-6 px-8 md:px-12 flex justify-between items-center w-full max-w-7xl mx-auto border-b border-white/5 bg-black/20 backdrop-blur-xl mt-4 rounded-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-solana flex items-center justify-center shadow-[0_0_15px_rgba(20,241,149,0.3)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Credibly</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Documentation</a>
          <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
            Launch App
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full">
        <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center animate-fade-in relative">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_8px_#14F195]"></span>
            <span className="text-sm font-medium text-zinc-300">Live on Solana Devnet</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] mb-6 text-white drop-shadow-2xl">
            Unforgeable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] to-[#9945FF]">
              Credentials
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl font-medium leading-relaxed">
            The decentralized protocol for issuing, managing, and instantly cryptographically verifying B2B records on the world's most performant blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="btn-gradient text-lg px-8 py-4 w-full sm:w-auto">
              Start Issuing
            </Link>
            <Link href="/verify" className="px-8 py-4 rounded-full font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-lg w-full sm:w-auto backdrop-blur-md">
              Verify a Record
            </Link>
          </div>

        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-zinc-600 text-sm font-medium">
        © {new Date().getFullYear()} Credibly Protocol. Open Source under MIT.
      </footer>
    </div>
  );
}
