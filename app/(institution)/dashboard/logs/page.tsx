"use client";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "@/lib/solana/client";

export default function LogsPage() {
  const { connection } = useConnection();
  const [logs, setLogs] = useState<{ signature: string; blockTime?: number | null; err: unknown }[]>([]);

  useEffect(() => {
    connection
      .getSignaturesForAddress(PROGRAM_ID, { limit: 50 })
      .then(setLogs);
  }, [connection]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.signature} className="flex items-center justify-between bg-gray-900 rounded-lg p-3 text-sm">
            <span className="font-mono text-gray-300 truncate w-64">{log.signature}</span>
            <span className="text-gray-500">{log.blockTime ? new Date(log.blockTime * 1000).toLocaleString() : "pending"}</span>
            <span className={log.err ? "text-red-400" : "text-green-400"}>{log.err ? "Failed" : "Success"}</span>
            <a href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`}
              target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              Explorer ↗
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
