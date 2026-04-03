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

  const getStatusConfig = () => {
    if (result.valid) return {
      icon: CheckCircle,
      title: "Credential Valid",
      subtitle: "This credential has been cryptographically verified on the Solana blockchain.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      ringColor: "ring-emerald-100",
    };
    if (result.exists && result.revoked) return {
      icon: AlertCircle,
      title: "Credential Revoked",
      subtitle: "This credential was revoked by the issuing institution.",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      ringColor: "ring-amber-100",
    };
    return {
      icon: XCircle,
      title: "Credential Not Found",
      subtitle: "No credential matching this hash exists on the network.",
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      ringColor: "ring-red-100",
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div className="w-full max-w-xl">
        <Link href="/verify" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className={`card p-8 md:p-10 ${status.border}`}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-16 h-16 rounded-full ${status.bg} ring-8 ${status.ringColor} flex items-center justify-center mb-5`}>
              <StatusIcon className={`w-8 h-8 ${status.color}`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{status.title}</h1>
            <p className="text-sm text-gray-500 max-w-sm">{status.subtitle}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1">Hash</p>
            <p className="font-mono text-xs text-gray-600 break-all">{hash}</p>
          </div>

          {result.exists && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                    <Building2 className="w-3 h-3" /> Issuer
                  </div>
                  <p className="text-sm text-gray-800 font-medium break-all">{result.issuer ?? "Unknown"}</p>
                  {result.institutionTier && (
                    <span className="mt-2 inline-flex text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md">
                      Tier {result.institutionTier}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                    <Calendar className="w-3 h-3" /> Issued
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    {result.issuedAt ? new Date(result.issuedAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" }) : "—"}
                  </p>
                </div>
              </div>

              {result.ipfsCid && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <FileText className="w-3.5 h-3.5" /> IPFS Metadata
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs"}/${result.ipfsCid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
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
