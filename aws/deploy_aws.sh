#!/usr/bin/env bash
set -e

echo "========================================="
echo " CloudHPC AWS Provisioning & Deployment  "
echo "========================================="

AWS_REGION="${AWS_REGION:-us-east-1}"
BUCKET_NAME="${BUCKET_NAME:-cloudhpc-benchmark-results}"
JOB_QUEUE_NAME="cloudhpc-job-queue"
JOB_DEF_NAME="cloudhpc-job-definition"

if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI ('aws') is not installed. Please install it first."
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "[1/4] AWS Account ID: ${ACCOUNT_ID} (Region: ${AWS_REGION})"

FINAL_BUCKET="${BUCKET_NAME}-${ACCOUNT_ID}"
echo "[2/4] Creating S3 Bucket '${FINAL_BUCKET}'..."
aws s3api create-bucket --bucket "${FINAL_BUCKET}" --region "${AWS_REGION}" || true

echo "[3/4] Creating ECR Repository 'cloudhpc-worker'..."
aws ecr create-repository --repository-name cloudhpc-worker --region "${AWS_REGION}" || true

echo "========================================="
echo " Configuration Summary for .env File: "
echo "========================================="
echo "AWS_REGION=${AWS_REGION}"
echo "AWS_S3_BUCKET_NAME=${FINAL_BUCKET}"
echo "AWS_BATCH_JOB_QUEUE=${JOB_QUEUE_NAME}"
echo "AWS_BATCH_JOB_DEFINITION=${JOB_DEF_NAME}"
echo "USE_AWS_BATCH=true"
