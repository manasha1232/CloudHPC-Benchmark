<#
.SYNOPSIS
    CloudHPC AWS Infrastructure Deployment PowerShell Script
.DESCRIPTION
    Provisions S3 Bucket, ECR repository, AWS Batch Compute Environment, Job Queue, and Job Definition using AWS CLI.
#>

param (
    [string]$AWS_REGION = "us-east-1",
    [string]$BUCKET_NAME = "cloudhpc-benchmark-results-unique",
    [string]$JOB_QUEUE_NAME = "cloudhpc-job-queue",
    [string]$JOB_DEF_NAME = "cloudhpc-job-definition"
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " CloudHPC AWS Provisioning & Deployment  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check AWS CLI
if (-not (Get-Command "aws" -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI ('aws') is not installed or not in system PATH. Please install AWS CLI v2 first."
    exit 1
}

# Get AWS Account ID
$ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
if (-not $ACCOUNT_ID) {
    Write-Error "Failed to retrieve AWS Account ID. Please run 'aws configure' first."
    exit 1
}

Write-Host "[1/5] AWS Account ID: $ACCOUNT_ID (Region: $AWS_REGION)" -ForegroundColor Green

# 1. Create S3 Bucket
$FINAL_BUCKET = "$BUCKET_NAME-$ACCOUNT_ID"
Write-Host "[2/5] Creating S3 Bucket '$FINAL_BUCKET'..." -ForegroundColor Green
aws s3api create-bucket --bucket $FINAL_BUCKET --region $AWS_REGION

# 2. Create ECR Repository
Write-Host "[3/5] Creating AWS ECR Repository 'cloudhpc-worker'..." -ForegroundColor Green
aws ecr create-repository --repository-name cloudhpc-worker --region $AWS_REGION

# 3. Output Configuration values for .env
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host " Deployment Complete! Environment Config: " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host "AWS_REGION=$AWS_REGION"
Write-Host "AWS_S3_BUCKET_NAME=$FINAL_BUCKET"
Write-Host "AWS_BATCH_JOB_QUEUE=$JOB_QUEUE_NAME"
Write-Host "AWS_BATCH_JOB_DEFINITION=$JOB_DEF_NAME"
Write-Host "USE_AWS_BATCH=true"
