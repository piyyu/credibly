"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { QRCodeSVG } from "qrcode.react";
import { hashFile, hashHex } from "@/lib/hash";
import { PROGRAM_IDL, deriveCredentialPDA } from "@/lib/program";

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
    <div className="flex flex-col lg:flex-row gap-6 h-full p-2">

      <div className="flex-1 flex flex-col items-center justify-start pt-10 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl glass-panel p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-solana opacity-[0.03] blur-3xl rounded-full group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>

          <div className="mb-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 mb-4 uppercase tracking-wider">
              <span className="text-[#14F195]">⚡</span> Module 01
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Issue Credential</h2>
            <p className="text-zinc-400 font-medium">Upload a document to securely anchor its SHA-256 footprint onto the Solana blockchain without exposing underlying PII.</p>
          </div>

          <div className="flex flex-col gap-8 relative z-10">
            {/* Step 1 */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">1</div>
              <label className="label-premium flex justify-between items-center mb-4">
                Connect Issuer Wallet
                {wallet.publicKey && <span className="text-[#14F195] text-[10px] px-2 py-0.5 rounded bg-[#14F195]/10 border border-[#14F195]/20">Connected</span>}
              </label>
              {/* Override default wallet button styles inline to match dark theme loosely */}
              <div className="[&_.wallet-adapter-button]:!bg-white/10 [&_.wallet-adapter-button]:!hover:bg-white/20 [&_.wallet-adapter-button]:!h-12 [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-semibold [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-white/10 w-full overflow-hidden rounded-xl">
                <WalletMultiButton />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">2</div>
              <label className="label-premium mb-4">Upload Document (PDF)</label>

              <div className="relative group/upload">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 transition-all duration-300 text-center ${file ? 'border-[#14F195]/50 bg-[#14F195]/5' : 'border-white/10 bg-white/5 group-hover/upload:border-white/30 group-hover/upload:bg-white/10'}`}>

                  {!file ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-4 text-zinc-400 group-hover/upload:text-white group-hover/upload:scale-110 transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                      </div>
                      <div className="text-sm font-bold text-zinc-200 mb-1">Click or drag PDF to upload</div>
                      <div className="text-xs font-medium text-zinc-500">Maximum file size 50MB</div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#14F195]/20 border border-[#14F195]/30 flex items-center justify-center mb-4 text-[#14F195]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </div>
                      <div className="text-sm font-bold text-[#14F195] mb-1 truncate max-w-[200px]">{file.name}</div>
                      <div className="text-xs font-medium text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to hash</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={handleIssue}
                disabled={!file || !wallet.publicKey || ["hashing", "signing", "confirming"].includes(status)}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 ${status === 'success'
                    ? 'bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30'
                    : 'btn-gradient'
                  }`}
              >
                {status === "idle" && (
                  <>
                    Anchor Integrity Hash
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </>
                )}
                {status === "hashing" && "Hashing Document Locally..."}
                {status === "signing" && "Awaiting Wallet Signature..."}
                {status === "confirming" && (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-800 border-t-white animate-spin"></span>
                    Confirming on Solana Devnet...
                  </>
                )}
                {status === "success" && "Successfully Anchored!"}
                {status === "error" && "Transaction Failed - Retry"}
              </button>

              {errorMsg && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-start gap-3">
                  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  {errorMsg}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <aside className="w-full lg:w-96 glass-panel flex flex-col p-8 bg-black/40 border-l border-white/5 rounded-none lg:rounded-[24px]">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Live Status</div>

            {status === 'success' ? (
              <div className="flex items-center gap-2 bg-[#14F195]/10 px-3 py-1.5 rounded-full border border-[#14F195]/20 shadow-[0_0_15px_rgba(20,241,149,0.15)] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></span>
                <span className="text-xs font-bold text-[#14F195]">Cryptographically Anchored</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-xs font-bold text-zinc-400">Awaiting Input Constraints</span>
              </div>
            )}
          </div>
        </div>

        {status === "success" && txSig ? (
          <div className="flex flex-col flex-1 animate-fade-in">

            <div className="mb-8">
              <div className="label-premium">Cryptographic Hash (SHA-256)</div>
              <div className="bg-black/60 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-[#14F195] break-all leading-relaxed shadow-inner">
                {hashResult}
              </div>
            </div>

            <div className="mb-8">
              <div className="label-premium">Solana Explorer</div>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-solana p-1.5 flex items-center justify-center">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[8px] text-white">SOL</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white mb-0.5">View Transaction</div>
                    <div className="text-[10px] text-zinc-400 font-medium font-mono truncate w-32">{txSig}</div>
                  </div>
                </div>
                <svg className="text-zinc-500 group-hover:text-white transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
              </a>
            </div>

            <div className="mt-auto flex flex-col items-center justify-center pt-8 border-t border-white/10">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Verification Matrix</div>
              <div className="p-4 bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 transition-transform duration-500 cursor-crosshair">
                <QRCodeSVG
                  value={JSON.stringify({ hash: hashResult, network: "devnet" })}
                  size={160}
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="text-[10px] font-medium text-zinc-500 mt-4 text-center">Scan with Credibly Verifier Mobile</div>
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            </div>
            <div className="text-sm font-bold text-zinc-400 mb-1">No Active Transaction</div>
            <div className="text-xs text-zinc-500 font-medium max-w-[200px]">Complete the issuance forms to generate blockchain records.</div>
          </div>
        )}
      </aside>

    </div>
  );
}
