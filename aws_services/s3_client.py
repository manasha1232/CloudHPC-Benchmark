import json
import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from backend.config import config

logger = logging.getLogger("cloudhpc.s3")

def get_s3_client():
    if not config.is_aws_configured():
        return None
    return boto3.client(
        "s3",
        aws_access_key_id=config.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=config.AWS_SECRET_ACCESS_KEY,
        region_name=config.AWS_REGION
    )

def check_s3_connection() -> dict:
    if not config.is_aws_configured():
        return {"status": "unconfigured", "message": "AWS credentials missing."}
    try:
        client = get_s3_client()
        if not client:
            return {"status": "error", "message": "Failed to create S3 client."}
        
        # Check if bucket exists
        client.head_bucket(Bucket=config.AWS_S3_BUCKET_NAME)
        return {
            "status": "connected",
            "bucket": config.AWS_S3_BUCKET_NAME,
            "region": config.AWS_REGION
        }
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        if error_code == "404":
            return {"status": "bucket_not_found", "message": f"Bucket '{config.AWS_S3_BUCKET_NAME}' does not exist."}
        return {"status": "error", "message": f"S3 ClientError ({error_code}): {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"S3 Error: {str(e)}"}

def upload_benchmark_task(job_id: str, task_data: dict) -> bool:
    client = get_s3_client()
    if not client:
        return False
    try:
        key = f"jobs/{job_id}/task.json"
        client.put_object(
            Bucket=config.AWS_S3_BUCKET_NAME,
            Key=key,
            Body=json.dumps(task_data),
            ContentType="application/json"
        )
        return True
    except Exception as e:
        logger.error(f"Failed to upload task for job {job_id}: {e}")
        return False

def get_benchmark_result(job_id: str) -> dict | None:
    client = get_s3_client()
    if not client:
        return None
    try:
        key = f"results/{job_id}/result.json"
        response = client.get_object(Bucket=config.AWS_S3_BUCKET_NAME, Key=key)
        data = json.loads(response['Body'].read().decode('utf-8'))
        return data
    except Exception as e:
        logger.error(f"Failed to retrieve result for job {job_id}: {e}")
        return None
