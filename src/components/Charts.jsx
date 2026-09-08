import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';

export default function Charts({ results }) {
  if (!results || !results.algorithm_results) return null;

  const chartData = results.algorithm_results.map((r) => ({
    name: r.algorithm,
    'Sequential H/s': r.sequential_hps,
    'Parallel H/s': r.parallel_hps,
    Speedup: r.speedup,
    Efficiency: r.efficiency_percent,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Throughput Bar Chart */}
      <div className="bg-hpc-card border border-hpc-border rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          Throughput Comparison (Hashes / Second)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Sequential H/s" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Parallel H/s" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speedup Bar Chart */}
      <div className="bg-hpc-card border border-hpc-border rounded-xl p-6 shadow-xl">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          HPC Speedup Multiplier ($S = T_1 / T_P$)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                itemStyle={{ color: '#E2E8F0', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Speedup" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Speedup Factor (x)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
