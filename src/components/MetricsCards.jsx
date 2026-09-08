import React from 'react';
import { Zap, Gauge, Clock, Users } from 'lucide-react';

export default function MetricsCards({ results }) {
  if (!results) return null;

  const {
    workers = 4,
    total_sequential_seconds = 0,
    total_parallel_seconds = 0,
    overall_speedup = 1.0,
    overall_efficiency_percent = 100.0,
  } = results;

  const cards = [
    {
      title: 'Speedup Factor',
      value: `${overall_speedup}x`,
      subtitle: `S = T(1) / T(${workers})`,
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Parallel Efficiency',
      value: `${overall_efficiency_percent}%`,
      subtitle: `E = (Speedup / ${workers}) × 100%`,
      icon: Gauge,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Sequential Runtime',
      value: `${total_sequential_seconds}s`,
      subtitle: 'Single Core Execution',
      icon: Clock,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      title: 'Parallel Runtime',
      value: `${total_parallel_seconds}s`,
      subtitle: `${workers} Workers Parallelized`,
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-xl border p-5 bg-hpc-card shadow-lg ${card.bg} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color} tracking-tight`}>
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
}
