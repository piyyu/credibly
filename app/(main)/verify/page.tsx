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
    <div className="flex flex-col xl:flex-row gap-8 h-full">

      <div className="flex-1 flex flex-col items-center justify-start pt-6 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl stripe-panel p-8 md:p-12">

          <div className="mb-10">
            <div className="text-xs font-bold text-[#635bff] mb-2 uppercase tracking-wide">
              Verification Engine
            </div>
            <h2 className="text-3xl font-bold text-[#0a2540] tracking-tight mb-3">Query blockchain state</h2>
            <p className="text-[#425466] font-medium leading-relaxed">Instantly verify the integrity, origin, and validity status of any anchored document without revealing its contents.</p>
          </div>

          <div className="flex flex-col gap-6 pt-2">

            {scanActive ? (
              <div className="overflow-hidden border border-[#e2e8f0] bg-white relative shadow-sm">
                <div id="reader" className="[&_video]:!object-cover [&_video]:!w-full border-b border-[#e2e8f0]"></div>
                <button
                  onClick={() => setScanActive(false)}
                  className="w-full bg-[#f8fafc] text-[#0a2540] hover:bg-[#e2e8f0] py-3 text-sm font-semibold transition-colors flex justify-center"
                >
                  Cancel camera
                </button>
              </div>
            ) : (
              <button
                onClick={() => setScanActive(true)}
                className="w-full border-2 border-dashed border-[#cbd5e1] hover:border-[#635bff] bg-[#f8fafc] hover:bg-[#f0f5ff] transition-colors py-8 flex flex-col items-center justify-center text-[#425466]"
              >
                <div className="w-10 h-10 bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" /></svg>
                </div>
                <div className="text-[14px] font-semibold text-[#0a2540]">Scan QR verification matrix</div>
                <div className="text-[13px] text-[#64748b]">Requires camera hardware permission</div>
              </button>
            )}

            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 border-t border-[#e2e8f0]"></div>
              <span className="text-[12px] font-semibold text-[#64748b] bg-white px-2">OR</span>
              <div className="flex-1 border-t border-[#e2e8f0]"></div>
            </div>

            <div>
              <label className="label-premium">SHA-256 payload hash (hex string)</label>
              <input
                type="text"
                className="input-premium font-mono"
                placeholder="e.g. 0xabc123..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value.trim())}
              />
            </div>

            {/* Action */}
            <div className="pt-6 border-t border-[#e2e8f0]">
              <button
                onClick={() => verifyHash(hashInput)}
                disabled={!hashInput || status === "verifying"}
                className="w-full btn-primary text-base py-3.5"
              >
                {status === "verifying" ? "Querying Solana network..." : "Authenticate record"}
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

        <div className="stripe-panel p-8 h-full bg-[#f8fafc] flex flex-col">
          <div className="text-[12px] font-bold text-[#64748b] uppercase tracking-wide mb-6">Execution Results</div>

          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <div className="w-12 h-12 border-2 border-[#cbd5e1] text-[#94a3b8] flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div className="text-[15px] font-semibold text-[#425466] mb-1">Awaiting target hash</div>
            </div>
          )}

          {status === "verifying" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <span className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] border-t-[#635bff] animate-spin mb-4"></span>
              <div className="text-[15px] font-semibold text-[#0a2540]">Connecting to Devnet cluster...</div>
            </div>
          )}

          {status === "valid" && (
            <div className="animate-slide-up flex-1">
              <div className="border border-[#bbf7d0] bg-[#f0fdf4] p-6 text-center mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-[#dcfce7] text-[#16a34a] flex items-center justify-center mb-4 border border-[#bbf7d0] shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#166534] mb-1">Authentic Record</h3>
                <p className="text-[13px] text-[#15803d]">This document matches the verifiable blockchain payload perfectly.</p>
              </div>

              <div className="mb-6">
                <div className="text-[11px] font-bold text-[#64748b] uppercase mb-1.5">Evaluated Hash</div>
                <div className="bg-white p-3 border border-[#e2e8f0] font-mono text-[11px] text-[#0a2540] break-all leading-relaxed shadow-sm">
                  {hashInput}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#e2e8f0] mt-auto pt-6">
                <div>
                  <div className="text-[11px] font-bold text-[#64748b] uppercase mb-1">Status</div>
                  <div className="text-[13px] font-bold text-[#0a2540]">Active</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#64748b] uppercase mb-1">Network Base</div>
                  <div className="text-[13px] font-bold text-[#0a2540] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#4f46e5]"></span>
                    Solana Devnet
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === "revoked" && (
            <div className="animate-slide-up flex-1">
              <div className="border border-[#fecaca] bg-[#fef2f2] p-6 text-center mb-8 flex flex-col items-center">
                <div className="w-12 h-12 bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mb-4 border border-[#fecaca] shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#991b1b] mb-1">Revoked Record</h3>
                <p className="text-[13px] text-[#b91c1c]">The issuing authority has permanently revoked the integrity of this payload.</p>
              </div>
            </div>
          )}

          {status === "not_found" && (
            <div className="animate-slide-up flex-1">
              <div className="border border-[#e2e8f0] bg-white p-6 text-center mb-8 flex flex-col items-center shadow-sm">
                <div className="w-12 h-12 bg-[#f1f5f9] text-[#64748b] flex items-center justify-center mb-4 border border-[#e2e8f0] shadow-sm">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#0a2540] mb-1">Unrecognized Hash</h3>
                <p className="text-[13px] text-[#425466]">This signature does not exist on the current network ledger.</p>
              </div>
            </div>
          )}

        </div>
      </aside>

    </div>
  );
}
