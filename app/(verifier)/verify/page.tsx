"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold">Verify a Credential</h1>
      <p className="text-gray-400">Enter a credential hash or scan a student's QR code</p>
      <div className="flex gap-3 w-full max-w-lg">
        <input type="text" placeholder="Credential hash (hex)..."
          value={hash} onChange={(e) => setHash(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500" />
        <button onClick={() => router.push(`/verify/${hash}`)} disabled={!hash}
          className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 disabled:opacity-50 transition">
          Verify
        </button>
      </div>
    </div>
  );
}
