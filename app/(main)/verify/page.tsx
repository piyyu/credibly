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
    <div className="flex flex-col xl:flex-row gap-10 h-full pb-10">

      <div className="flex-1 flex flex-col items-center justify-start pt-2 overflow-y-auto custom-scrollbar">

        <div className="w-full max-w-2xl stripe-panel bg-white p-10 md:p-14 relative overflow-hidden">

          <div className="mb-12 text-center">
            <div className="text-[12px] font-medium text-[#D95C41] uppercase tracking-widest mb-4">Verification Engine</div>
            <h2 className="text-[32px] font-serif text-[#1C1C1E] tracking-tight mb-4">Ledger Authentication</h2>
            <p className="text-[#8A8985] text-[15px] font-light leading-relaxed max-w-[85%] mx-auto">Query the distributed architecture to precisely verify the origin state of any encoded document.</p>
          </div>

          <div className="flex flex-col gap-8 pt-2">

            {scanActive ? (
              <div className="border border-[#E8E6DF] rounded-xl bg-[#FAF9F6] p-4 shadow-sm">
                <div className="text-[12px] font-medium text-[#1C1C1E] uppercase mb-4 tracking-widest text-center mt-2">Active Video Stream</div>
                <div id="reader" className="[&_video]:!object-cover [&_video]:!w-full border border-[#E8E6DF] rounded-lg mb-4 overflow-hidden"></div>
                <button
                  onClick={() => setScanActive(false)}
                  className="w-full bg-white text-[#D95C41] border border-[#E8E6DF] hover:bg-[#F4F2EC] py-3 text-[13px] font-medium rounded-lg transition-colors"
                >
                  Cancel Scanning Operation
                </button>
              </div>
            ) : (
              <button
                onClick={() => setScanActive(true)}
                className="w-full border-2 border-dashed border-[#C0BEB8] hover:border-[#8A8985] bg-[#FAF9F6] transition-all py-12 rounded-xl flex flex-col items-center justify-center text-[#49494B] group/scan"
              >
                <div className="w-14 h-14 bg-white rounded-full border border-[#E8E6DF] shadow-sm flex items-center justify-center mb-5 group-hover/scan:text-[#1C1C1E] transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><rect x="7" y="7" width="10" height="10" /></svg>
                </div>
                <div className="text-[15px] font-medium text-[#1C1C1E] mb-2">Scan Hardware Source</div>
                <div className="text-[13px] text-[#8A8985] font-light">Needs camera device permissions</div>
              </button>
            )}

            <div className="flex items-center gap-4 my-2 opacity-60">
              <div className="flex-1 border-t border-[#E8E6DF]"></div>
              <span className="text-[11px] font-light text-[#8A8985] bg-white px-2 uppercase tracking-widest">Or utilize hex string</span>
              <div className="flex-1 border-t border-[#E8E6DF]"></div>
            </div>

            <div>
              <label className="label-premium">SHA-256 target identifier</label>
              <input
                type="text"
                className="input-premium font-mono bg-[#FAF9F6] text-[#49494B] border-[#E8E6DF]"
                placeholder="0xabc123..."
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value.trim())}
              />
            </div>

            {/* Action */}
            <div className="pt-6 border-t border-[#F4F2EC]">
              <button
                onClick={() => verifyHash(hashInput)}
                disabled={!hashInput || status === "verifying"}
                className="w-full btn-primary text-[15px] py-4 rounded-full font-medium"
              >
                {status === "verifying" ? "Querying Solana Network..." : "Authenticate Record"}
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

        <div className="stripe-panel p-10 h-full bg-white flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E8E6DF]">
          <div className="text-[11px] font-medium text-[#8A8985] uppercase tracking-widest mb-10 text-center">Protocol Resolution</div>

          {status === "idle" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
              <div className="w-16 h-16 bg-[#F4F2EC] rounded-full text-[#8A8985] flex items-center justify-center mb-6 border border-[#E8E6DF]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
              </div>
              <div className="text-[18px] font-serif font-medium text-[#1C1C1E] mb-3">Awaiting Query Matrix</div>
              <div className="text-[14px] text-[#8A8985] font-light leading-relaxed max-w-[250px]">Input hash string parameters to resolve against the ledger state.</div>
            </div>
          )}

          {status === "verifying" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
              <span className="w-10 h-10 border-2 border-[#E8E6DF] border-t-[#D95C41] rounded-full animate-spin mb-6"></span>
              <div className="text-[15px] font-medium text-[#1C1C1E] tracking-wide">Syncing Nodes...</div>
            </div>
          )}

          {status === "valid" && (
            <div className="animate-slide-up flex-1 flex flex-col">

              <div className="flex flex-col items-center justify-center mb-10 pb-8 border-b border-[#F4F2EC]">
                <div className="w-16 h-16 bg-[#EBF4EE] rounded-full flex items-center justify-center mb-4 border border-[#C6E2D1]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4B8B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                </div>
                <span className="text-2xl font-serif text-[#1C1C1E]">Authentic Record</span>
                <span className="text-[14px] text-[#4B8B67] mt-1 font-medium">Valid payload block matching requested hash.</span>
              </div>

              <div className="mb-10 w-full pl-2">
                <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2 tracking-widest">Queried Vector</div>
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E8E6DF] font-mono text-[12px] text-[#49494B] break-all leading-relaxed shadow-sm">
                  {hashInput}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl p-5 text-center shadow-sm">
                  <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2 tracking-widest">Protocol State</div>
                  <div className="text-[15px] font-medium text-[#1C1C1E]">Active</div>
                </div>
                <div className="bg-[#FAF9F6] border border-[#E8E6DF] rounded-xl p-5 text-center shadow-sm">
                  <div className="text-[11px] font-medium text-[#8A8985] uppercase mb-2 tracking-widest">Target Environment</div>
                  <div className="text-[15px] font-medium text-[#D95C41]">Devnet</div>
                </div>
              </div>
            </div>
          )}

          {status === "revoked" && (
            <div className="animate-slide-up flex-1 flex flex-col">
              <div className="flex flex-col items-center justify-center mb-10 pb-8 border-b border-[#F4F2EC]">
                <div className="w-16 h-16 bg-[#FDF8F8] rounded-full flex items-center justify-center mb-4 border border-[#F2C4C4]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B83E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <span className="text-2xl font-serif text-[#1C1C1E]">Revoked State</span>
              </div>
              <p className="text-[14px] text-[#8A8985] font-light text-center leading-relaxed max-w-[280px] mx-auto">This issuing authority has systematically deprecated the structural integrity of this particular footprint.</p>
            </div>
          )}

          {status === "not_found" && (
            <div className="animate-slide-up flex-1 flex flex-col">
              <div className="flex flex-col items-center justify-center mb-10 pb-8 border-b border-[#F4F2EC]">
                <div className="w-16 h-16 bg-[#F4F2EC] rounded-full flex items-center justify-center mb-4 border border-[#C0BEB8]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A8985" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                </div>
                <span className="text-2xl font-serif text-[#1C1C1E]">Unrecognized Payload</span>
              </div>
              <p className="text-[14px] text-[#8A8985] font-light text-center leading-relaxed max-w-[280px] mx-auto">The protocol index holds no known execution blocks containing this specified sequence. Network returns null.</p>
            </div>
          )}

        </div>
      </aside>

    </div>
  );
}
