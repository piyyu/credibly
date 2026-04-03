import { CheckCircle, XCircle, AlertCircle, Building2, Calendar, FileText, ExternalLink } from "lucide-react";
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
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/verify/${hash}`,
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
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-500/20",
      glow: "bg-emerald-500/20"
    };
    if (result.exists && result.revoked) return {
      icon: AlertCircle,
      title: "Credential Revoked",
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-500/20",
      glow: "bg-amber-500/20"
    };
    return {
      icon: XCircle,
      title: "Credential Not Found",
      color: "text-red-400",
      bg: "bg-red-400/10",
      border: "border-red-500/20",
      glow: "bg-red-500/20"
    };
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-screen overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none ${status.glow}`} />

      <div className="w-full max-w-2xl relative z-10">
        <Link href="/verify" className="text-gray-400 hover:text-white text-sm font-medium mb-8 inline-block transition-colors">
          ← Back to Search
        </Link>
        
        <div className={`glass-panel p-8 md:p-12 rounded-3xl border ${status.border} shadow-2xl relative overflow-hidden`}>
          {/* Status Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative`}>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${status.bg.replace('/10', '')}`} />
              <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${status.bg} border ${status.border}`}>
                <StatusIcon className={`w-10 h-10 ${status.color}`} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">
              {status.title}
            </h1>
            <p className="text-gray-400 font-mono text-sm break-all max-w-md">
              Hash: {hash}
            </p>
          </div>

          {/* Details Card */}
          {result.exists && (
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">
                    <Building2 className="w-4 h-4" /> Issuer
                  </div>
                  <div className="text-white font-medium break-all">{result.issuer ?? "Unknown"}</div>
                  {result.institutionTier && (
                    <div className="mt-2 inline-flex border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded-md font-semibold">
                      Trust Tier: {result.institutionTier}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">
                    <Calendar className="w-4 h-4" /> Issuance Date
                  </div>
                  <div className="text-white font-medium">
                    {result.issuedAt ? new Date(result.issuedAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' }) : "—"}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Blockchain Record
                </div>
                {result.ipfsCid && (
                  <a 
                    href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs'}/${result.ipfsCid}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors"
                  >
                    View Original Metadata <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
