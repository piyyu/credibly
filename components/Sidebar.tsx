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
    <aside className="w-64 h-full glass-panel flex flex-col justify-between p-6">
      <div>
        <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-gradient-solana flex items-center justify-center shadow-glow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="#07070a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Credibly</span>
        </Link>

        <nav className="flex flex-col gap-2">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/5"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
              >
                <span className={isActive ? "text-[#14F195]" : "opacity-60"}>{link.icon}</span>
                {link.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#14F195] shadow-[0_0_8px_#14F195]"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
            AD
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Registry Admin</div>
            <div className="text-xs text-[#14F195] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-pulse"></span>
              Connected
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
