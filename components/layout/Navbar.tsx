"use client";
import Link from "next/link";
import { ClientWalletButton } from "@/components/wallet/ClientWalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCrediblyProgram, getInstitutionPDA } from "@/lib/solana/client";
import { useEffect, useState } from "react";
import { GraduationCap, Shield } from "lucide-react";

export function Navbar() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  const [role, setRole] = useState<"student" | "institution" | "unknown">("unknown");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (!publicKey || !program) {
        setRole("unknown");
        return;
      }
      setChecking(true);
      try {
        const [pda] = getInstitutionPDA(publicKey);
        const acc = await program.account.institutionAccount.fetch(pda);
        if (acc) {
          setRole("institution");
        } else {
          setRole("student");
        }
      } catch (err) {
        // If fetch fails (account doesn't exist), they are a student
        setRole("student");
      } finally {
        setChecking(false);
      }
    }
    checkRole();
  }, [publicKey, program]);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-gray-900">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">Credibly</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {!publicKey ? (
            <span className="text-sm text-gray-500 px-4">Connect wallet to view menu</span>
          ) : checking ? (
            <span className="text-sm text-gray-400 px-4 animate-pulse">Verifying Identity...</span>
          ) : role === "institution" ? (
            <>
              <div className="mr-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold tracking-wider rounded border border-emerald-200 flex items-center gap-1">
                <Shield className="w-3 h-3" /> Partner Institution
              </div>
              <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Dashboard</Link>
              <Link href="/dashboard/issue" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Issue Credentials</Link>
            </>
          ) : role === "student" ? (
            <>
              <div className="mr-3 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-wider rounded border border-blue-200 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Student
              </div>
              <Link href="/wallet" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">My Wallet</Link>
              <Link href="/verify" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">Verify</Link>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <ClientWalletButton className="!bg-gray-900 hover:!bg-gray-800 !text-white !font-medium !rounded-lg !h-9 !text-sm !px-4 transition-all" />
        </div>
      </div>
    </nav>
  );
}
