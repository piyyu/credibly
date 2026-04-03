"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, ShieldAlert, ScrollText } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/issue", label: "Issue Credentials", icon: Send },
  { href: "/dashboard/revoke", label: "Revoke", icon: ShieldAlert },
  { href: "/dashboard/logs", label: "Audit Logs", icon: ScrollText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-1">
      <aside className="w-60 border-r border-gray-100 bg-white p-4 flex-col gap-1 hidden md:flex">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-4 mt-2">Institution Panel</h2>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50/50">{children}</main>
    </div>
  );
}
