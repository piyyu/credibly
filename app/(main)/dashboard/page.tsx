import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">

      <div className="flex-1 flex flex-col gap-8">

        <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-2 border-l-4 border-[#3b82f6] pl-4">Operations Interface</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="stripe-panel bg-[#151515] p-6 flex flex-col justify-between h-48 border-t-2 border-t-[#3b82f6]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest">Network Synchrony</h3>
                <p className="text-[10px] text-[#737373] mt-1 uppercase">Solana Devnet Cluster</p>
              </div>
              <div className="bg-[#0a0a0a] text-[#3b82f6] px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-[#262626] flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <span className="w-1.5 h-1.5 bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]"></span>
                99.9% Uptime
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-16 mt-auto">
              {[40, 65, 45, 80, 60, 30, 85].map((height, i) => (
                <div key={i} className="flex-1 bg-[#262626] h-full relative group/bar hover:bg-[#3f3f46] transition-colors cursor-crosshair">
                  <div
                    style={{ height: `${height}%` }}
                    className={`absolute bottom-0 w-full transition-all duration-300 ${i === 6 ? 'bg-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-[#737373] group-hover/bar:bg-[#a3a3a3]'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="stripe-panel p-6 flex flex-col justify-center h-48 bg-[#0a0a0a] border-[#3b82f6] border-2 text-white relative overflow-hidden group shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
            {/* Geometric Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            <div className="relative z-10 w-full flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-tighter uppercase">Initialize<br />Hash Matrix</h2>
                <p className="text-xs text-[#a3a3a3] font-mono mb-4">Target: Solana Native Layer</p>
              </div>
              <Link href="/issue" className="relative z-10 inline-flex items-center gap-3 text-sm font-black text-[#0a0a0a] bg-white px-6 py-3 hover:bg-[#3b82f6] hover:text-white transition-all uppercase tracking-widest border border-transparent hover:border-white">
                Execute
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-4">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-sm font-bold text-[#a3a3a3] uppercase tracking-widest border-b border-[#262626] pb-2 w-full flex justify-between">
              <span>Blockchain Event Log</span>
              <button className="text-[#3b82f6] hover:text-white transition-colors">Query Full Ledger</button>
            </h2>
          </div>

          <div className="stripe-panel overflow-hidden bg-[#151515]">
            <div className="divide-y divide-[#262626]">
              {[
                { title: "Corporate Identity Verification", entity: "Acme Corp", status: "anchored", icon: "🏢", date: "Epoch 4A2B" },
                { title: "Non-Disclosure Agreement", entity: "Legal Dept", status: "anchored", icon: "⚖️", date: "Epoch 4A2C" },
                { title: "Service Level Agreement", entity: "Client Beta", status: "pending", icon: "📄", date: "Processing" },
                { title: "Compliance Audit Record", entity: "SecOps", status: "anchored", icon: "🛡️", date: "Epoch 3B1F" },
                { title: "Vendor Onboarding Hash", entity: "Procurement", status: "anchored", icon: "🤝", date: "Epoch 3B1A" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-[#0a0a0a] transition-colors cursor-pointer group border-l-2 border-transparent hover:border-[#3b82f6]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0a0a0a] border border-[#262626] flex items-center justify-center text-lg shadow-[inset_0_0_10px_rgba(0,0,0,1)] group-hover:border-[#3b82f6]/50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-[11px] text-[#737373] mt-1 font-mono">{item.entity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {item.status === 'anchored' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#262626] text-[#a3a3a3] text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-[#22c55e] shadow-[0_0_8px_#22c55e]"></span>
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border border-[#eab308]/30 text-[#eab308] text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-1 h-2 bg-[#eab308] animate-pulse"></span>
                        Pending
                      </div>
                    )}
                    <div className="text-[10px] text-[#737373] w-24 text-right font-mono hidden sm:block">
                      {item.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Side Panel for Stats */}
      <div className="w-full xl:w-80 flex flex-col gap-6">

        <div className="stripe-panel bg-[#151515] p-6 text-center border-t-2 border-t-[#3b82f6]">
          <h2 className="text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-4">Total Hashes Verified</h2>
          <div className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">8,492</div>
          <div className="text-[11px] font-bold text-[#3b82f6] mt-4 flex items-center justify-center gap-2 uppercase tracking-widest bg-[#0a0a0a] py-2 border border-[#262626]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="m18 15-6-6-6 6" /></svg>
            Delta +124
          </div>
        </div>

        <div className="stripe-panel bg-[#151515] p-6">
          <h2 className="text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-6">Execution Parameters</h2>

          <div className="mb-6">
            <div className="text-[10px] font-bold text-[#a3a3a3] uppercase mb-2 tracking-wider">Program Address</div>
            <div className="bg-[#000000] p-3 border border-[#262626] font-mono text-[10px] text-[#737373] break-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0a0a0a] border border-[#262626] p-4 text-center">
              <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Sys Cost</div>
              <div className="text-sm font-bold text-[#3b82f6] font-mono">.0005<span className="text-xs text-[#737373]">SOL</span></div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#262626] p-4 text-center">
              <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Latency</div>
              <div className="text-sm font-bold text-white font-mono">~400ms</div>
            </div>
          </div>

          <Link href="/verify" className="w-full bg-[#3b82f6] text-[#0a0a0a] font-bold text-xs uppercase tracking-widest py-4 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-white transition-all">
            Access Explorer Engine
          </Link>
        </div>

      </div>

    </div>
  );
}
