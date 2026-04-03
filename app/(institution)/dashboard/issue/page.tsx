"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useCrediblyProgram } from "@/lib/solana/client";
import { issueCredentialOnChain } from "@/lib/solana/credentials";
import Papa from "papaparse";

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
    <div className="flex flex-col items-center gap-4 pt-20">
      <p className="text-gray-400">Connect your institution wallet to continue</p>
      <WalletMultiButton />
    </div>
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Bulk Credential Issuance</h1>
      <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-4">CSV columns: student_did, degree, institution, graduation_year</p>
        <input type="file" accept=".csv" onChange={handleCSVUpload} disabled={processing}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500 file:text-black file:font-semibold" />
      </div>
      {processing && <p className="mt-4 text-green-400 animate-pulse">Issuing on Solana...</p>}
      {results.length > 0 && (
        <div className="mt-8 space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg p-3 text-sm">
              <span className="font-mono text-gray-300 truncate w-48">{r.did}</span>
              <span className={r.status.startsWith("Issued") ? "text-green-400" : "text-red-400"}>{r.status}</span>
              {r.txSig && (
                <a href={`https://explorer.solana.com/tx/${r.txSig}?cluster=devnet`}
                  target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  View tx ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
