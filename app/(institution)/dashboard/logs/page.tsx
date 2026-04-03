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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Audit Logs</h1>
        <p className="text-gray-400">Irrefutable cryptographic history of all operations affecting the Credibly Anchor program.</p>
      </motion.div>

      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 relative">
        <div className="bg-white/5 border-b border-white/10 px-6 py-4 grid grid-cols-12 gap-4 text-xs tracking-wider uppercase font-semibold text-gray-500">
          <div className="col-span-6 md:col-span-5">Signature</div>
          <div className="col-span-4 md:col-span-4">Timestamp</div>
          <div className="col-span-2 md:col-span-2 text-center">Status</div>
          <div className="col-span-1 hidden md:block"></div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-emerald-500 animate-pulse font-mono flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin-slow" /> Fetching ledger history...
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
            {logs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.02 }}
                key={log.signature} 
                className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-colors group"
              >
                <div className="col-span-6 md:col-span-5 font-mono text-gray-300 text-sm truncate pr-4">
                  {log.signature}
                </div>
                <div className="col-span-4 md:col-span-4 text-gray-500 text-sm flex items-center gap-2">
                  <Clock className="w-3 h-3 text-gray-600" />
                  {log.blockTime ? new Date(log.blockTime * 1000).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Pending..."}
                </div>
                <div className="col-span-2 md:col-span-2 text-center">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${log.err ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {log.err ? "Failed" : "Success"}
                  </span>
                </div>
                <div className="col-span-1 hidden md:flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={`https://explorer.solana.com/tx/${log.signature}?cluster=devnet`} target="_blank" rel="noreferrer" 
                    className="p-2 text-gray-400 hover:text-white bg-black/40 hover:bg-white/10 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
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
