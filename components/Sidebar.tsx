"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/issue", label: "Issue Credential", icon: "⚡" },
    { href: "/verify", label: "Verify Explorer", icon: "🔍" },
  ];

  return (
    <aside className="w-64 h-full bg-[#151515] border-r border-[#262626] flex flex-col justify-between p-6 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20 relative">
      <div>
        <Link href="/" className="flex items-center gap-3 mb-10 px-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Credibly</span>
        </Link>

        <nav className="flex flex-col gap-2">
          <div className="text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-2 px-2">Navigation</div>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
                  ? "bg-[#3b82f6]/10 text-white border-l-2 border-[#3b82f6]"
                  : "text-[#a3a3a3] border-l-2 border-transparent hover:bg-[#262626] hover:text-white"
                  }`}
              >
                <span className={isActive ? "text-[#3b82f6]" : "text-[#737373]"}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-[#262626]">
        <div className="flex items-center gap-3 p-3 bg-[#000000] border border-[#262626] hover:border-[#3b82f6]/50 cursor-pointer transition-colors shadow-inner">
          <div className="w-10 h-10 bg-[#262626] flex items-center justify-center text-xs font-bold text-white border border-[#3f3f46]">
            AD
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Registry Admin</div>
            <div className="text-[11px] text-[#3b82f6] font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]"></span>
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
