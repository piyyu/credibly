"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletBadge } from "@/components/ui/WalletBadge";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="dash-header">
      <Link href="/" className="dash-logo">
        Credibly©
      </Link>

      <nav className="dash-nav">
        <Link
          href="/dashboard"
          className={`dash-nav-item ${pathname === "/dashboard" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          href="/issue"
          className={`dash-nav-item ${pathname === "/issue" ? "active" : ""}`}
        >
          Issue
        </Link>
        <Link
          href="/verify"
          className={`dash-nav-item ${pathname === "/verify" ? "active" : ""}`}
        >
          Verify
        </Link>
      </nav>

      <WalletBadge />
    </header>
  );
}
