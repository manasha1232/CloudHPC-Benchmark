import os
from dotenv import load_dotenv

# Load .env file if available
load_dotenv()

class Config:
    # AWS Config
    AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

    # AWS S3 Config
    AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME", "cloudhpc-benchmark-results")

    # AWS Batch Config
    AWS_BATCH_JOB_QUEUE = os.getenv("AWS_BATCH_JOB_QUEUE", "cloudhpc-job-queue")
    AWS_BATCH_JOB_DEFINITION = os.getenv("AWS_BATCH_JOB_DEFINITION", "cloudhpc-job-definition")

    # Mode Selector
    USE_AWS_BATCH = os.getenv("USE_AWS_BATCH", "false").lower() in ("true", "1", "yes")

    @classmethod
    def is_aws_configured(cls) -> bool:
        return bool(
            cls.AWS_ACCESS_KEY_ID
            and cls.AWS_SECRET_ACCESS_KEY
            and cls.AWS_REGION
        )

config = Config()
