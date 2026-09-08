import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BenchmarkForm from './components/BenchmarkForm';
import MetricsCards from './components/MetricsCards';
import ResultsDashboard from './components/ResultsDashboard';
import Charts from './components/Charts';
import AWSStatusModal from './components/AWSStatusModal';

export default function App() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [awsStatus, setAwsStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial data loading
  useEffect(() => {
    fetch('/api/system/info')
      .then((res) => res.json())
      .then((data) => setSystemInfo(data))
      .catch((err) => console.warn('Could not fetch system info:', err));

    fetch('/api/aws/status')
      .then((res) => res.json())
      .then((data) => setAwsStatus(data))
      .catch((err) => console.warn('Could not fetch AWS status:', err));
  }, []);

  const handleRunBenchmark = async (config) => {
    setIsRunning(true);
    setErrorMsg('');
    setResults(null);

    try {
      const response = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Benchmark execution failed.');
      }

      const data = await response.json();

      if (data.results) {
        setResults(data.results);
      } else if (data.job_id) {
        // Poll for AWS or Async execution status
        pollJobStatus(data.job_id);
        return;
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error executing benchmark suite.');
    } finally {
      setIsRunning(false);
    }
  };

  const pollJobStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/benchmark/status/${jobId}`);
        const data = await res.json();
        if (data.status === 'COMPLETED' && data.results) {
          setResults(data.results);
          setIsRunning(false);
          clearInterval(interval);
        } else if (data.status === 'FAILED') {
          setErrorMsg(data.error || 'Job failed on cloud worker node.');
          setIsRunning(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-hpc-dark text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        systemInfo={systemInfo}
        awsStatus={awsStatus}
        onOpenAwsModal={() => setIsAwsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg('')}
              className="text-xs font-bold underline hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Benchmark Configuration Form */}
        <BenchmarkForm
          onRunBenchmark={handleRunBenchmark}
          isRunning={isRunning}
          awsStatus={awsStatus}
        />

        {/* HPC Top Metrics Cards */}
        {results && <MetricsCards results={results} />}

        {/* Performance Visualization Charts */}
        {results && <Charts results={results} />}

        {/* Detailed Results Table */}
        {results && <ResultsDashboard results={results} />}

      </main>

      {/* Footer */}
      <footer className="border-t border-hpc-border bg-hpc-card/50 py-6 text-center text-xs text-slate-500 font-mono">
        CloudHPC Architecture: React + FastAPI + AWS Batch / Local Multiprocessing Engine
      </footer>

      {/* AWS Status & Setup Modal */}
      <AWSStatusModal
        isOpen={isAwsModalOpen}
        onClose={() => setIsAwsModalOpen(false)}
        awsStatus={awsStatus}
      />
    </div>
  );
}
