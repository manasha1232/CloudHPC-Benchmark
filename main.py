import uuid
import psutil
import platform
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from starlette.background import BackgroundTask
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict

from backend.config import config
from backend.benchmark.hasher import ALGORITHM_MAP
from backend.benchmark.runner import run_full_benchmark_suite
from backend.aws_services.s3_client import check_s3_connection, upload_benchmark_task, get_benchmark_result
from backend.aws_services.batch_client import check_aws_batch_connection, submit_hpc_batch_job, get_aws_batch_job_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cloudhpc.api")

app = FastAPI(
    title="CloudHPC Benchmark API",
    description="Parallel Password Hashing Performance Benchmarking System with AWS Batch & Local Multiprocessing Engines",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for local job results
in_memory_jobs: Dict[str, dict] = {}

class BenchmarkRequest(BaseModel):
    algorithms: List[str] = Field(default=["SHA-256", "SHA-512", "bcrypt", "PBKDF2", "Argon2"])
    workers: int = Field(default=4, ge=1, le=64)
    operations: Dict[str, int] = Field(default={
        "SHA-256": 100000,
        "SHA-512": 100000,
        "bcrypt": 50,
        "PBKDF2": 2000,
        "Argon2": 30
    })
    use_aws: bool = Field(default=False)

@app.get("/")
def read_root():
    return {
        "service": "CloudHPC Benchmark Engine",
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/algorithms")
def get_supported_algorithms():
    return {
        "algorithms": [
            {
                "name": "SHA-256",
                "type": "General Hashing (Fast)",
                "default_ops": 100000,
                "description": "Standard 256-bit SHA-2 cryptographic hash function."
            },
            {
                "name": "SHA-512",
                "type": "General Hashing (Fast)",
                "default_ops": 100000,
                "description": "512-bit SHA-2 cryptographic hash optimized for 64-bit architectures."
            },
            {
                "name": "bcrypt",
                "type": "Key Derivation (Memory & CPU Intensive)",
                "default_ops": 50,
                "description": "Blowfish-based adaptive password hash with configurable cost parameters."
            },
            {
                "name": "PBKDF2",
                "type": "Key Derivation (Iterative CPU)",
                "default_ops": 2000,
                "description": "Password-Based Key Derivation Function 2 using HMAC-SHA256 with 10,000 iterations."
            },
            {
                "name": "Argon2",
                "type": "Memory-Hard Hashing (Modern Standard)",
                "default_ops": 30,
                "description": "PHC winner Argon2id memory-hard password hashing algorithm."
            }
        ]
    }

@app.get("/api/system/info")
def get_system_info():
    return {
        "cpu_count_logical": psutil.cpu_count(logical=True),
        "cpu_count_physical": psutil.cpu_count(logical=False),
        "cpu_freq_mhz": round(psutil.cpu_freq().current, 2) if psutil.cpu_freq() else None,
        "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
        "os_platform": platform.system(),
        "os_release": platform.release(),
        "processor": platform.processor()
    }

@app.get("/api/aws/status")
def get_aws_status():
    is_configured = config.is_aws_configured()
    s3_status = check_s3_connection() if is_configured else {"status": "unconfigured"}
    batch_status = check_aws_batch_connection() if is_configured else {"status": "unconfigured"}
    
    return {
        "aws_configured": is_configured,
        "region": config.AWS_REGION if is_configured else None,
        "s3": s3_status,
        "batch": batch_status,
        "use_aws_batch_default": config.USE_AWS_BATCH
    }

def run_local_benchmark_job(job_id: str, algorithms: list, operations_map: dict, workers: int):
    in_memory_jobs[job_id] = {"status": "RUNNING", "progress": 10}
    try:
        results = run_full_benchmark_suite(algorithms, operations_map, workers)
        in_memory_jobs[job_id] = {
            "status": "COMPLETED",
            "mode": "Local Multiprocessing",
            "results": results
        }
    except Exception as e:
        logger.error(f"Error executing local benchmark job {job_id}: {e}")
        in_memory_jobs[job_id] = {
            "status": "FAILED",
            "error": str(e)
        }

@app.post("/api/benchmark/run")
def start_benchmark(req: BenchmarkRequest):
    # Validate algorithms
    invalid_algos = [a for a in req.algorithms if a not in ALGORITHM_MAP]
    if invalid_algos:
        raise HTTPException(status_code=400, detail=f"Invalid algorithms: {invalid_algos}")

    job_id = f"job-{uuid.uuid4().hex[:8]}"

    if req.use_aws and config.is_aws_configured():
        # AWS Batch HPC Mode
        task_payload = {
            "job_id": job_id,
            "algorithms": req.algorithms,
            "operations": req.operations,
            "workers": req.workers
        }
        uploaded = upload_benchmark_task(job_id, task_payload)
        if not uploaded:
            raise HTTPException(status_code=500, detail="Failed to upload benchmark task to AWS S3.")
        
        batch_submit = submit_hpc_batch_job(
            job_name=job_id,
            algorithm=req.algorithms[0], # Primary algorithm
            operations=req.operations.get(req.algorithms[0], 1000),
            workers=req.workers
        )
        
        if not batch_submit.get("success"):
            raise HTTPException(status_code=500, detail=f"AWS Batch submission failed: {batch_submit.get('error')}")

        return {
            "job_id": job_id,
            "mode": "AWS Batch",
            "status": "SUBMITTED",
            "aws_batch_job_id": batch_submit.get("job_id")
        }
    else:
        # Local Multiprocessing Mode
        in_memory_jobs[job_id] = {"status": "STARTING", "progress": 0}
        
        # Execute benchmark synchronously for instant responsiveness or via background task
        try:
            results = run_full_benchmark_suite(req.algorithms, req.operations, req.workers)
            in_memory_jobs[job_id] = {
                "status": "COMPLETED",
                "mode": "Local Multiprocessing",
                "results": results
            }
            return {
                "job_id": job_id,
                "mode": "Local Multiprocessing",
                "status": "COMPLETED",
                "results": results
            }
        except Exception as e:
            logger.error(f"Benchmark execution error: {e}")
            raise HTTPException(status_code=500, detail=f"Local execution error: {str(e)}")

@app.get("/api/benchmark/status/{job_id}")
def check_job_status(job_id: str):
    # Check local jobs first
    if job_id in in_memory_jobs:
        return in_memory_jobs[job_id]
    
    # Check AWS S3/Batch if configured
    if config.is_aws_configured():
        s3_res = get_benchmark_result(job_id)
        if s3_res:
            return {"status": "COMPLETED", "mode": "AWS Batch", "results": s3_res}
        
        batch_stat = get_aws_batch_job_status(job_id)
        return {"status": batch_stat.get("status", "NOT_FOUND"), "mode": "AWS Batch", "details": batch_stat}
    
    raise HTTPException(status_code=404, detail=f"Job ID '{job_id}' not found.")
