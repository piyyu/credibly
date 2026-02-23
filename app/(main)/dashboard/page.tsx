import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-2">

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 pb-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#14F195]/10 rounded-full blur-2xl group-hover:bg-[#14F195]/20 transition-all duration-500"></div>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-1">Network Reliability</h3>
                <p className="text-xs text-zinc-500 font-medium">Last 30 Days (Solana Devnet)</p>
              </div>
              <div className="bg-[#14F195]/10 text-[#14F195] px-3 py-1 rounded-full text-xs font-bold border border-[#14F195]/20 shadow-[0_0_10px_rgba(20,241,149,0.1)] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse"></span>
                99.9%
              </div>
            </div>

            <div className="flex items-end gap-3 h-28 pt-4 relative z-10">
              {[40, 65, 45, 80, 60, 30, 85].map((height, i) => (
                <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative h-full group/bar overflow-hidden">
                  <div
                    style={{ height: `${height}%` }}
                    className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${i === 4 ? 'bg-gradient-solana' : 'bg-white/20 group-hover/bar:bg-white/40'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 relative overflow-hidden group bg-gradient-to-br from-zinc-900/80 to-black flex flex-col justify-between border-white/10 hover:border-white/20 transition-all">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-solana opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity duration-700"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">Issue Secure<br />Credentials</h2>
              <p className="text-sm text-zinc-400 font-medium max-w-[80%]">Anchor document hashes instantly on the Solana blockchain.</p>
            </div>
            <Link href="/issue" className="relative z-10 mt-6 btn-gradient w-fit inline-flex items-center gap-2 text-sm">
              Launch Issuer Module
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>

        <div className="glass-panel flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-[#14F195]">⚡</span> Recent Transactions
            </h3>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-white/10 text-white shadow-sm">All</button>
              <button className="px-4 py-1.5 text-xs font-bold rounded-md text-zinc-500 hover:text-zinc-300">Verified</button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2 overflow-y-auto">
            {[
              { title: "Corporate Identity Verification", entity: "Acme Corp", status: "anchored", icon: "🏢" },
              { title: "Non-Disclosure Agreement", entity: "Legal Dept", status: "anchored", icon: "⚖️" },
              { title: "Service Level Agreement", entity: "Client Beta", status: "pending", icon: "📄" },
              { title: "Compliance Audit Record", entity: "SecOps", status: "anchored", icon: "🛡️" },
              { title: "Vendor Onboarding Hash", entity: "Procurement", status: "anchored", icon: "🤝" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:border-white/20 transition-all">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-zinc-100 mb-0.5">{item.title}</h4>
                  <p className="text-xs text-zinc-500 font-medium">{item.entity}</p>
                </div>
                <div>
                  {item.status === 'anchored' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14F195]/10 border border-[#14F195]/20 text-[#14F195] text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#14F195]"></span>
                      Anchored
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 group-hover:text-white group-hover:bg-white/10 transition-all">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="w-full lg:w-80 glass-panel p-6 flex flex-col bg-zinc-950/50 block">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Network Status</div>
            <div className="flex items-center gap-2 bg-[#14F195]/10 px-3 py-1 rounded-full border border-[#14F195]/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_8px_#14F195]"></span>
              <span className="text-xs font-bold text-[#14F195]">Devnet Active</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Total Hashes</div>
          <div className="text-5xl font-black text-white tracking-tighter">8,492</div>
          <div className="text-xs font-bold text-[#14F195] mt-2 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
            +124 this epoch
          </div>
        </div>

        <div className="mb-auto">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Program Address</div>
          <div className="bg-black/60 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-zinc-400 break-all leading-relaxed shadow-inner">
            E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6 mb-6">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Avg Cost</div>
            <div className="text-sm font-bold text-white">0.0005 SOL</div>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Latency</div>
            <div className="text-sm font-bold text-white">~400ms</div>
          </div>
        </div>

        <Link href="/verify" className="w-full py-4 bg-white text-black font-bold text-sm rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Access Explorer
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      </div>

    </div>
  );
}
