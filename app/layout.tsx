import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Credibly© — Tamper-Proof Academic Credentials",
  description:
    "Blockchain-anchored academic credential verification on Solana. Issue, anchor, and verify credentials with cryptographic proof.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
