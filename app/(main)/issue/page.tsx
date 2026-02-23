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

        <div className="w-full max-w-2xl stripe-panel bg-[#151515] p-8 md:p-12 relative overflow-hidden border-t-[#3b82f6] border-t-2 shadow-[0_10px_40px_rgba(0,0,0,1)]">

          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-[#0a0a0a] border border-[#262626] shadow-[inset_0_0_15px_rgba(0,0,0,1)] mb-6 mx-auto">
              <span className="text-[#3b82f6] font-bold text-xl drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">SYS_01</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-3">Payload Fingerprint</h2>
            <p className="text-[#a3a3a3] font-medium leading-relaxed max-w-[80%] mx-auto">Cryptographically hash and append a file footprint to the Solana ledger structure.</p>
          </div>

          <div className="flex flex-col gap-6">

            {/* Step 1 */}
            <div className="p-6 bg-[#0a0a0a] border border-[#262626] transition-colors hover:border-[#3b82f6]/40">
              <label className="label-premium flex justify-between items-center mb-4">
                <span className="flex items-center gap-3"><span className="text-[#3b82f6]">01</span> Authorization Wallet</span>
                {wallet.publicKey && <span className="text-[#3b82f6] text-[10px] bg-[#3b82f6]/10 px-2 py-1 border border-[#3b82f6]/30">SYNCED</span>}
              </label>

              <div className={`[&_.wallet-adapter-button]:!bg-[#151515] [&_.wallet-adapter-button]:!text-white [&_.wallet-adapter-button]:!hover:bg-[#262626] [&_.wallet-adapter-button]:!h-14 [&_.wallet-adapter-button]:!rounded-none [&_.wallet-adapter-button]:!font-mono [&_.wallet-adapter-button]:!font-bold [&_.wallet-adapter-button]:!text-sm [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-[#262626] [&_.wallet-adapter-button]:!shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] w-full`}>
                <WalletMultiButton />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-[#0a0a0a] border border-[#262626] transition-colors relative group/upload">
              <label className="label-premium mb-4 flex items-center gap-3">
                <span className="text-[#3b82f6]">02</span> Target Document Input
              </label>

              <div className="relative border-2 border-dashed border-[#262626] p-8 text-center bg-[#151515]">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {!file ? (
                  <div className="group-hover/upload:opacity-100 opacity-60 transition-opacity">
                    <div className="w-12 h-12 bg-[#0a0a0a] border border-[#262626] text-[#737373] flex items-center justify-center mx-auto mb-4 group-hover/upload:border-[#3b82f6]/50 group-hover/upload:text-[#3b82f6] transition-colors shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                    </div>
                    <div className="text-[14px] font-bold text-white mb-2 uppercase tracking-wide">Upload Data Target</div>
                    <div className="text-[10px] text-[#737373] font-mono">Accepts: PDF / Max: 50MB</div>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-[#0a0a0a] text-[#3b82f6] border border-[#3b82f6]/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                    </div>
                    <div className="text-[14px] font-black text-white mb-1 truncate px-4 font-mono">{file.name}</div>
                    <div className="text-[11px] text-[#737373] font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB DUMP</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="pt-4">
              <button
                onClick={handleIssue}
                disabled={!file || !wallet.publicKey || ["hashing", "signing", "confirming"].includes(status)}
                className={`w-full py-5 font-black text-[13px] transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${status === 'success'
                    ? 'bg-[#0a0a0a] text-[#22c55e] border border-[#22c55e]/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                    : 'btn-primary border border-transparent'
                  }`}
              >
                {status === "idle" && "Execute Hash Operation"}
                {status === "hashing" && "Hashing Sequence..."}
                {status === "signing" && "Awaiting Authorization..."}
                {status === "confirming" && "Broadcasting Payload..."}
                {status === "success" && "Payload Anchored"}
                {status === "error" && "Operation Failed - Retry"}
              </button>

              {errorMsg && (
                <div className="mt-4 p-4 bg-[#0a0a0a] border border-[#ef4444]/30 text-[#ef4444] text-[12px] font-mono flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <span className="text-[#ef4444] font-black">ERR</span>
                  {errorMsg}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <aside className="w-full xl:w-[450px]">
        {status === "success" && txSig ? (
          <div className="stripe-panel bg-[#151515] p-8 animate-slide-up h-full flex flex-col border-t-2 border-t-[#22c55e]">

            <div className="flex items-center gap-3 justify-center mb-8 bg-[#0a0a0a] border border-[#262626] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
              <span className="w-3 h-3 bg-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></span>
              <span className="text-xl font-black text-[#22c55e] uppercase tracking-widest">Anchored</span>
            </div>

            <div className="mb-8">
              <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">SHA-256 Vector String</div>
              <div className="bg-[#000000] p-4 border border-[#262626] font-mono text-[12px] text-[#3b82f6] break-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                {hashResult}
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Ledger Block Identifier</div>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="block bg-[#000000] p-4 border border-[#262626] font-mono text-[12px] text-white hover:text-[#3b82f6] hover:border-[#3b82f6]/50 truncate transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              >
                {txSig}
              </a>
            </div>

            <div className="mt-auto flex flex-col items-center justify-center pt-8 border-t border-[#262626]">
              <div className="text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-4">Read-Only Matrix</div>
              <div className="p-4 bg-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <QRCodeSVG
                  value={JSON.stringify({ hash: hashResult, network: "devnet" })}
                  size={180}
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="stripe-panel bg-[#0a0a0a] border-[#262626] p-8 h-full flex flex-col items-center justify-center text-center shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-[#151515] border border-[#262626] text-[#3f3f46] flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            </div>
            <div className="text-[14px] font-black text-white uppercase tracking-widest mb-3">Idle Subsystem</div>
            <div className="text-[11px] text-[#737373] max-w-[200px] leading-relaxed font-mono">Sequence the required parameters to construct the hash footprint payload.</div>
          </div>
        )}
      </aside>

    </div>
  );
}
