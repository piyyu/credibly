"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, ShieldAlert, ScrollText } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/issue", label: "Issue Credentials", icon: Send },
  { href: "/dashboard/revoke", label: "Revoke", icon: ShieldAlert },
  { href: "/dashboard/logs", label: "Audit Logs", icon: ScrollText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-2 relative z-10 hidden md:flex">
        <h2 className="text-xs font-bold uppercase tracking-widest mb-6 text-gray-500 pl-3">Institution Panel</h2>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative group">
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </aside>
      <main className="flex-1 overflow-y-auto relative z-10 scrollbar-hide">
        {children}
      </main>
    </div>
  );
}
