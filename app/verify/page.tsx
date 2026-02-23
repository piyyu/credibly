"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Html5QrcodeScanner } from "html5-qrcode";
import { PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program";
import { hexToUint8Array } from "@/lib/hash";

export default function VerifyPage() {
  const { connection } = useConnection();
  const [hashInput, setHashInput] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "valid" | "revoked" | "not_found" | "error">("idle");
  const [scanActive, setScanActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (scanActive) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
      );
      scanner.render((decodedText) => {
        scanner?.clear();
        setScanActive(false);
        try {
          const parsed = JSON.parse(decodedText);
          if (parsed.hash) {
            setHashInput(parsed.hash);
            verifyHash(parsed.hash);
          }
        } catch {
          // Fallback to raw string if it's just a hash
          setHashInput(decodedText);
          verifyHash(decodedText);
        }
      }, (error) => {
        // Ignore scan errors, it happens continuously during scanning
      });
    }

    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [scanActive]);

  const handleVerifyClick = () => {
    verifyHash(hashInput);
  };

  const verifyHash = async (hashHex: string) => {
    if (!hashHex) return;
    setStatus("verifying");
    setErrorMsg("");

    try {
      const hashBuffer = hexToUint8Array(hashHex);
      let pda: any;

      try {
        pda = deriveCredentialPDA(hashBuffer);
      } catch (err: any) {
        throw new Error(err.message || "Invalid hash format");
      }

      // Read-only provider setup
      const provider = new AnchorProvider(
        connection,
        { publicKey: pda, signTransaction: async () => { throw new Error("Read only") }, signAllTransactions: async () => { throw new Error("Read only") } } as any,
        AnchorProvider.defaultOptions()
      );
      const program = new Program(PROGRAM_IDL, provider);

      try {
        const account = await (program.account as any).credential.fetch(pda);
        if (account.revoked) {
          setStatus("revoked");
        } else {
          setStatus("valid");
        }
      } catch (err: any) {
        if (err.message.includes("Account does not exist") || err.message.includes("AccountInfo not found")) {
          setStatus("not_found");
        } else {
          throw err;
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Invalid hash format or network error.");
      setStatus("error");
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-8 max-w-xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-8">Verify Credential</h1>

      <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6">

        {scanActive ? (
          <div className="w-full border rounded-lg overflow-hidden bg-gray-50">
            <div id="reader"></div>
            <button onClick={() => setScanActive(false)} className="w-full py-3 bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300">
              Cancel Scanner
            </button>
          </div>
        ) : (
          <button onClick={() => setScanActive(true)} className="w-full py-16 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 hover:border-gray-400 font-medium flex flex-col items-center justify-center gap-2 transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Scan QR Code
          </button>
        )}

        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Paste Credential Hash (Hex)</label>
          <input
            type="text"
            placeholder="e.g. 8a4b..."
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value.trim())}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 font-mono text-sm"
          />
        </div>

        <button
          onClick={handleVerifyClick}
          disabled={!hashInput || status === "verifying"}
          className="w-full py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {status === "verifying" ? "Verifying On-Chain..." : "Verify Hash"}
        </button>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {status === "valid" && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg flex flex-col items-center border border-green-200 animate-slide-up">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-green-800">Valid Credential</h3>
            <p className="text-green-700 text-sm mt-1 text-center">This credential hash is permanently anchored on Solana and has not been revoked.</p>
          </div>
        )}

        {status === "revoked" && (
          <div className="mt-4 p-6 bg-orange-50 rounded-lg flex flex-col items-center border border-orange-200 animate-slide-up">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-orange-800">Revoked</h3>
            <p className="text-orange-700 text-sm mt-1 text-center">This credential is formally registered but has been revoked by the issuing institution.</p>
          </div>
        )}

        {status === "not_found" && (
          <div className="mt-4 p-6 bg-red-50 rounded-lg flex flex-col items-center border border-red-200 animate-slide-up">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-red-800">Not Found</h3>
            <p className="text-red-700 text-sm mt-1 text-center">No record of this credential hash exists on the Solana Devnet registry.</p>
          </div>
        )}

      </div>
    </main>
  );
}
