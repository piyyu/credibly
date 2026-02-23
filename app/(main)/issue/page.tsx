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
    <div className="flex flex-col xl:flex-row gap-8 h-full">

      <div className="flex-1 flex flex-col items-center justify-start pt-6 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl stripe-panel p-8 md:p-12 relative overflow-hidden">

          <div className="mb-10">
            <div className="text-xs font-bold text-[#635bff] mb-2 uppercase tracking-wide">
              Credential Issuance
            </div>
            <h2 className="text-3xl font-bold text-[#0a2540] tracking-tight mb-3">Anchor a document</h2>
            <p className="text-[#425466] font-medium leading-relaxed">Securely fingerprint a document's SHA-256 hash onto the Solana ledger without exposing any underlying contents.</p>
          </div>

          <div className="flex flex-col gap-6">

            {/* Step 1 */}
            <div className="pt-2">
              <label className="label-premium flex justify-between items-center mb-3">
                1. Connect authorization wallet
                {wallet.publicKey && <span className="text-[#10b981] text-[11px] font-bold">● Connected</span>}
              </label>

              <div className={`[&_.wallet-adapter-button]:!bg-white [&_.wallet-adapter-button]:!text-[#0a2540] [&_.wallet-adapter-button]:!hover:bg-[#f8fafc] [&_.wallet-adapter-button]:!h-12 [&_.wallet-adapter-button]:!rounded-none [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-semibold [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-[#e2e8f0] [&_.wallet-adapter-button]:!shadow-sm w-full transition-all ${wallet.publicKey ? "pb-4 border-b border-[#e2e8f0]" : ""}`}>
                <WalletMultiButton />
              </div>
            </div>

            {/* Step 2 */}
            <div className="pt-2">
              <label className="label-premium mb-3">2. Upload file payload (PDF)</label>

              <div className="relative group/upload">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`flex flex-col items-center justify-center border border-dashed p-8 transition-colors text-center bg-[#f8fafc] ${file ? 'border-[#635bff] bg-[#f0f5ff]' : 'border-[#cbd5e1] group-hover/upload:border-[#94a3b8]'}`}>

                  {!file ? (
                    <>
                      <div className="w-10 h-10 bg-white border border-[#e2e8f0] flex items-center justify-center mb-3 text-[#64748b] shadow-sm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                      </div>
                      <div className="text-[13px] font-semibold text-[#0a2540] mb-1">Select a file to fingerprint</div>
                      <div className="text-[11px] text-[#64748b]">Max size 50MB</div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-[#e0e7ff] text-[#4f46e5] flex items-center justify-center mb-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                      </div>
                      <div className="text-[14px] font-semibold text-[#0a2540] mb-1 truncate px-4">{file.name}</div>
                      <div className="text-xs text-[#64748b]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-6 border-t border-[#e2e8f0]">
              <button
                onClick={handleIssue}
                disabled={!file || !wallet.publicKey || ["hashing", "signing", "confirming"].includes(status)}
                className={`w-full py-3.5 font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${status === 'success'
                    ? 'bg-[#16a34a] text-white hover:bg-[#15803d]'
                    : 'btn-primary'
                  }`}
              >
                {status === "idle" && "Anchor hash"}
                {status === "hashing" && "Hashing..."}
                {status === "signing" && "Awaiting signature..."}
                {status === "confirming" && "Pending network confirmation..."}
                {status === "success" && "Anchored successfully"}
                {status === "error" && "Retry transaction"}
              </button>

              {errorMsg && (
                <div className="mt-4 p-3 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[13px] font-medium flex items-start gap-2">
                  <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  {errorMsg}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <aside className="w-full xl:w-[400px]">
        {status === "success" && txSig ? (
          <div className="stripe-panel p-8 animate-slide-up h-full flex flex-col bg-[#f8fafc]">

            <div className="flex items-center gap-2 mb-8">
              <span className="w-2.5 h-2.5 bg-[#10b981] shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"></span>
              <span className="text-sm font-bold text-[#10b981] uppercase tracking-wide">Anchored</span>
            </div>

            <div className="mb-6">
              <div className="text-[12px] font-semibold text-[#64748b] uppercase mb-1.5">Cryptographic Hash</div>
              <div className="bg-white p-3 border border-[#e2e8f0] font-mono text-[11px] text-[#0a2540] break-all leading-relaxed shadow-sm">
                {hashResult}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[12px] font-semibold text-[#64748b] uppercase mb-1.5">Transaction ID</div>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="block bg-white p-3 border border-[#e2e8f0] font-mono text-[11px] text-[#635bff] truncate hover:underline shadow-sm"
              >
                {txSig}
              </a>
            </div>

            <div className="mt-auto flex flex-col items-center justify-center pt-8 border-t border-[#e2e8f0]">
              <div className="text-[11px] font-bold text-[#64748b] uppercase tracking-wide mb-4">Verification Matrix</div>
              <div className="p-3 bg-white border border-[#e2e8f0] shadow-sm">
                <QRCodeSVG
                  value={JSON.stringify({ hash: hashResult, network: "devnet" })}
                  size={140}
                  level="H"
                  fgColor="#0a2540"
                  bgColor="#ffffff"
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="stripe-panel p-8 h-full flex flex-col items-center justify-center text-center bg-[#f8fafc] border-dashed">
            <div className="w-12 h-12 border-2 border-[#cbd5e1] text-[#94a3b8] flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            </div>
            <div className="text-[15px] font-semibold text-[#425466] mb-1">Awaiting output</div>
            <div className="text-[13px] text-[#64748b] max-w-[200px]">Complete the form to generate the verification payload.</div>
          </div>
        )}
      </aside>

    </div>
  );
}
