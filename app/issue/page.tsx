"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { QRCodeSVG } from "qrcode.react";
import { hashFile, hashHex } from "@/lib/hash";
import { PROGRAM_ID, PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program";

export default function IssuePage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "hashing" | "signing" | "confirming" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txSig, setTxSig] = useState("");
  const [hashResult, setHashResult] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setTxSig("");
      setHashResult("");
      setErrorMsg("");
    }
  };

  const handleIssue = async () => {
    if (!file) return;
    if (!wallet.publicKey || !wallet.signTransaction) {
      setErrorMsg("Wallet not connected");
      return;
    }

    try {
      setStatus("hashing");
      const hashBuffer = await hashFile(file);
      const hex = await hashHex(file);
      setHashResult(hex);

      setStatus("signing");
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        AnchorProvider.defaultOptions()
      );
      const program = new Program(PROGRAM_IDL, provider);

      const pda = deriveCredentialPDA(hashBuffer);

      // Using anchor program to fetch if PDA already exists
      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo) {
        throw new Error("Credential hash already registered.");
      }

      const hashArray = Array.from(hashBuffer);

      const tx = await program.methods
        .issueCredential(hashArray)
        .accountsPartial({
          credential: pda,
          issuer: wallet.publicKey,
        })
        .rpc();

      setStatus("confirming");
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        ...latestBlockhash,
      });

      setTxSig(tx);
      setStatus("success");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred");
      setStatus("error");
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Issue Credential</h1>

      <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold text-gray-700">1. Connect Issuer Wallet</span>
            <WalletMultiButton />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-700">2. Upload PDF Credential</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <button
            onClick={handleIssue}
            disabled={!file || !wallet.publicKey || status === "hashing" || status === "signing" || status === "confirming"}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {status === "idle" && "Issue Credential"}
            {status === "hashing" && "Hashing Document..."}
            {status === "signing" && "Awaiting Wallet Signature..."}
            {status === "confirming" && "Confirming on Solana..."}
            {status === "success" && "Credential Issued!"}
            {status === "error" && "Try Again"}
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {status === "success" && txSig && (
        <div className="w-full bg-white p-8 rounded-xl shadow-sm border border-green-200 flex flex-col items-center text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Stored Successfully</h2>
          <p className="text-sm text-gray-500 mb-6">The credential hash has been permanently anchored to Solana Devnet.</p>

          <div className="bg-gray-50 p-4 rounded-lg w-full text-left mb-6 overflow-hidden">
            <p className="text-xs text-gray-400 font-mono mb-1">Transaction Signature</p>
            <a href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs break-all block mb-3">
              {txSig}
            </a>

            <p className="text-xs text-gray-400 font-mono mb-1">SHA-256 Hash</p>
            <p className="text-xs text-gray-800 break-all font-mono">{hashResult}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border mb-4">
            <QRCodeSVG
              value={JSON.stringify({ hash: hashResult, network: "devnet" })}
              size={200}
            />
          </div>
          <p className="text-xs text-gray-500">Provide this QR code to the student for verification.</p>
        </div>
      )}
    </main>
  );
}
