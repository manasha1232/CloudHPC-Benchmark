import React from 'react';
import { Table, CheckCircle2, Award, Zap } from 'lucide-react';

export default function ResultsDashboard({ results }) {
  if (!results || !results.algorithm_results) return null;

  const { algorithm_results, workers } = results;

  return (
    <div className="bg-hpc-card border border-hpc-border rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-hpc-border pb-4 mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Table className="w-5 h-5 text-blue-400" />
          Detailed Hashing Performance Matrix
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          Tested on {workers} parallel worker nodes
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Algorithm</th>
              <th className="py-3 px-4">Operations</th>
              <th className="py-3 px-4">Sequential Time</th>
              <th className="py-3 px-4">Parallel Time</th>
              <th className="py-3 px-4">Throughput (Hashes/sec)</th>
              <th className="py-3 px-4">Speedup (S)</th>
              <th className="py-3 px-4">Parallel Efficiency (E)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {algorithm_results.map((row, idx) => {
              const isHighSpeedup = row.speedup >= 2.0;
              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {row.algorithm}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {row.operations.toLocaleString()} ops
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {row.sequential_seconds}s
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    {row.parallel_seconds}s
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-400">
                      {row.parallel_hps.toLocaleString()}
                    </span>{' '}
                    <span className="text-[10px] text-slate-500">H/s</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        isHighSpeedup
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {row.speedup}x
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-purple-400 font-bold">
                      {row.efficiency_percent}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
