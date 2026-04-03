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
    <div className="flex-1 flex flex-col items-center justify-center pt-32">
      <div className="glass-panel p-10 rounded-3xl text-center max-w-md">
        <h2 className="text-2xl font-bold mb-3">Institution Wallet Required</h2>
        <p className="text-gray-400 mb-6">You must connect an authorized issuing wallet to perform cryptographic document signing.</p>
        <div className="flex justify-center"><WalletMultiButton className="!bg-emerald-500 !text-black !font-bold hover:!bg-emerald-400" /></div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Bulk Issuance</h1>
        <p className="text-gray-400">Anchor thousands of records simultaneously to Solana for permanent verification.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <label className="block border-2 border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-black/40 backdrop-blur-md rounded-3xl p-12 text-center cursor-pointer transition-all group relative overflow-hidden">
          {processing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
              <p className="text-emerald-400 font-medium">Signing and Anchoring to Solana...</p>
            </div>
          )}
          
          <div className="w-16 h-16 bg-white/5 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Upload CSV Registry</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
            Required columns: <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">student_did</code>, <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">degree</code>, <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">institution</code>, <code className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">graduation_year</code>
          </p>
          <div className="inline-flex glass-pill px-4 py-2 text-sm text-white font-medium hover:bg-white/10 transition-colors">
            Select File
          </div>
          <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={processing} className="hidden" />
        </label>
      </motion.div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              Processing Results <span className="text-sm font-normal text-gray-500">({results.length})</span>
            </h3>
            <div className="space-y-3">
              {results.map((r, i) => {
                const isSuccess = r.status.startsWith("Issued");
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    key={i} 
                    className={`flex items-center justify-between glass-panel rounded-xl p-4 text-sm border-l-4 ${isSuccess ? 'border-l-emerald-500' : 'border-l-red-500'}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                      <span className="font-mono text-gray-300 truncate max-w-[200px]">{r.did}</span>
                      <span className={isSuccess ? "text-emerald-400" : "text-red-400"}>{r.status}</span>
                    </div>
                    {r.txSig && (
                      <a href={`https://explorer.solana.com/tx/${r.txSig}?cluster=devnet`} target="_blank" rel="noreferrer" 
                        className="text-xs font-semibold px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-emerald-400 hover:bg-white/10 transition-colors flex items-center gap-1">
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
