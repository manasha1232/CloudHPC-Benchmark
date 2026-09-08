#!/usr/bin/env python3
"""
CloudHPC AWS Batch Worker Node Entrypoint Script
Executes password hash benchmarking task inside AWS Batch Docker Container
and uploads the JSON benchmark result to AWS S3.
"""
import os
import sys
import json
import logging

# Ensure backend package is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.benchmark.runner import run_full_benchmark_suite
import boto3

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloudhpc.aws_worker")

def main():
    logger.info("=== Starting CloudHPC AWS Batch Worker Task ===")
    
    # Read environment variables set by AWS Batch container overrides
    job_id = os.environ.get("JOB_ID", "local-test-job")
    algorithms_raw = os.environ.get("ALGORITHM", "SHA-256")
    algorithms = [a.strip() for a in algorithms_raw.split(",") if a.strip()]
    
    try:
        operations_count = int(os.environ.get("OPERATIONS", "10000"))
    except ValueError:
        operations_count = 10000

    try:
        workers = int(os.environ.get("WORKERS", "4"))
    except ValueError:
        workers = 4

    s3_bucket = os.environ.get("S3_BUCKET", "")
    aws_region = os.environ.get("AWS_DEFAULT_REGION", "us-east-1")

    logger.info(f"Task Job ID: {job_id}")
    logger.info(f"Algorithms: {algorithms}")
    logger.info(f"Total Operations per algo: {operations_count}")
    logger.info(f"Parallel Worker Threads/Processes: {workers}")

    ops_map = {algo: operations_count for algo in algorithms}

    # Execute benchmark suite
    start_time = logger.info("Running benchmark calculations...")
    results = run_full_benchmark_suite(algorithms, ops_map, workers)
    logger.info("Benchmark calculation completed!")

    output_payload = {
        "job_id": job_id,
        "mode": "AWS Batch Node",
        "region": aws_region,
        "results": results
    }

    # Output to stdout
    print(json.dumps(output_payload, indent=2))

    # Upload results to AWS S3 if bucket is provided
    if s3_bucket:
        try:
            logger.info(f"Uploading results to S3 bucket: {s3_bucket}")
            s3_client = boto3.client("s3", region_name=aws_region)
            s3_key = f"results/{job_id}/result.json"
            s3_client.put_object(
                Bucket=s3_bucket,
                Key=s3_key,
                Body=json.dumps(output_payload),
                ContentType="application/json"
            )
            logger.info(f"Successfully uploaded result to s3://{s3_bucket}/{s3_key}")
        except Exception as e:
            logger.error(f"Failed to upload result to S3: {e}")
            sys.exit(1)

    logger.info("=== AWS Batch Worker Task Completed Successfully ===")

if __name__ == "__main__":
    main()
