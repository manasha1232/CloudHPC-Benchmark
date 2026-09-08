import logging
import boto3
from botocore.exceptions import ClientError
from backend.config import config

logger = logging.getLogger("cloudhpc.batch")

def get_batch_client():
    if not config.is_aws_configured():
        return None
    return boto3.client(
        "batch",
        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
        region_name=config.AWS_REGION
    )

def check_aws_batch_connection() -> dict:
    if not config.is_aws_configured():
        return {"status": "unconfigured", "message": "AWS credentials missing."}
    try:
        client = get_batch_client()
        if not client:
            return {"status": "error", "message": "Failed to create AWS Batch client."}
        
        # Describe job queues
        response = client.describe_job_queues(jobQueues=[config.AWS_BATCH_JOB_QUEUE])
        queues = response.get("jobQueues", [])
        if not queues:
            return {
                "status": "queue_not_found",
                "message": f"AWS Batch Job Queue '{config.AWS_BATCH_JOB_QUEUE}' not found."
            }
        
        queue_status = queues[0].get("status")
        return {
            "status": "connected",
            "queue_name": config.AWS_BATCH_JOB_QUEUE,
            "queue_status": queue_status,
            "job_definition": config.AWS_BATCH_JOB_DEFINITION,
            "region": config.AWS_REGION
        }
    except ClientError as e:
        return {"status": "error", "message": f"AWS Batch ClientError: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"AWS Batch Error: {str(e)}"}

def submit_hpc_batch_job(job_name: str, algorithm: str, operations: int, workers: int) -> dict:
    client = get_batch_client()
    if not client:
        return {"success": False, "error": "AWS Batch client unavailable"}
    try:
        response = client.submit_job(
            jobName=job_name,
            jobQueue=config.AWS_BATCH_JOB_QUEUE,
            jobDefinition=config.AWS_BATCH_JOB_DEFINITION,
            containerOverrides={
                "environment": [
                    {"name": "ALGORITHM", "value": algorithm},
                    {"name": "OPERATIONS", "value": str(operations)},
                    {"name": "WORKERS", "value": str(workers)},
                    {"name": "S3_BUCKET", "value": config.AWS_S3_BUCKET_NAME},
                    {"name": "JOB_ID", "value": job_name}
                ]
            }
        )
        return {
            "success": True,
            "job_id": response["jobId"],
            "job_name": response["jobName"]
        }
    except Exception as e:
        logger.error(f"Failed to submit AWS Batch job: {e}")
        return {"success": False, "error": str(e)}

def get_aws_batch_job_status(job_id: str) -> dict:
    client = get_batch_client()
    if not client:
        return {"status": "UNKNOWN", "error": "AWS Batch client unavailable"}
    try:
        response = client.describe_jobs(jobs=[job_id])
        jobs = response.get("jobs", [])
        if not jobs:
            return {"status": "NOT_FOUND"}
        job = jobs[0]
        return {
            "job_id": job["jobId"],
            "job_name": job["jobName"],
            "status": job["status"],  # SUBMITTED, PENDING, RUNNABLE, STARTING, RUNNING, SUCCEEDED, FAILED
            "status_reason": job.get("statusReason", ""),
            "created_at": job.get("createdAt")
        }
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}
