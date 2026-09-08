<div align="center">

# ⚡ CloudHPC: Parallel Password Hashing Performance Benchmarking System

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![AWS Batch](https://img.shields.io/badge/AWS_Batch-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/batch/)
[![AWS S3](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Python 3.11](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

*An Enterprise High-Performance Computing (HPC) benchmarking suite designed to analyze, evaluate, and visualize compute throughput, latency, parallel speedup ($S = T_1 / T_p$), and parallel efficiency ($E = \frac{S}{P} \times 100\%$) across modern cryptographic hashing algorithms.*

</div>

---

## 📌 Project Overview

**CloudHPC** bridges the gap between High-Performance Computing and Security Engineering. It provides a dual-engine architecture capable of comparing fast general hashing functions (**SHA-256**, **SHA-512**) against compute/memory-hard key derivation algorithms (**bcrypt**, **PBKDF2**, **Argon2**).

The system quantifies hardware scaling by running workloads across local multi-core CPU process pools and distributed **AWS Batch compute nodes**, uploading task metrics to **AWS S3** for interactive dashboard visualization.

---

## 🎯 Key Features

- 🚀 **Dual Execution Engines**:
  - **Local Multi-Core Engine**: Executes parallel workloads across local CPU cores via Python process pooling (`multiprocessing.Pool`). Zero cloud setup required.
  - **AWS Cloud HPC Engine**: Submits distributed tasks to **AWS Batch** compute environments with automated **AWS S3** task result aggregation.
- 🔐 **5 Benchmarked Hashing Algorithms**:
  - **SHA-256**: Standard 256-bit cryptographic hash.
  - **SHA-512**: 64-bit architecture-optimized cryptographic hash.
  - **bcrypt**: Adaptive Blowfish-based password hash.
  - **PBKDF2**: Iterative HMAC-SHA256 key derivation (10,000 rounds).
  - **Argon2id**: Winner of Password Hashing Competition (PHC), memory-hard standard.
- 📊 **Real-time HPC Analytics**:
  - **Speedup Factor ($S$)**: Measure speed improvements from $P$ parallel workers ($S = T_1 / T_p$).
  - **Parallel Efficiency ($E$)**: Percentage of hardware compute utilization ($E = \frac{S}{P} \times 100\%$).
  - **Throughput (Hashes / sec)**: Quantifies cryptographic operations per second ($H/s$).
- 🛡️ **Ethical & Safe Design**: Benchmark generator uses synthetic random strings strictly designed for resource testing. No wordlists, dictionary attacks, or password cracking tools included.

---

## 📐 System Architecture

```text
                               ┌──────────────────────────┐
                               │   React 18 Dashboard UI   │
                               │ (Recharts + Tailwind CSS)│
                               └────────────┬─────────────┘
                                            │ HTTP / REST
                                            ▼
                               ┌──────────────────────────┐
                               │  FastAPI Backend Service │
                               │    (Python 3.11 Async)   │
                               └───────┬──────────┬───────┘
                                       │          │
                     ┌─────────────────┘          └────────────────┐
                     │ (Local Multi-Core)                          │ (AWS Cloud HPC)
                     ▼                                             ▼
       ┌──────────────────────────┐                  ┌──────────────────────────┐
       │ multiprocessing.Pool     │                  │ AWS Batch Compute Queue  │
       │ (1 to 32 Parallel Cores) │                  │ (Fargate Container Nodes)│
       └────────────┬─────────────┘                  └────────────┬─────────────┘
                    │                                             │
                    └───────────────────┬─────────────────────────┘
                                        ▼
                         ┌──────────────────────────┐
                         │  AWS S3 Result Storage   │
                         │  & Dashboard Analytics   │
                         └──────────────────────────┘
```

---

## 📊 Live Benchmark Benchmark Metrics

Below are actual empirical results captured from live HPC benchmark runs across 11 parallel worker nodes:

| Hashing Algorithm | Operation Count | Sequential Time ($T_1$) | Parallel Time ($T_{11}$) | Throughput (Hashes/sec) | Speedup Factor ($S$) | Parallel Efficiency ($E$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SHA-256** | 100,000 ops | 3.0917s | **0.5965s** | **167,647.49 H/s** | **5.18x** | 47.1% |
| **SHA-512** | 100,000 ops | 3.2279s | **0.5631s** | **177,585.42 H/s** | **5.73x** | 52.1% |
| **bcrypt** | 50 ops | 8.9636s | **1.0882s** | **45.95 H/s** | **8.24x** | 74.9% |
| **PBKDF2** | 2,000 ops | 42.2063s | **2.7744s** | **720.89 H/s** | **15.21x** | **138.3%** |
| **Argon2** | 30 ops | 1.6882s | **0.4955s** | **60.54 H/s** | **3.41x** | 31.0% |

> **Overall Benchmark Suite Result**:
> - **Total Sequential Time**: `59.1777s`
> - **Total Parallel Time**: `5.5177s`
> - **Overall Speedup**: **`10.73x`**
> - **Overall Parallel Efficiency**: **`97.5%`**

---

## 🧮 Mathematical Formulations

The system measures scaling efficiency using standard High-Performance Computing metrics:

1. **Parallel Speedup ($S$)**:
   $$S = \frac{T_1}{T_P}$$
   *where $T_1$ is execution time on 1 worker and $T_P$ is execution time on $P$ parallel workers.*

2. **Parallel Efficiency ($E$)**:
   $$E = \left( \frac{S}{P} \right) \times 100\%$$
   *where $P$ is the number of active worker nodes.*

3. **Throughput ($H/s$)**:
   $$\text{Throughput} = \frac{\text{Total Hashing Operations}}{\text{Elapsed Execution Seconds}}$$

---

## 📁 Repository Structure

```text
cloudhpc/
├── backend/
│   ├── main.py                  # FastAPI server entry point & REST endpoints
│   ├── config.py                # Environment & AWS configuration loader
│   ├── requirements.txt         # Python dependencies
│   ├── benchmark/               # Benchmark hashing & runner modules
│   │   ├── hasher.py            # SHA256, SHA512, bcrypt, PBKDF2, Argon2 wrappers
│   │   └── runner.py            # Sequential vs Parallel process pool manager
│   ├── aws_services/            # AWS SDK integrations
│   │   ├── batch_client.py      # AWS Batch job submitter & queue monitor
│   │   └── s3_client.py         # AWS S3 task uploader & result fetcher
│   └── tests/                   # Pytest test suite (100% pass rate)
│       ├── test_hasher.py
│       └── test_runner.py
├── frontend/
│   ├── index.html               # React HTML entrypoint
│   ├── package.json             # NPM dependencies
│   ├── vite.config.js           # Vite dev server & API proxy config
│   ├── tailwind.config.js       # Custom dark HPC theme config
│   └── src/
│       ├── App.jsx              # Main dashboard application container
│       └── components/          # UI Components
│           ├── Header.jsx       # Hardware & AWS connection status bar
│           ├── BenchmarkForm.jsx# Interactive algorithm & worker node selector
│           ├── MetricsCards.jsx # Top HPC summary cards (Speedup, Efficiency)
│           ├── ResultsDashboard.jsx # Matrix comparison table
│           ├── Charts.jsx       # Recharts performance visualizations
│           └── AWSStatusModal.jsx # AWS Cloud setup & diagnostic modal
├── aws/                         # Cloud Deployment Artifacts
│   ├── worker_node.py           # Container entrypoint script for AWS Batch
│   ├── deploy_aws.ps1           # Windows PowerShell automated AWS setup script
│   └── deploy_aws.sh            # Linux/macOS Bash automated AWS setup script
├── .env.example                 # Environment variables configuration template
├── AWS_GUIDE.md                 # Detailed step-by-step AWS provisioning guide
└── README.md                    # Project documentation
```

---

## ⚡ Quick Start Guide (Local Execution)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Run Backend Service
```bash
# Clone the repository
git clone https://github.com/your-username/cloudhpc.git
cd cloudhpc

# Install Python dependencies
pip install -r backend/requirements.txt

# Run FastAPI backend
python -m uvicorn backend.main:app --reload --port 8000
```

### 3. Run Frontend Dashboard
Open a second terminal window:
```bash
cd cloudhpc/frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## ☁️ AWS Cloud Setup

To attach your AWS account to **AWS Batch** and **AWS S3**:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your AWS credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=ap-southeast-2
   AWS_S3_BUCKET_NAME=cloudhpc-benchmark-results
   AWS_BATCH_JOB_QUEUE=cloudhpc-job-queue
   AWS_BATCH_JOB_DEFINITION=cloudhpc-job-definition
   USE_AWS_BATCH=true
   ```
3. Refer to [`AWS_GUIDE.md`](./AWS_GUIDE.md) for full instructions on provisioning AWS S3 and AWS Batch resources.

---

## 🛡️ License & Ethical Standards

This software is released under the **MIT License**.

> **Notice**: This project is engineered exclusively for High-Performance Computing benchmarking and educational resource comparison. It uses synthetic random strings and contains no dictionary attack mechanisms, wordlists, or vulnerability exploitation code.
