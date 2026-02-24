"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletBadge } from "@/components/ui/WalletBadge";
import { NetworkSelector } from "@/components/ui/NetworkSelector";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="dash-header">
      <Link href="/" className="dash-logo">
        <span className="logo-icon">C</span>
        Credibly
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
        <Link
          href="/my-credentials"
          className={`dash-nav-item ${pathname === "/my-credentials" ? "active" : ""}`}
        >
          My Credentials
        </Link>
      </nav>

      <div className="header-right">
        <NetworkSelector />
        <WalletBadge />
      </div>
    </header>
  );
}
