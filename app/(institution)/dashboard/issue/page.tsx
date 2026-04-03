"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useCrediblyProgram } from "@/lib/solana/client";
import { issueCredentialOnChain } from "@/lib/solana/credentials";
import Papa from "papaparse";
import { UploadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
  const [results, setResults] = useState<{ did: string; status: string; txSig?: string }[]>([]);
  const [processing, setProcessing] = useState(false);

  async function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !publicKey || !program) return;
    setProcessing(true);

    Papa.parse<CSVRow>(file, {
      header: true,
      complete: async ({ data }: { data: CSVRow[] }) => {
        const batch = [];
        for (const row of data) {
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
            batch.push({ did: row.student_did, status: `Failed: ${err}` });
          }
        }
        setResults(batch);
        setProcessing(false);
      },
    });
  }

  if (!publicKey) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="card p-10 text-center max-w-md">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl mx-auto mb-5 flex items-center justify-center">
          <UploadCloud className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h2>
        <p className="text-sm text-gray-500 mb-6">Connect your institution's Solana wallet to begin issuing credentials.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-gray-900 !text-white !font-medium hover:!bg-gray-800 !rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bulk Issuance</h1>
        <p className="text-sm text-gray-500">Upload a CSV to anchor credentials to Solana.</p>
      </motion.div>

      <label className="block card p-10 text-center cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group relative overflow-hidden">
        {processing && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-gray-700">Signing & anchoring to Solana...</p>
          </div>
        )}

        <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
          <UploadCloud className="w-7 h-7 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Upload CSV Registry</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
          Columns: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">student_did</code>, <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">degree</code>, <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">institution</code>, <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">graduation_year</code>
        </p>
        <div className="inline-flex px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          Select File
        </div>
        <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={processing} className="hidden" />
      </label>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Results <span className="text-gray-400 font-normal">({results.length})</span>
            </h3>
            <div className="space-y-2">
              {results.map((r, i) => {
                const isSuccess = r.status.startsWith("Issued");
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    key={i}
                    className={`card flex items-center justify-between p-4 text-sm border-l-[3px] ${isSuccess ? "border-l-emerald-500" : "border-l-red-400"}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                      <span className="font-mono text-gray-600 truncate text-xs">{r.did}</span>
                      <span className={`text-xs font-medium ${isSuccess ? "text-emerald-600" : "text-red-500"}`}>{r.status}</span>
                    </div>
                    {r.txSig && (
                      <a href={`https://explorer.solana.com/tx/${r.txSig}?cluster=devnet`} target="_blank" rel="noreferrer"
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 shrink-0 ml-3">
                        View Tx ↗
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
