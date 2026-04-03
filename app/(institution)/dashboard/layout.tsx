import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/issue", label: "Issue Credentials" },
  { href: "/dashboard/revoke", label: "Revoke" },
  { href: "/dashboard/logs", label: "Audit Logs" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <aside className="w-60 border-r border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-lg font-bold mb-4 text-green-400">Credibly</h2>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className="px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition text-sm">
            {item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
