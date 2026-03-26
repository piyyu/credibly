import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-6xl font-bold tracking-tight">Credibly</h1>
      <p className="text-xl text-gray-400 text-center max-w-2xl">
        Tamper-proof academic credentials on Solana. Instant verification. Zero fraud.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/dashboard" className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition">
          Institution Dashboard
        </Link>
        <Link href="/wallet" className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition">
          Student Wallet
        </Link>
        <Link href="/verify" className="px-6 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition">
          Verify Credential
        </Link>
      </div>
    </main>
  );
}
