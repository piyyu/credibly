"use client";
import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PROGRAM_ID } from "@/lib/solana/client";
import { motion } from "framer-motion";
import { Clock, ExternalLink } from "lucide-react";

export default function LogsPage() {
  const { connection } = useConnection();
  const [logs, setLogs] = useState<{ signature: string; blockTime: number | null; err: unknown }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connection
      .getSignaturesForAddress(PROGRAM_ID, { limit: 50 })
      .then((data) => {
        setLogs(data.map(d => ({ ...d, blockTime: d.blockTime ?? null })));
        setLoading(false);
      });
  }, [connection]);

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Audit Logs</h1>
        <p className="text-sm text-gray-500">On-chain transaction history for the Credibly program.</p>
      </motion.div>

      <div className="card overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 grid grid-cols-12 gap-4 text-[11px] tracking-wider uppercase font-semibold text-gray-400">
          <div className="col-span-5">Signature</div>
          <div className="col-span-4">Timestamp</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1"></div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" /> Loading transactions...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No transactions found for this program.
          </div>
        ) : (
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {logs.map((log, i) => (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                key={log.signature}
                className="px-6 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/80 transition-colors group"
              >
                <div className="col-span-5 font-mono text-gray-600 text-xs truncate pr-4">
                  {log.signature}
                </div>
                <div className="col-span-4 text-gray-500 text-xs flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gray-300" />
                  {log.blockTime
                    ? new Date(log.blockTime * 1000).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                    : "Pending..."}
                </div>
                <div className="col-span-2 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    log.err ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {log.err ? "Failed" : "Success"}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
