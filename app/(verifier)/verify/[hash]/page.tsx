import { CheckCircle, XCircle, AlertCircle, Building2, Calendar, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VerifyResult {
  valid: boolean;
  exists: boolean;
  issuer?: string;
  issuedAt?: string;
  revoked?: boolean;
  ipfsCid?: string;
  institutionTier?: number;
}

async function getResult(hash: string): Promise<VerifyResult> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/verify/${hash}`,
    { cache: "no-store" }
  );
  if (!res.ok) return { valid: false, exists: false };
  return res.json();
}

export default async function VerifyResultPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = await params;
  const result = await getResult(hash);

  const cfg = result.valid
    ? { icon: CheckCircle, title: "Credential Valid", sub: "Cryptographically verified on Solana.", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" }
    : result.exists && result.revoked
    ? { icon: AlertCircle, title: "Credential Revoked", sub: "Revoked by the issuing institution.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" }
    : { icon: XCircle, title: "Not Found", sub: "No matching credential on the network.", color: "text-red-500", bg: "bg-red-50", border: "border-red-200" };

  const StatusIcon = cfg.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link href="/verify" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className={`bg-white rounded-2xl border ${cfg.border} p-8`}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className={`w-14 h-14 rounded-full ${cfg.bg} flex items-center justify-center mb-4`}>
              <StatusIcon className={`w-7 h-7 ${cfg.color}`} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{cfg.title}</h1>
            <p className="text-sm text-gray-500">{cfg.sub}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Hash</p>
            <p className="font-mono text-xs text-gray-600 break-all">{hash}</p>
          </div>

          {result.exists && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    <Building2 className="w-3 h-3" /> Issuer
                  </div>
                  <p className="text-sm text-gray-800 font-medium break-all">{result.issuer ?? "Unknown"}</p>
                  {result.institutionTier && (
                    <span className="mt-1.5 inline-flex text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                      Tier {result.institutionTier}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">
                    <Calendar className="w-3 h-3" /> Issued
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "—"}
                  </p>
                </div>
              </div>
              {result.ipfsCid && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500"><FileText className="w-3.5 h-3.5" /> IPFS</span>
                  <a href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs"}/${result.ipfsCid}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
