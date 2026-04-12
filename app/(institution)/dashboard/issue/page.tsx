"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((mod) => mod.WalletMultiButton),
  { ssr: false }
);
import { useCrediblyProgram } from "@/lib/solana/client";
import { issueCredentialOnChain } from "@/lib/solana/credentials";
import Papa from "papaparse";
import { UploadCloud, CheckCircle2, XCircle, Loader2, Send, FileSpreadsheet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CSVRow {
  student_did: string;
  degree: string;
  institution: string;
  graduation_year: string;
}

export default function IssuePage() {
  const { publicKey } = useWallet();
  const program = useCrediblyProgram();
  
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [results, setResults] = useState<{ did: string; status: string; txSig?: string }[]>([]);
  const [processing, setProcessing] = useState(false);

  // Single form state
  const [studentDid, setStudentDid] = useState("");
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  async function handleSingleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey || !program || !studentDid || !degree || !institution || !graduationYear) return;
    
    setProcessing(true);
    try {
      const vc = {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential", "AcademicCredential"],
        issuer: `did:sol:${publicKey.toBase58()}`,
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: studentDid,
          degree,
          institution,
          graduationYear: parseInt(graduationYear),
        },
      };
      const { txSig } = await issueCredentialOnChain(program, publicKey, vc);
      setResults([{ did: studentDid, status: "Issued", txSig }, ...results]);
      
      // Clear form
      setStudentDid("");
      setDegree("");
      // keep institution
      setGraduationYear("");
    } catch (err) {
      setResults([{ did: studentDid, status: `Failed: ${(err as Error).message}` }, ...results]);
    } finally {
      setProcessing(false);
    }
  }

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !publicKey || !program) return;
    setProcessing(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }: { data: CSVRow[] }) => {
        const batch: { did: string; status: string; txSig?: string }[] = [];
        for (const row of data) {
          if (!row.student_did) continue;
          try {
            const vc = {
              "@context": ["https://www.w3.org/2018/credentials/v1"],
              type: ["VerifiableCredential", "AcademicCredential"],
              issuer: `did:sol:${publicKey.toBase58()}`,
              issuanceDate: new Date().toISOString(),
              credentialSubject: {
                id: row.student_did,
                degree: row.degree,
                institution: row.institution,
                graduationYear: parseInt(row.graduation_year),
              },
            };
            const { txSig } = await issueCredentialOnChain(program, publicKey, vc);
            batch.push({ did: row.student_did, status: "Issued", txSig });
          } catch (err) {
            batch.push({ did: row.student_did, status: `Failed: ${(err as Error).message}` });
          }
        }
        setResults((prev) => [...batch, ...prev]);
        setProcessing(false);
      },
    });
  }

  if (!publicKey) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[70vh]">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm">
        <div className="w-12 h-12 bg-amber-50 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet</h2>
        <p className="text-sm text-gray-500 mb-5">Connect your institution&apos;s wallet to issue credentials.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gray-900 !text-white !font-medium hover:!bg-gray-800 !rounded-lg !text-sm" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Issue Credentials</h1>
        <p className="text-sm text-gray-500">Create cryptographic academic records anchored to Solana.</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab("single")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "single" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Send className="w-4 h-4" /> Single Issue
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "bulk" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Bulk CSV
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "single" ? (
          <motion.div
            key="single"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden relative"
          >
            {processing && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl border border-emerald-100">
                <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-2" />
                <p className="text-sm font-medium text-gray-700">Anchoring to Solana...</p>
              </div>
            )}
            <form onSubmit={handleSingleIssue} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Student DID (Target Wallet)</label>
                  <input
                    required
                    type="text"
                    placeholder="did:sol:..."
                    value={studentDid}
                    onChange={(e) => setStudentDid(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Degree / Title</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. B.Tech Computer Science"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Graduation Year</label>
                  <input
                    required
                    type="number"
                    min="1900"
                    max="2100"
                    placeholder="2026"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. IIT Delhi"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Issue Credential
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <label className="block bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 p-10 text-center cursor-pointer transition-all group relative overflow-hidden">
              {processing && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 rounded-2xl">
                  <Loader2 className="w-7 h-7 text-emerald-600 animate-spin mb-2" />
                  <p className="text-sm font-medium text-gray-700">Anchoring to Solana...</p>
                </div>
              )}
              <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Upload CSV Matrix</h3>
              <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
                Provide a CSV with headers:<br/>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-[11px] mx-0.5">student_did</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-[11px] mx-0.5">degree</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-[11px] mx-0.5">institution</code>
                <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 text-[11px] mx-0.5">graduation_year</code>
              </p>
              <span className="inline-flex px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg">Select File</span>
              <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={processing} className="hidden" />
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Log */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              Recent Issuances <span className="bg-gray-100 text-gray-500 text-[11px] py-0.5 px-2 rounded-full">{results.length}</span>
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {results.map((r, i) => {
                const ok = r.status.startsWith("Issued");
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={i}
                    className={`bg-white rounded-lg border border-gray-200 flex items-center justify-between p-3 text-sm border-l-[3px] ${ok ? "border-l-emerald-500" : "border-l-red-400"}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      <span className="font-mono text-gray-500 truncate text-xs w-24 md:w-auto">{r.did}</span>
                      <span className={`text-xs font-medium ml-2 ${ok ? "text-emerald-600" : "text-red-500"}`}>{r.status}</span>
                    </div>
                    {r.txSig && (
                      <a href={`https://explorer.solana.com/tx/${r.txSig}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 shrink-0 ml-2 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">
                        View ↗
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
