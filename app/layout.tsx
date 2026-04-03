import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProviders } from "@/components/wallet/WalletProviders";
import { QueryProvider } from "@/components/QueryProvider";
import Link from "next/link";
import { ClientWalletButton } from "@/components/wallet/ClientWalletButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans-apply" });

export const metadata: Metadata = {
  title: "Credibly — Trusted Academic Credentials",
  description: "Secure, tamper-proof academic verification powered by Solana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased flex flex-col min-h-screen">
        <QueryProvider>
          <WalletProviders>
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-black text-xs font-black">C</span>
                  </div>
                  Credibly
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition">Dashboard</Link>
                  <Link href="/wallet" className="text-sm font-medium text-gray-300 hover:text-white transition">Wallet</Link>
                  <Link href="/verify" className="text-sm font-medium text-gray-300 hover:text-white transition">Verify</Link>
                  <ClientWalletButton className="!bg-emerald-500 hover:!bg-emerald-400 !text-black !font-semibold !rounded-lg !h-10 transition-all border border-transparent hover:border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                </div>
              </div>
            </nav>
            <main className="flex-1 flex flex-col">{children}</main>
            <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/10 mt-auto">
              <p>&copy; {new Date().getFullYear()} Credibly. Built on Solana.</p>
            </footer>
          </WalletProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
