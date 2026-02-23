import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center max-w-2xl">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Credibly MVP</h1>
      <p className="text-xl text-gray-600 mb-8 font-light">
        A minimal blockchain credential verification system built on Solana
        Devnet
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link
          href="/issue"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Issue Credential
        </Link>
        <Link
          href="/verify"
          className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          Verify Credential
        </Link>
      </div>

      <div className="mt-16 text-left w-full border-t pt-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2">How it works</h2>
        <ol className="list-decimal list-inside text-gray-600 text-sm space-y-2">
          <li>Upload your PDF</li>
          <li>A SHA-256 Hash is generated client side</li>
          <li>The Hash is stored on Solana Devnet and approved via Wallet</li>
          <li>A QR code is generated for verification</li>
          <li>Anyone can scan the QR to verify authenticity instantly</li>
        </ol>
      </div>
    </main>
  );
}
