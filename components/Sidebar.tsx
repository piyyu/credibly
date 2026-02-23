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
    <aside className="w-56 h-full bg-white border-r border-[#e2e8f0] flex flex-col justify-between py-6 px-4">
      <div>
        <Link href="/" className="flex items-center gap-2 mb-8 px-2 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 bg-[#0a2540] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 17L12 22L22 17" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
              <path d="M2 12L12 17L22 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0a2540]">Credibly</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${isActive
                  ? "bg-[#f3f4f6] text-[#0a2540] font-semibold"
                  : "text-[#425466] hover:bg-[#f8fafc] hover:text-[#0a2540]"
                  }`}
              >
                <span className={isActive ? "text-[#635bff]" : "text-[#94a3b8]"}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-[#e2e8f0]">
        <div className="flex items-center gap-3 p-2 hover:bg-[#f8fafc] cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-[#e2e8f0] flex items-center justify-center text-xs font-bold text-[#0a2540]">
            AD
          </div>
          <div>
            <div className="text-sm font-semibold text-[#0a2540] leading-tight">Registry Admin</div>
            <div className="text-[11px] text-[#64748b] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#10b981]"></span>
              Connected
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
