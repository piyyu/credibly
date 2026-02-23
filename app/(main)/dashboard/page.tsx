import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="flex flex-col xl:flex-row gap-10 h-full pb-10">

      <div className="flex-1 flex flex-col gap-10">

        <header className="mb-2">
          <h1 className="text-[28px] font-serif font-medium text-[#1C1C1E] tracking-tight mb-2">Systems Overview</h1>
          <p className="text-[#8A8985] text-[15px]">Monitoring programmatic footprint anchors on the Solana layer.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="stripe-panel p-8 flex flex-col justify-between h-56 bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-[#1C1C1E] uppercase tracking-widest mb-1">Network Synchrony</h3>
                <p className="text-[12px] text-[#8A8985]">Devnet Cluster</p>
              </div>
              <div className="bg-[#FAF9F6] text-[#D95C41] px-3 py-1 text-[11px] font-medium border border-[#E8E6DF] rounded-full flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#D95C41] rounded-full"></span>
                99.9%
              </div>
            </div>

            <div className="flex items-end gap-2 h-20 mt-auto">
              {[40, 65, 45, 80, 60, 30, 85].map((height, i) => (
                <div key={i} className="flex-1 bg-[#F4F2EC] h-full relative group/bar hover:bg-[#E8E6DF] transition-colors rounded-t-sm overflow-hidden">
                  <div
                    style={{ height: `${height}%` }}
                    className={`absolute bottom-0 w-full transition-all duration-300 rounded-t-sm ${i === 6 ? 'bg-[#D95C41]' : 'bg-[#D9D7D0] group-hover/bar:bg-[#C0BEB8]'}`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="stripe-panel p-8 flex flex-col justify-center h-56 bg-[#1C1C1E] border-transparent text-[#FAF9F6] relative overflow-hidden group">

            <div className="relative z-10 w-full flex flex-col justify-between h-full">
              <div>
                <h2 className="text-[22px] font-serif font-medium text-[#FAF9F6] leading-tight mb-3">Initialize<br />Hash Matrix</h2>
                <p className="text-[13px] text-[#A6A5A3] font-light max-w-[80%]">Substrate payload generation layer.</p>
              </div>
              <div className="mt-auto">
                <Link href="/issue" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#FAF9F6] border-b border-[#FAF9F6]/30 pb-1 hover:border-[#FAF9F6] transition-all w-fit">
                  Execute Request
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] font-medium text-[#1C1C1E]">Recent Activity</h2>
            <button className="text-[14px] font-medium text-[#8A8985] hover:text-[#1C1C1E] transition-colors">View All</button>
          </div>

          <div className="stripe-panel overflow-hidden bg-white">
            <div className="divide-y divide-[#F4F2EC]">
              {[
                { title: "Corporate Identity Verification", entity: "Acme Corp", status: "anchored", icon: "❖", date: "Today" },
                { title: "Non-Disclosure Agreement", entity: "Legal Dept", status: "anchored", icon: "⚲", date: "Today" },
                { title: "Service Level Agreement", entity: "Client Beta", status: "pending", icon: "☉", date: "Processing" },
                { title: "Compliance Audit Record", entity: "SecOps", status: "anchored", icon: "⎔", date: "Yesterday" }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 hover:bg-[#FAF9F6] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-[#FAF9F6] rounded-full flex items-center justify-center text-[18px] text-[#8A8985] group-hover:text-[#D95C41] transition-colors border border-[#E8E6DF]">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-medium text-[#1C1C1E]">{item.title}</h4>
                      <p className="text-[12px] text-[#8A8985] mt-1">{item.entity}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {item.status === 'anchored' ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#F4F2EC] text-[#49494B] text-[11px] font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#4B8B67] rounded-full"></span>
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-[#FDF8F3] text-[#D95C41] text-[11px] font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#D95C41] animate-pulse rounded-full"></span>
                        Pending processing
                      </div>
                    )}
                    <div className="text-[12px] text-[#8A8985] w-20 text-right hidden sm:block">
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
      <div className="w-full xl:w-80 flex flex-col gap-6 pt-2">

        <div className="stripe-panel p-8 bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E8E6DF]">
          <h2 className="text-[12px] font-medium text-[#8A8985] uppercase tracking-widest mb-6">Total Operations</h2>
          <div className="text-[44px] font-serif text-[#1C1C1E] tracking-tight leading-none mb-4">8,492</div>
          <div className="text-[12px] font-medium text-[#4B8B67] flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
            Volume +124
          </div>
        </div>

        <div className="stripe-panel p-8 bg-white border-none shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E8E6DF]">
          <h2 className="text-[12px] font-medium text-[#8A8985] uppercase tracking-widest mb-6">Execution Parameters</h2>

          <div className="mb-8">
            <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2">Program Node</div>
            <div className="bg-[#FAF9F6] p-3 rounded-lg border border-[#E8E6DF] font-mono text-[11px] text-[#49494B] break-all">
              E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-1">Cost Ratio</div>
              <div className="text-[15px] font-medium text-[#1C1C1E]">.0005<span className="text-[11px] text-[#8A8985] ml-1">SOL</span></div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-1">Latency</div>
              <div className="text-[15px] font-medium text-[#1C1C1E]">~400ms</div>
            </div>
          </div>

          <Link href="/verify" className="w-full text-center text-[13px] font-medium text-[#49494B] border border-[#E8E6DF] py-3 rounded-full hover:bg-[#FAF9F6] transition-colors inline-block">
            Access Explorer Engine
          </Link>
        </div>

      </div>

    </div>
  );
}
