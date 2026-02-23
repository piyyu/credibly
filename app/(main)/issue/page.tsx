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
    <div className="flex flex-col xl:flex-row gap-10 h-full pb-10">

      <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl stripe-panel bg-white p-10 md:p-14 relative overflow-hidden">

          <div className="mb-14 text-center">
            <div className="text-[12px] font-medium text-[#D95C41] uppercase tracking-widest mb-4">Payload Issuance</div>
            <h2 className="text-[32px] font-serif text-[#1C1C1E] tracking-tight mb-4">Cryptographic Anchor</h2>
            <p className="text-[#8A8985] text-[15px] font-light leading-relaxed max-w-[85%] mx-auto">
              Generate a deterministic hash vector of a source document and append it precisely to the layer 1 ledger.
            </p>
          </div>

          <div className="flex flex-col gap-10">

            {/* Step 1 */}
            <div>
              <label className="flex justify-between items-center mb-4">
                <span className="flex items-center gap-3 text-[14px] font-medium text-[#1C1C1E]">
                  <span className="w-6 h-6 rounded-full bg-[#FAF9F6] text-[#8A8985] flex items-center justify-center text-[11px] border border-[#E8E6DF]">1</span>
                  Hardware Authorization
                </span>
                {wallet.publicKey && <span className="text-[#4B8B67] text-[12px] font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#4B8B67] rounded-full"></span> Synced</span>}
              </label>

              <div className={`[&_.wallet-adapter-button]:!bg-[#FAF9F6] [&_.wallet-adapter-button]:!text-[#1C1C1E] [&_.wallet-adapter-button]:!hover:bg-[#F4F2EC] [&_.wallet-adapter-button]:!h-14 [&_.wallet-adapter-button]:!rounded-xl [&_.wallet-adapter-button]:!font-sans [&_.wallet-adapter-button]:!font-medium [&_.wallet-adapter-button]:!text-[15px] [&_.wallet-adapter-button]:!transition-all [&_.wallet-adapter-button]:!border [&_.wallet-adapter-button]:!border-[#E8E6DF] [&_.wallet-adapter-button]:!shadow-none w-full`}>
                <WalletMultiButton />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group/upload">
              <label className="flex items-center gap-3 text-[14px] font-medium text-[#1C1C1E] mb-4">
                <span className="w-6 h-6 rounded-full bg-[#FAF9F6] text-[#8A8985] flex items-center justify-center text-[11px] border border-[#E8E6DF]">2</span>
                Target Document Input
              </label>

              <div className="relative border border-dashed border-[#C0BEB8] rounded-xl p-10 text-center bg-[#FAF9F6] transition-colors hover:bg-[#F4F2EC]">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {!file ? (
                  <div className="opacity-80 transition-opacity">
                    <div className="w-12 h-12 bg-white rounded-full text-[#8A8985] flex items-center justify-center mx-auto mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-[#E8E6DF]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                    </div>
                    <div className="text-[15px] font-medium text-[#1C1C1E] mb-1">Select a payload document...</div>
                    <div className="text-[12px] text-[#8A8985] font-light">Compatible with PDF targets up to 50MB.</div>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 bg-[#1C1C1E] rounded-full text-white flex items-center justify-center mx-auto mb-4 shadow-[0_4px_15px_rgba(0,0,0,0.1)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="text-[15px] font-medium text-[#1C1C1E] mb-1 truncate px-4">{file.name}</div>
                    <div className="text-[12px] text-[#8A8985]">{(file.size / 1024 / 1024).toFixed(2)} MB volume</div>
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="pt-6 border-t border-[#F4F2EC]">
              <button
                onClick={handleIssue}
                disabled={!file || !wallet.publicKey || ["hashing", "signing", "confirming"].includes(status)}
                className={`w-full py-4 rounded-full font-medium text-[15px] transition-all flex items-center justify-center gap-2 ${status === 'success'
                    ? 'bg-[#F4F2EC] text-[#4B8B67] border border-[#E8E6DF]'
                    : 'btn-primary'
                  }`}
              >
                {status === "idle" && "Commence Anchor Sequence"}
                {status === "hashing" && "Hashing Sequence..."}
                {status === "signing" && "Awaiting Authorization..."}
                {status === "confirming" && "Broadcasting Payload..."}
                {status === "success" && "Payload Anchored"}
                {status === "error" && "Operation Failed - Retry"}
              </button>

              {errorMsg && (
                <div className="mt-4 p-4 bg-[#FDF8F8] border border-[#F2C4C4] rounded-lg text-[#B83E3E] text-[13px] font-medium flex items-start gap-3">
                  <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                  {errorMsg}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <aside className="w-full xl:w-[450px] pt-2">
        {status === "success" && txSig ? (
          <div className="stripe-panel bg-white p-10 animate-slide-up h-full flex flex-col items-center text-center">

            <div className="w-16 h-16 bg-[#F4F2EC] rounded-full flex items-center justify-center mb-6">
              <span className="w-6 h-6 bg-[#4B8B67] rounded-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </span>
            </div>

            <h3 className="text-[20px] font-serif font-medium text-[#1C1C1E] mb-2">Operation Successful</h3>
            <p className="text-[14px] text-[#8A8985] mb-10">Data footprint established on the ledger.</p>

            <div className="w-full mb-8 text-left">
              <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2 tracking-widest pl-1">SHA-256 Vector String</div>
              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6DF] font-mono text-[12px] text-[#49494B] break-all">
                {hashResult}
              </div>
            </div>

            <div className="w-full mb-10 text-left">
              <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2 tracking-widest pl-1">Ledger Block Identifier</div>
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="block bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6DF] font-mono text-[12px] text-[#D95C41] hover:text-[#1C1C1E] truncate transition-colors"
              >
                {txSig}
              </a>
            </div>

            <div className="mt-auto flex flex-col items-center justify-center w-full pt-8 border-t border-[#F4F2EC]">
              <div className="text-[11px] font-medium text-[#8A8985] uppercase tracking-widest mb-6">Execution Matrix</div>
              <div className="p-4 bg-white rounded-2xl border border-[#E8E6DF] shadow-[0_4px_20px_rgba(0,0,0,0.03)] opacity-90 inline-block">
                <QRCodeSVG
                  value={JSON.stringify({ hash: hashResult, network: "devnet" })}
                  size={160}
                  level="H"
                  fgColor="#1C1C1E"
                  bgColor="#ffffff"
                />
              </div>
            </div>

          </div>
        ) : (
          <div className="stripe-panel bg-[#FAF9F6] border-dashed border-[#C0BEB8] p-10 h-full flex flex-col items-center justify-center text-center shadow-none">
            <div className="w-14 h-14 bg-white rounded-full border border-[#E8E6DF] text-[#8A8985] flex items-center justify-center mb-6 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
            </div>
            <div className="text-[16px] font-serif font-medium text-[#1C1C1E] mb-2">Idle Registration Process</div>
            <div className="text-[13px] text-[#8A8985] max-w-[220px] leading-relaxed font-light">Authenticate your hardware and append a document footprint.</div>
          </div>
        )}
      </aside>

    </div>
  );
}
