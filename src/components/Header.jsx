import React from 'react';
import { Cpu, Cloud, Server, Activity, ShieldCheck } from 'lucide-react';

export default function Header({ systemInfo, awsStatus, onOpenAwsModal }) {
  const isAwsConfigured = awsStatus?.aws_configured;

  return (
    <header className="bg-hpc-card border-b border-hpc-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Cpu className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              CloudHPC Benchmark
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v1.0 HPC
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Parallel Password Hashing Performance Benchmarking System
            </p>
          </div>
        </div>

        {/* System & AWS Badges */}
        <div className="flex items-center gap-3">
          
          {/* Local Hardware Info */}
          {systemInfo && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <Server className="w-4 h-4 text-purple-400" />
              <span>
                <strong className="text-white">{systemInfo.cpu_count_logical} Cores</strong> ({systemInfo.os_platform})
              </span>
            </div>
          )}

          {/* AWS Cloud Status Button */}
          <button
            onClick={onOpenAwsModal}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isAwsConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>AWS: {isAwsConfigured ? 'Connected' : 'Local Mode'}</span>
            <Activity className="w-3 h-3 ml-0.5 opacity-80" />
          </button>
        </div>

      </div>
    </header>
  );
}
