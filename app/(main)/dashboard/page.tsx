import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full">

      <div className="flex-1 flex flex-col gap-8">

        <h1 className="text-2xl font-bold text-[#0a2540] mb-2 tracking-tight">Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="stripe-panel p-6 flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-[#425466]">Network uptime</h3>
                <p className="text-xs text-[#64748b] mt-1">Solana Devnet · 30 Days</p>
              </div>
              <div className="bg-[#e0e7ff] text-[#4f46e5] px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#4f46e5]"></span>
                99.9%
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-16 mt-auto">
              {[40, 65, 45, 80, 60, 30, 85].map((height, i) => (
                <div key={i} className="flex-1 bg-[#f1f5f9] h-full relative group/bar hover:bg-[#e2e8f0] transition-colors cursor-crosshair">
                  <div
                    style={{ height: `${height}%` }}
                    className={`absolute bottom-0 w-full transition-all duration-300 ${i === 6 ? 'bg-[#635bff]' : 'bg-[#cbd5e1] group-hover/bar:bg-[#94a3b8]'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="stripe-panel p-6 flex flex-col justify-center h-48 bg-[#0a2540] border-[#0a2540] text-white relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#635bff] to-transparent opacity-20 transform skew-x-12 translate-x-10 group-hover:translate-x-0 transition-transform duration-500"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white leading-tight mb-2 tracking-tight">Issue a new<br />credential</h2>
              <p className="text-sm text-[#94a3b8] max-w-[80%] mb-4">Securely anchor document hashes on-chain.</p>
            </div>
            <Link href="/issue" className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#e0e7ff] transition-colors w-fit">
              Create now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#0a2540]">Recent activity</h2>
            <button className="text-sm font-medium text-[#635bff] hover:text-[#0a2540]">View all</button>
          </div>

          <div className="stripe-panel overflow-hidden">
            <div className="divide-y divide-[#e2e8f0]">
              {[
                { title: "Corporate Identity Verification", entity: "Acme Corp", status: "anchored", icon: "🏢", date: "Today, 14:02" },
                { title: "Non-Disclosure Agreement", entity: "Legal Dept", status: "anchored", icon: "⚖️", date: "Today, 11:45" },
                { title: "Service Level Agreement", entity: "Client Beta", status: "pending", icon: "📄", date: "Yesterday" },
                { title: "Compliance Audit Record", entity: "SecOps", status: "anchored", icon: "🛡️", date: "Oct 12" },
                { title: "Vendor Onboarding Hash", entity: "Procurement", status: "anchored", icon: "🤝", date: "Oct 10" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 hover:bg-[#f8fafc] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white border border-[#e2e8f0] flex items-center justify-center text-lg shadow-sm">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#0a2540]">{item.title}</h4>
                      <p className="text-[13px] text-[#64748b] mt-0.5">{item.entity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {item.status === 'anchored' ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#dcfce7] text-[#166534] text-xs font-semibold rounded-sm">
                        <span className="w-1.5 h-1.5 bg-[#16a34a] rounded-sm"></span>
                        Anchored
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-[#fef3c7] text-[#92400e] text-xs font-semibold rounded-sm">
                        <span className="w-1.5 h-1.5 bg-[#d97706] rounded-sm"></span>
                        Pending processing
                      </div>
                    )}
                    <div className="text-sm text-[#64748b] w-24 text-right hidden sm:block">
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

        <div className="stripe-panel p-6">
          <h2 className="text-sm font-bold text-[#425466] uppercase tracking-wide mb-4">Total Hashes</h2>
          <div className="text-4xl font-black text-[#0a2540] tracking-tighter">8,492</div>
          <div className="text-sm font-medium text-[#10b981] mt-2 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="m18 15-6-6-6 6" /></svg>
            +124 this week
          </div>
        </div>

        <div className="stripe-panel p-6">
          <h2 className="text-sm font-bold text-[#425466] uppercase tracking-wide mb-4">Contract Details</h2>

          <div className="mb-4">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase mb-1.5">Program ID</div>
            <div className="bg-[#f8fafc] p-2 border border-[#e2e8f0] font-mono text-[11px] text-[#425466] break-all rounded-sm">
              E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="border-t border-[#e2e8f0] pt-3">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase mb-1">Cost / anchor</div>
              <div className="text-sm font-bold text-[#0a2540]">0.0005 SOL</div>
            </div>
            <div className="border-t border-[#e2e8f0] pt-3">
              <div className="text-[11px] font-semibold text-[#64748b] uppercase mb-1">Avg latency</div>
              <div className="text-sm font-bold text-[#0a2540]">~400ms</div>
            </div>
          </div>

          <Link href="/verify" className="btn-secondary w-full text-center hover:bg-[#f8fafc]">
            View Explorer →
          </Link>
        </div>

      </div>

    </div>
  );
}
