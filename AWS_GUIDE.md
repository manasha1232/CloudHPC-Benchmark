# CloudHPC AWS Attachment & Infrastructure Setup Guide

This guide explains step-by-step how to attach your **CloudHPC: Parallel Password Hashing Performance Benchmarking System** project to **AWS (Amazon Web Services)** using **AWS Batch** and **AWS S3**.

---

## 📋 Information Required to Connect to AWS

To connect this application to your AWS cloud account, you will need the following 5 pieces of information:

| Configuration Parameter | Description | Example / Default |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | Your AWS IAM User Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Your AWS IAM User Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS Data Center Region | `us-east-1` (or `us-west-2`, `ap-south-1`) |
| `AWS_S3_BUCKET_NAME` | S3 bucket name for job result storage | `cloudhpc-benchmark-results-12345` |
| `AWS_BATCH_JOB_QUEUE` | AWS Batch Job Queue name | `cloudhpc-job-queue` |

---

## 🛠️ Step 1: Obtain AWS Credentials

1. Sign in to your [AWS Management Console](https://console.aws.amazon.com/).
2. Navigate to **IAM (Identity and Access Management)** → **Users**.
3. Create or select a user with access permissions for **AWSBatchFullAccess** and **AmazonS3FullAccess**.
4. Go to **Security Credentials** tab → **Create Access Key**.
5. Copy your **Access Key ID** and **Secret Access Key**.

---

## 🚀 Step 2: Automated Resource Provisioning (One-Click)

We have included automated provisioning scripts in the `aws/` directory.

### On Windows (PowerShell):
```powershell
aws configure  # Enter Access Key ID, Secret Key, and Region
cd cloudhpc
.\aws\deploy_aws.ps1
```

### On Linux / macOS (Bash):
```bash
aws configure
cd cloudhpc
chmod +x ./aws/deploy_aws.sh
./aws/deploy_aws.sh
```

This will automatically create:
- An **AWS S3 Bucket** named `cloudhpc-benchmark-results-<account-id>`
- An **AWS ECR Repository** named `cloudhpc-worker`

---

## ⚙️ Step 3: Configure `.env` File

Create a file named `.env` in your project root (`C:\Users\manas\.gemini\antigravity\scratch\cloudhpc\.env`) with the following content:

```env
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# AWS Storage Configuration
AWS_S3_BUCKET_NAME=cloudhpc-benchmark-results-123456789012

# AWS Batch Configuration
AWS_BATCH_JOB_QUEUE=cloudhpc-job-queue
AWS_BATCH_JOB_DEFINITION=cloudhpc-job-definition

# Enable AWS Batch Mode
USE_AWS_BATCH=true
```

---

## 💻 Step 4: Building & Deploying the Worker Container to ECR (Optional for AWS Batch execution)

To run worker tasks inside AWS Batch container instances:

1. Build Docker image:
```bash
docker build -t cloudhpc-worker -f aws/Dockerfile .
```

2. Authenticate Docker with AWS ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

3. Push container image:
```bash
docker tag cloudhpc-worker:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloudhpc-worker:latest
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/cloudhpc-worker:latest
```

---

## 🔄 Dual Execution Mode Architecture

```text
       ┌────────────────────────┐
       │   React Dashboard UI   │
       └───────────┬────────────┘
                   │
                   ▼
       ┌────────────────────────┐
       │     FastAPI Backend    │
       └───────┬────────┬───────┘
               │        │
   USE_AWS_BATCH=false  USE_AWS_BATCH=true
               │        │
               ▼        ▼
       ┌──────────┐  ┌──────────┐
       │ Local    │  │ AWS      │
       │ Multi-   │  │ Batch +  │
       │ Core CPU │  │ AWS S3   │
       └──────────┘  └──────────┘
```

- **Local Mode** (`USE_AWS_BATCH=false`): Executes benchmarks immediately using Python's `multiprocessing.Pool` across your local CPU cores. Zero cloud setup or cost required.
- **AWS Batch Mode** (`USE_AWS_BATCH=true`): Submits parallel worker tasks to AWS Batch compute nodes, storing task specifications and result logs in AWS S3.
