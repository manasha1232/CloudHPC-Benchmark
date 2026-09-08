import React, { useState } from 'react';
import { Play, Layers, Users, Zap, Shield, Cloud } from 'lucide-react';

const ALGORITHM_CONFIGS = [
  { name: 'SHA-256', type: 'Fast Hash', defaultOps: 100000, color: 'text-blue-400' },
  { name: 'SHA-512', type: 'Fast Hash (64-bit)', defaultOps: 100000, color: 'text-indigo-400' },
  { name: 'bcrypt', type: 'Costly Adaptive', defaultOps: 50, color: 'text-emerald-400' },
  { name: 'PBKDF2', type: 'Iterative Key Deriv', defaultOps: 2000, color: 'text-amber-400' },
  { name: 'Argon2', type: 'Memory-Hard PHC', defaultOps: 30, color: 'text-purple-400' },
];

export default function BenchmarkForm({ onRunBenchmark, isRunning, awsStatus }) {
  const [selectedAlgos, setSelectedAlgos] = useState(['SHA-256', 'SHA-512', 'bcrypt', 'PBKDF2', 'Argon2']);
  const [workers, setWorkers] = useState(4);
  const [useAws, setUseAws] = useState(false);
  const [operations, setOperations] = useState({
    'SHA-256': 100000,
    'SHA-512': 100000,
    'bcrypt': 50,
    'PBKDF2': 2000,
    'Argon2': 30,
  });

  const toggleAlgo = (algoName) => {
    if (selectedAlgos.includes(algoName)) {
      if (selectedAlgos.length > 1) {
        setSelectedAlgos(selectedAlgos.filter((a) => a !== algoName));
      }
    } else {
      setSelectedAlgos([...selectedAlgos, algoName]);
    }
  };

  const handleOpsChange = (algoName, val) => {
    const num = Math.max(1, parseInt(val) || 1);
    setOperations((prev) => ({ ...prev, [algoName]: num }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRunBenchmark({
      algorithms: selectedAlgos,
      workers,
      operations,
      use_aws: useAws && awsStatus?.aws_configured,
    });
  };

  return (
    <div className="bg-hpc-card border border-hpc-border rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-hpc-border pb-4 mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Benchmark Configuration
        </h2>
        
        {/* Engine Toggle */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setUseAws(false)}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              !useAws
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Local Multi-Core
          </button>
          <button
            type="button"
            onClick={() => setUseAws(true)}
            disabled={!awsStatus?.aws_configured}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1 ${
              useAws && awsStatus?.aws_configured
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-500 cursor-not-allowed'
            }`}
            title={!awsStatus?.aws_configured ? "AWS credentials unconfigured" : "Run on AWS Batch"}
          >
            <Cloud className="w-3 h-3" />
            AWS Batch
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Algorithm Selection Grid */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            1. Select Hashing Algorithms
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ALGORITHM_CONFIGS.map((algo) => {
              const isSelected = selectedAlgos.includes(algo.name);
              return (
                <div
                  key={algo.name}
                  onClick={() => toggleAlgo(algo.name)}
                  className={`cursor-pointer rounded-lg p-3 border transition-all ${
                    isSelected
                      ? 'bg-blue-900/20 border-blue-500/50 shadow-md shadow-blue-950'
                      : 'bg-slate-900/40 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-sm font-bold ${algo.color}`}>
                      {algo.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-700 text-blue-500 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">{algo.type}</div>
                  
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        Test Ops:
                      </label>
                      <input
                        type="number"
                        value={operations[algo.name] || ''}
                        onChange={(e) => handleOpsChange(algo.name, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Parallel Worker Count Slider */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Parallel Workers (Compute Threads):
              </label>
              <span className="font-mono text-sm font-bold text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/50">
                {workers} Workers
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Splits hashing workloads across {workers} parallel processing cores.
            </p>
          </div>

          <div>
            <input
              type="range"
              min="1"
              max="32"
              value={workers}
              onChange={(e) => setWorkers(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>1 (Sequential)</span>
              <span>4</span>
              <span>8</span>
              <span>16</span>
              <span>32 Workers</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isRunning || selectedAlgos.length === 0}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isRunning || selectedAlgos.length === 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40 active:scale-[0.98]'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running HPC Benchmark...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run HPC Hash Benchmark</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
