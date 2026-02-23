import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="py-4 px-6 md:px-12 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#635bff] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#0a2540]">Credibly</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-sm font-medium text-[#425466] hover:text-[#0a2540] transition-colors">Documentation</a>
          <Link href="/dashboard" className="btn-primary">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full mt-10 md:mt-20">
        <div className="max-w-[1040px] w-full text-center flex flex-col items-center animate-slide-up">

          <h1 className="text-5xl md:text-[80px] font-bold tracking-tighter leading-[1.05] mb-6 text-[#0a2540]">
            Financial-grade <br />
            credential anchoring.
          </h1>

          <p className="text-lg md:text-xl text-[#425466] mb-10 max-w-2xl leading-relaxed">
            The infrastructure to issue, manage, and instantly cryptographically verify B2B records on the world's most performant blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Link href="/dashboard" className="btn-primary text-base px-6 py-3 min-w-[140px]">
              Start now
            </Link>
            <Link href="/verify" className="btn-secondary text-base px-6 py-3 min-w-[140px]">
              Verify a record
            </Link>
          </div>

        </div>

        {/* Diagonal aesthetic line - Stripe inspired */}
        <div className="w-full max-w-6xl mt-24 relative h-64 overflow-hidden">
          <div className="absolute top-10 -left-[10%] w-[120%] h-40 bg-[#f6f9fc] transform -rotate-3 border-t border-[#e2e8f0]"></div>
        </div>
      </main>

      <footer className="py-8 text-center text-[#64748b] text-sm font-medium bg-[#f6f9fc] border-t border-[#e2e8f0]">
        © {new Date().getFullYear()} Credibly. Powered by Solana.
      </footer>
    </div>
  );
}
