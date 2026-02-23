"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: "❖" },
    { href: "/issue", label: "Issue Credential", icon: "⚲" },
    { href: "/verify", label: "Verify Explorer", icon: "☉" },
  ];

  return (
    <aside className="w-64 h-full bg-[#FAF9F6] border-r border-[#E8E6DF] flex flex-col justify-between p-8 z-20 relative">
      <div>
        <Link href="/" className="flex items-center gap-3 mb-12 px-2 hover:opacity-70 transition-opacity">
          <span className="text-2xl font-serif text-[#1C1C1E] tracking-tight">Credibly</span>
        </Link>

        <nav className="flex flex-col gap-2">
          <div className="text-[11px] font-medium text-[#8A8985] uppercase tracking-widest mb-3 px-2">Menu</div>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 px-4 py-3 text-[15px] rounded-lg transition-all ${isActive
                    ? "bg-[#E8E6DF]/50 text-[#1C1C1E] font-medium"
                    : "text-[#49494B] hover:bg-[#F4F2EC] hover:text-[#1C1C1E]"
                  }`}
              >
                <span className={isActive ? "text-[#D95C41] text-lg" : "text-[#8A8985] text-lg"}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-6 border-t border-[#E8E6DF]">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F2EC] cursor-pointer transition-colors pt-2 pb-2">
          <div className="w-9 h-9 bg-[#E8E6DF] rounded-full flex items-center justify-center text-xs font-serif text-[#1C1C1E]">
            AD
          </div>
          <div>
            <div className="text-sm font-medium text-[#1C1C1E] leading-tight">Registry Admin</div>
            <div className="text-[12px] text-[#8A8985] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#D95C41] rounded-full"></span>
              Connected
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
