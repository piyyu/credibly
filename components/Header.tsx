"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header>
      <Link href="/" className="brand">
        <div className="brand-dot"></div>
        Credibly
      </Link>

      <nav className="nav-pills">
        <Link href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>Dashboard</Link>
        <Link href="/issue" className={`nav-item ${pathname === '/issue' ? 'active' : ''}`}>Issuance</Link>
        <Link href="/verify" className={`nav-item ${pathname === '/verify' ? 'active' : ''}`}>Verifier</Link>
      </nav>

      <div className="user-profile">
        Registry Admin
        <div className="avatar">AD</div>
      </div>
    </header>
  );
}
