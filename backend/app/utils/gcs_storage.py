from google.cloud import storage
import logging
import os
from typing import Optional, BinaryIO
from datetime import datetime, timedelta, timezone

from app.core.config import settings

logger = logging.getLogger("app.utils.gcs_storage")

class GcsStorageService:
    """Service for interacting with Google Cloud Storage (GCS) or local folder fallback"""
    
    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.storage_client: Optional[storage.Client] = None
        self.is_mock = not self.bucket_name or "your-gcs-bucket" in self.bucket_name.lower()
        self.local_dir = "./local_storage"
        
    async def connect(self):
        """Initialize the GCS storage client or mock local storage"""
        if self.is_mock:
            logger.info("Initializing Local File-based GCS Storage Mock...")
            os.makedirs(self.local_dir, exist_ok=True)
            return

        try:
            # Assumes GCP ADC credentials (e.g. keyfile, env, or service account metadata) are resolved
            self.storage_client = storage.Client()
            logger.info("Connected to Google Cloud Storage (GCS)")
            await self._ensure_bucket_exists()
        except Exception as e:
            logger.error(f"Failed to connect to GCS: {str(e)}")
            raise
    
    async def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if it doesn't"""
        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            if not bucket.exists():
                self.storage_client.create_bucket(self.bucket_name)
                logger.info(f"Created GCS bucket: {self.bucket_name}")
            else:
                logger.debug(f"GCS Bucket already exists: {self.bucket_name}")
        except Exception as e:
            logger.error(f"Error ensuring GCS bucket exists: {str(e)}")
            raise
        
    async def upload_file(
        self,
        file_content: bytes,
        blob_name: str,
        content_type: Optional[str] = None
    ) -> str:
        """Upload a file to GCS or local mock storage"""
        if self.is_mock:
            local_path = os.path.join(self.local_dir, blob_name)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, "wb") as f:
                f.write(file_content)
            logger.info(f"Successfully uploaded file mock locally to: {blob_name}")
            return f"http://localhost:{settings.API_SERVER_PORT}/local_storage/{blob_name}"

        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(blob_name)
            blob.upload_from_string(file_content, content_type=content_type)
            logger.info(f"Successfully uploaded file to GCS: {blob_name}")
            return blob.public_url
        except Exception as e:
            logger.error(f"Error uploading GCS file {blob_name}: {str(e)}")
            raise
    
    async def download_file(self, blob_name: str) -> bytes:
        """Download a file from GCS or local mock storage"""
        if self.is_mock:
            local_path = os.path.join(self.local_dir, blob_name)
            if not os.path.exists(local_path):
                raise FileNotFoundError(f"Local mock GCS blob {blob_name} not found")
            with open(local_path, "rb") as f:
                return f.read()

        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(blob_name)
            file_content = blob.download_as_bytes()
            logger.info(f"Successfully downloaded file from GCS: {blob_name}")
            return file_content
        except Exception as e:
            logger.error(f"Error downloading GCS file {blob_name}: {str(e)}")
            raise
    
    async def delete_file(self, blob_name: str) -> bool:
        """Delete a file from GCS or local mock storage"""
        if self.is_mock:
            local_path = os.path.join(self.local_dir, blob_name)
            if os.path.exists(local_path):
                os.remove(local_path)
                logger.info(f"Successfully deleted mock file: {blob_name}")
                return True
            return False

        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(blob_name)
            blob.delete()
            logger.info(f"Successfully deleted GCS blob: {blob_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting GCS file {blob_name}: {str(e)}")
            raise
    
    async def delete_files_by_prefix(self, prefix: str) -> int:
        """Delete all GCS blobs matching a given prefix"""
        if self.is_mock:
            deleted_count = 0
            for root, dirs, files in os.walk(self.local_dir):
                for f in files:
                    rel_path = os.path.relpath(os.path.join(root, f), self.local_dir).replace("\\", "/")
                    if rel_path.startswith(prefix):
                        os.remove(os.path.join(root, f))
                        deleted_count += 1
            logger.info(f"Deleted {deleted_count} local files with prefix: {prefix}")
            return deleted_count

        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blobs = bucket.list_blobs(prefix=prefix)
            deleted_count = 0
            for blob in blobs:
                blob.delete()
                deleted_count += 1
            logger.info(f"Deleted {deleted_count} GCS blobs with prefix: {prefix}")
            return deleted_count
        except Exception as e:
            logger.error(f"Error deleting GCS files with prefix {prefix}: {str(e)}")
            raise
    
    def generate_download_url(
        self,
        blob_name: str,
        expiry_hours: int = 1
    ) -> str:
        """Generate download URL"""
        if self.is_mock:
            return f"http://localhost:{settings.API_SERVER_PORT}/local_storage/{blob_name}"

        try:
            bucket = self.storage_client.bucket(self.bucket_name)
            blob = bucket.blob(blob_name)
            return blob.public_url
        except Exception as e:
            logger.error(f"Error generating download URL for GCS {blob_name}: {str(e)}")
            raise
    
    async def close(self):
        """No-op for storage Client connection closing"""
        pass

# Global GCS service instance
_gcs_storage_service: Optional[GcsStorageService] = None

async def get_gcs_storage_service() -> GcsStorageService:
    """Get or create GcsStorageService singleton"""
    global _gcs_storage_service
    if _gcs_storage_service is None:
        _gcs_storage_service = GcsStorageService()
        await _gcs_storage_service.connect()
    return _gcs_storage_service

async def close_gcs_storage_service():
    """Close the GcsStorageService connection"""
    global _gcs_storage_service
    if _gcs_storage_service:
        await _gcs_storage_service.close()
        _gcs_storage_service = None

