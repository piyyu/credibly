interface VerifyResult {
  valid: boolean;
  exists: boolean;
  issuer?: string;
  issuedAt?: string;
  revoked?: boolean;
  ipfsCid?: string;
}

async function getResult(hash: string): Promise<VerifyResult> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/verify/${hash}`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function VerifyResultPage({ params }: { params: Promise<{ hash: string }> }) {
  const resolvedParams = await params;
  const hash = resolvedParams.hash || "";
  const result = await getResult(hash);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-6 p-8">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl
        ${result.valid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
        {result.valid ? "✓" : "✗"}
      </div>
      <h1 className="text-4xl font-bold">
        {result.valid ? "Credential Valid" : result.exists ? "Credential Revoked" : "Not Found"}
      </h1>
      {result.exists && (
        <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-800 space-y-3 text-sm">
          <Row label="Issuer" value={result.issuer ?? "—"} />
          <Row label="Issued At" value={result.issuedAt ? new Date(result.issuedAt).toLocaleString() : "—"} />
          <Row label="Status" value={result.revoked ? "Revoked" : "Active"} />
          {result.ipfsCid && (
            <a href={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}/${result.ipfsCid}`}
              target="_blank" rel="noreferrer" className="text-blue-400 hover:underline block">
              View full credential on IPFS ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}
