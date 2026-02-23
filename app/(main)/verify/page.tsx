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
        false
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
          setHashInput(decodedText);
          verifyHash(decodedText);
        }
      }, () => { });
    }

    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [scanActive]);

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
    <div className="flex flex-col lg:flex-row gap-6 h-full p-2">

      <div className="flex-1 flex flex-col items-center justify-start pt-10 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl glass-panel p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#14F195] to-[#9945FF] opacity-[0.03] blur-3xl rounded-full group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"></div>

          <div className="mb-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 mb-4 uppercase tracking-wider">
              <span className="text-[#9945FF]">🔍</span> Module 02
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight mb-2">Verification Explorer</h2>
            <p className="text-zinc-400 font-medium">Query the Solana blockchain to cryptographically prove the existence and valid state of any issued credential hash.</p>
          </div>

          <div className="flex flex-col gap-8 relative z-10">

            <div className="bg-black/20 p-6 rounded-2xl border border-white/5 flex flex-col gap-6">

              {scanActive ? (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black relative">
                  <div id="reader" className="[&_video]:!object-cover [&_video]:!w-full"></div>
                  <button
                    onClick={() => setScanActive(false)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500/90 hover:bg-red-500 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all"
                  >
                    Cancel Matrix Scan
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setScanActive(true)}
                  className="w-full relative group/scan overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-solana opacity-0 group-hover/scan:opacity-5 transition-opacity duration-500"></div>
                  <div className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-white/10 rounded-xl bg-white/5 group-hover/scan:border-[#9945FF]/40 transition-all duration-300">
                    <div className="w-14 h-14 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center mb-4 text-[#9945FF] group-hover/scan:scale-110 transition-transform duration-500">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" rx="1" ry="1" /></svg>
                    </div>
                    <div className="text-sm font-bold text-white mb-1">Scan Encrypted QR Matrix</div>
                    <div className="text-xs text-zinc-500 font-medium">Use device camera to instantly read and verify</div>
                  </div>
                </button>
              )}

              <div className="flex items-center gap-4 px-2">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Or Input Manually</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>

              <div>
                <label className="label-premium">SHA-256 Hash String (Hex)</label>
                <input
                  type="text"
                  className="input-premium font-mono text-sm placeholder:font-sans placeholder:text-zinc-600 focus:border-[#9945FF] focus:shadow-[0_0_0_1px_#9945FF]"
                  placeholder="Paste 64-character hash sequence..."
                  value={hashInput}
                  onChange={(e) => setHashInput(e.target.value.trim())}
                />
              </div>

            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => verifyHash(hashInput)}
                disabled={!hashInput || status === "verifying"}
                className="w-full py-4 rounded-xl font-bold border border-white/10 bg-white/10 text-white hover:bg-white/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
              >
                {status === "verifying" ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-[#9945FF] animate-spin"></span>
                    Querying Ledger...
                  </>
                ) : "Verify Cryptographic Proof"}
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
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Network Resolution</div>

            {status === "idle" && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 w-fit">
                <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
                <span className="text-xs font-bold text-zinc-400">Awaiting Query</span>
              </div>
            )}
            {status === "verifying" && (
              <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                <span className="text-xs font-bold text-amber-500">Syncing Nodes...</span>
              </div>
            )}
            {status === "valid" && (
              <div className="flex items-center gap-2 bg-[#14F195]/10 px-3 py-1.5 rounded-full border border-[#14F195]/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#14F195] shadow-[0_0_15px_rgba(20,241,149,0.3)]"></span>
                <span className="text-xs font-bold text-[#14F195]">Cryptographically Valid</span>
              </div>
            )}
            {status === "revoked" && (
              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/30 w-fit">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></span>
                <span className="text-xs font-bold text-red-500">Credential Revoked</span>
              </div>
            )}
            {status === "not_found" && (
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 w-fit">
                <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                <span className="text-xs font-bold text-zinc-300">No Record Found</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <div className="label-premium">Query Target</div>
            <div className={`p-4 rounded-xl border font-mono text-[10px] break-all leading-relaxed shadow-inner transition-colors duration-500 ${status === 'idle' ? 'bg-black/40 border-white/5 text-zinc-600' :
                status === 'valid' ? 'bg-[#14F195]/5 border-[#14F195]/20 text-[#14F195]' :
                  status === 'revoked' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                    'bg-zinc-900 border-zinc-700 text-zinc-400'
              }`}>
              {hashInput || "0x0000000000000000000000000000000000000000000000000000000000000000"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Network Base</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9945FF]"></span>
                Devnet
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Latency</div>
              <div className="text-sm font-bold text-white">~400ms</div>
            </div>
          </div>

          {status === "valid" && (
            <div className="mt-2 p-6 bg-[#14F195]/5 border border-[#14F195]/20 rounded-2xl animate-fade-in flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#14F195]/20 flex items-center justify-center text-[#14F195] mb-4 shadow-[0_0_30px_rgba(20,241,149,0.2)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h3 className="text-lg font-black text-white mb-1">Integrity Confirmed</h3>
              <p className="text-xs text-[#14F195] font-medium opacity-80">This document matches the blockchain anchor perfectly.</p>
            </div>
          )}

          {status === "revoked" && (
            <div className="mt-2 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl animate-fade-in flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              </div>
              <h3 className="text-lg font-black text-white mb-1">Integrity Compromised</h3>
              <p className="text-xs text-red-400 font-medium opacity-80">The issuer has actively revoked this credential's validity.</p>
            </div>
          )}

        </div>
      </aside>

    </div>
  );
}
