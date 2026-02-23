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

        <div className="w-full max-w-2xl stripe-panel bg-[#151515] p-8 md:p-12 border-t-[#3b82f6] border-t-2 shadow-[0_10px_40px_rgba(0,0,0,1)]">

          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-[#0a0a0a] border border-[#262626] shadow-[inset_0_0_15px_rgba(0,0,0,1)] mb-6 mx-auto">
              <span className="text-[#3b82f6] font-bold text-xl drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">SYS_02</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-3">Verification Matrix</h2>
            <p className="text-[#a3a3a3] font-medium leading-relaxed max-w-[80%] mx-auto">Query the distributed ledger to cryptographically assert the validity state of any issued footprint.</p>
          </div>

          <div className="flex flex-col gap-6 pt-2">

            {scanActive ? (
              <div className="border border-[#3b82f6] bg-[#000000] p-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <div className="text-[10px] font-bold text-[#3b82f6] uppercase mb-4 tracking-widest">Awaiting Video Input...</div>
                <div id="reader" className="[&_video]:!object-cover [&_video]:!w-full border border-[#262626] mb-4"></div>
                <button
                  onClick={() => setScanActive(false)}
                  className="w-full bg-[#151515] text-[#ef4444] border border-[#ef4444]/30 hover:border-[#ef4444] py-4 text-xs font-bold uppercase tracking-widest transition-colors shadow-[inset_0_0_15px_rgba(0,0,0,1)]"
                >
                  Terminate Scanner
                </button>
              </div>
            ) : (
              <button
                onClick={() => setScanActive(true)}
                className="w-full border-2 border-dashed border-[#262626] hover:border-[#3b82f6]/50 bg-[#0a0a0a] transition-all py-10 flex flex-col items-center justify-center text-[#737373] group/scan"
              >
                <div className="w-14 h-14 bg-[#151515] border border-[#262626] shadow-[inset_0_0_15px_rgba(0,0,0,1)] flex items-center justify-center mb-6 group-hover/scan:text-[#3b82f6] group-hover/scan:border-[#3b82f6]/30 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" /></svg>
                </div>
                <div className="text-[14px] font-black text-white uppercase tracking-widest mb-2">Scan Hardware Payload</div>
                <div className="text-[11px] text-[#737373] font-mono">Requires Device Camera Permissions</div>
              </button>
            )}

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 border-t border-[#262626]"></div>
              <span className="text-[10px] font-bold text-[#737373] bg-[#151515] px-4 uppercase tracking-widest">Manual Override</span>
              <div className="flex-1 border-t border-[#262626]"></div>
            </div>

            <div className="p-6 bg-[#0a0a0a] border border-[#262626] transition-colors focus-within:border-[#3b82f6]/40">
              <label className="label-premium">Hexadecimal Payload Identifier</label>
              <input
                type="text"
                className="input-premium font-mono"
                placeholder="0x..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value.trim())}
              />
            </div>

            {/* Action */}
            <div className="pt-4">
              <button
                onClick={() => verifyHash(hashInput)}
                disabled={!hashInput || status === "verifying"}
                className="w-full btn-primary text-[13px] py-5 uppercase tracking-widest font-black"
              >
                {status === "verifying" ? "Synchronizing Nodes..." : "Execute Ledger Query"}
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

        <div className="stripe-panel p-8 h-full bg-[#151515] flex flex-col border-t-2 border-t-[#3b82f6] shadow-[0_10px_40px_rgba(0,0,0,1)]">
          <div className="text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-8 text-center">Execution Output State</div>

          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <div className="w-20 h-20 bg-[#0a0a0a] border border-[#262626] shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center justify-center mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div className="text-[15px] font-black text-white tracking-widest uppercase mb-3">Awaiting Query</div>
              <div className="text-[11px] text-[#737373] font-mono leading-relaxed max-w-[250px]">Input hash parameters to query the Solana Mainnet footprint layer.</div>
            </div>
          )}

          {status === "verifying" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-10">
              <span className="w-12 h-12 bg-[#000000] border-2 border-[#262626] border-t-[#3b82f6] animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"></span>
              <div className="text-[15px] font-black text-[#3b82f6] tracking-widest uppercase">Connecting to Peer Cluster...</div>
            </div>
          )}

          {status === "valid" && (
            <div className="animate-slide-up flex-1 flex flex-col">

              <div className="flex items-center gap-3 justify-center mb-8 bg-[#0a0a0a] border border-[#262626] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                <span className="w-3 h-3 bg-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></span>
                <span className="text-xl font-black text-[#22c55e] uppercase tracking-widest">Valid Entity</span>
              </div>

              <div className="mb-8">
                <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Requested Vector</div>
                <div className="bg-[#000000] p-4 border border-[#262626] font-mono text-[12px] text-white break-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {hashInput}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-[#0a0a0a] border border-[#262626] p-6 text-center">
                  <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Node State</div>
                  <div className="text-[14px] font-black text-[#22c55e] uppercase tracking-wider">Active</div>
                </div>
                <div className="bg-[#0a0a0a] border border-[#262626] p-6 text-center">
                  <div className="text-[10px] font-bold text-[#737373] uppercase mb-2 tracking-widest">Cluster Target</div>
                  <div className="text-[14px] font-bold text-white uppercase tracking-wider">Devnet</div>
                </div>
              </div>
            </div>
          )}

          {status === "revoked" && (
            <div className="animate-slide-up flex-1">
              <div className="flex items-center gap-3 justify-center mb-8 bg-[#0a0a0a] border border-[#ef4444]/30 p-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                <span className="w-3 h-3 bg-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse"></span>
                <span className="text-xl font-black text-[#ef4444] uppercase tracking-widest">Revoked State</span>
              </div>
              <p className="text-[13px] text-[#ef4444] font-mono text-center leading-relaxed">The issuing authority has permanently deprecated the integrity of this payload footprint.</p>
            </div>
          )}

          {status === "not_found" && (
            <div className="animate-slide-up flex-1">
              <div className="flex items-center gap-3 justify-center mb-8 bg-[#0a0a0a] border border-[#262626] p-4 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                <span className="w-3 h-3 bg-[#737373] shadow-[0_0_15px_rgba(0,0,0,0.6)] animate-pulse"></span>
                <span className="text-xl font-black text-white uppercase tracking-widest">Hash Void</span>
              </div>
              <p className="text-[13px] text-[#a3a3a3] font-mono text-center leading-relaxed">This signature sequence does not exist on the current clustered ledger. Integrity nullified.</p>
            </div>
          )}

        </div>
      </aside>

    </div>
  );
}
