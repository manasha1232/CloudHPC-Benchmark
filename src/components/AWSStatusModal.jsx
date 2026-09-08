import React from 'react';
import { X, Cloud, CheckCircle, AlertTriangle, ExternalLink, Key, Server, Terminal, Copy } from 'lucide-react';

export default function AWSStatusModal({ isOpen, onClose, awsStatus }) {
  if (!isOpen) return null;

  const isConfigured = awsStatus?.aws_configured;
  const s3 = awsStatus?.s3;
  const batch = awsStatus?.batch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-hpc-card border border-hpc-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hpc-border bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">AWS Cloud HPC Services Setup</h3>
              <p className="text-xs text-slate-400">AWS Batch & AWS S3 Container Connectivity Status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Connection Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              isConfigured
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
            }`}
          >
            {isConfigured ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {isConfigured ? 'AWS Services Connected' : 'Running in Local Multiprocessing Mode'}
              </h4>
              <p className="text-xs mt-1 text-slate-300">
                {isConfigured
                  ? `Connected to AWS Region: ${awsStatus?.region}.`
                  : 'AWS credentials are missing or unconfigured. The system automatically runs high-speed parallel benchmarking on your local multi-core CPU.'}
              </p>
            </div>
          </div>

          {/* Diagnostic Details */}
          {isConfigured && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">AWS S3 Storage Status:</span>
                <span className="text-emerald-400 font-bold">{s3?.status || 'Unknown'}</span>
                {s3?.bucket && <div className="text-[11px] text-slate-400 mt-1">Bucket: {s3.bucket}</div>}
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block mb-1">AWS Batch Queue Status:</span>
                <span className="text-emerald-400 font-bold">{batch?.status || 'Unknown'}</span>
                {batch?.queue_name && <div className="text-[11px] text-slate-400 mt-1">Queue: {batch.queue_name}</div>}
              </div>
            </div>
          )}

          {/* Guide on How to Attach AWS Services */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              How to Connect Your AWS Services to This Project
            </h4>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              To connect this project to your AWS cloud account, open or create a <code className="text-amber-400 bg-slate-900 px-1 py-0.5 rounded">.env</code> file in the <code className="text-blue-400">cloudhpc/</code> root folder with these credentials:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 relative">
              <pre className="whitespace-pre-wrap">{`AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=cloudhpc-benchmark-results
AWS_BATCH_JOB_QUEUE=cloudhpc-job-queue
AWS_BATCH_JOB_DEFINITION=cloudhpc-job-definition
USE_AWS_BATCH=true`}</pre>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg text-xs text-slate-300 border border-slate-800">
              <strong className="text-white block mb-1">Automated One-Click AWS Provisioning Script:</strong>
              Run <code className="text-purple-400 font-mono">./aws/deploy_aws.ps1</code> or <code className="text-purple-400 font-mono">./aws/deploy_aws.sh</code> to automatically create your S3 bucket, ECR repository, and AWS Batch environment!
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-hpc-border bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
