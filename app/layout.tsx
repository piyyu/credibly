import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WalletProviders } from "@/components/wallet/WalletProviders";
import { QueryProvider } from "@/components/QueryProvider";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

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
            <Navbar />

            <main className="flex-1 flex flex-col">{children}</main>

            <footer className="border-t border-gray-100 bg-white">
              <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">C</span>
                      </div>
                      <span className="text-base font-semibold text-gray-900">Credibly</span>
                    </div>
                    <p className="text-sm text-gray-400 max-w-xs">Trust infrastructure for global education-to-employment, built on Solana.</p>
                  </div>
                  <div className="flex gap-16 text-sm">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Platform</h4>
                      <Link href="/dashboard" className="block text-gray-500 hover:text-gray-700 transition-colors">Dashboard</Link>
                      <Link href="/verify" className="block text-gray-500 hover:text-gray-700 transition-colors">Verify</Link>
                      <Link href="/wallet" className="block text-gray-500 hover:text-gray-700 transition-colors">Wallet</Link>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">Resources</h4>
                      <a href="https://docs.solana.com" target="_blank" rel="noreferrer" className="block text-gray-500 hover:text-gray-700 transition-colors">Solana Docs</a>
                      <a href="https://www.w3.org/TR/vc-data-model/" target="_blank" rel="noreferrer" className="block text-gray-500 hover:text-gray-700 transition-colors">W3C VC Spec</a>
                    </div>
                  </div>
                </div>
                <div className="mt-10 pt-6 border-t border-gray-100 text-xs text-gray-400">
                  &copy; {new Date().getFullYear()} Credibly. All rights reserved.
                </div>
              </div>
            </footer>
          </WalletProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
