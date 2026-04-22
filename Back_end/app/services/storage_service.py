import logging
from datetime import timedelta
from typing import Optional
from botocore.exceptions import ClientError
import boto3
from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name='us-east-1',  # MinIO ignores region but Boto3 requires it
        )

    def get_presigned_url(
        self, bucket: str, key: str, expiration: int = 3600, method: str = 'get_object'
    ) -> Optional[str]:
        """
        Generate a presigned URL for a MinIO object.
        method: 'get_object' for download, 'put_object' for upload.
        """
        try:
            url = self.s3_client.generate_presigned_url(
                ClientMethod=method,
                Params={'Bucket': bucket, 'Key': key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return None

    def upload_file(self, file_data, bucket: str, key: str, content_type: str = "application/octet-stream"):
        """
        Upload a file directly from the backend.
        Used for generated documents and logs.
        """
        try:
            self.s3_client.put_object(
                Bucket=bucket,
                Key=key,
                Body=file_data,
                ContentType=content_type
            )
            return True
        except ClientError as e:
            logger.error(f"Error uploading to MinIO: {e}")
            return False

    async def ensure_buckets_exist(self):
        """
        Utility to create required buckets on startup.
        """
        buckets = [
            settings.MINIO_BUCKET_DOCUMENTS,
            settings.MINIO_BUCKET_TEMPLATES,
            settings.MINIO_BUCKET_LOGS
        ]
        for bucket in buckets:
            try:
                self.s3_client.head_bucket(Bucket=bucket)
            except ClientError:
                self.s3_client.create_bucket(Bucket=bucket)
                logger.info(f"Created bucket: {bucket}")

storage_service = StorageService()
