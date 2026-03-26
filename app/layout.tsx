import "./globals.css";
import type { Metadata } from "next";
import { WalletProviders } from "@/components/wallet/WalletProviders";
import { QueryProvider } from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Credibly — Decentralized Academic Credentials",
  description: "Blockchain-powered credential verification on Solana",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <WalletProviders>{children}</WalletProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
