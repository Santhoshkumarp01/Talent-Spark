from abc import ABC, abstractmethod
from typing import BinaryIO
import os
from google.cloud import storage as gcs
import cloudinary
import cloudinary.uploader
from ..config import get_settings

settings = get_settings()

class StorageService(ABC):
    """Abstract storage service interface"""
    
    @abstractmethod
    async def upload_video(self, video_content: bytes, filename: str) -> str:
        """Upload video and return URL"""
        pass
    
    @abstractmethod
    async def get_video_url(self, filename: str) -> str:
        """Get video URL"""
        pass

class FirebaseStorageService(StorageService):
    """Firebase Cloud Storage implementation"""
    
    def __init__(self):
        self.client = gcs.Client(project=settings.firebase_project_id)
        self.bucket_name = f"{settings.firebase_project_id}-videos"
        self.bucket = self.client.bucket(self.bucket_name)
    
    async def upload_video(self, video_content: bytes, filename: str) -> str:
        """Upload video to Firebase Storage"""
        try:
            blob = self.bucket.blob(filename)
            blob.upload_from_string(video_content, content_type='video/webm')
            
            # Make blob publicly readable
            blob.make_public()
            
            return blob.public_url
            
        except Exception as e:
            raise Exception(f"Firebase upload failed: {str(e)}")
    
    async def get_video_url(self, filename: str) -> str:
        """Get Firebase Storage URL"""
        blob = self.bucket.blob(filename)
        return blob.public_url

class CloudinaryStorageService(StorageService):
    """Cloudinary implementation"""
    
    def __init__(self):
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret
        )
    
    async def upload_video(self, video_content: bytes, filename: str) -> str:
        """Upload video to Cloudinary"""
        try:
            # Upload video
            response = cloudinary.uploader.upload(
                video_content,
                public_id=filename.replace('/', '_'),
                resource_type="video",
                folder="talent-spark"
            )
            
            return response['secure_url']
            
        except Exception as e:
            raise Exception(f"Cloudinary upload failed: {str(e)}")
    
    async def get_video_url(self, filename: str) -> str:
        """Get Cloudinary URL"""
        return cloudinary.CloudinaryVideo(filename.replace('/', '_')).build_url()

def get_storage_service() -> StorageService:
    """Factory function to get storage service"""
    if settings.storage_provider == "firebase":
        return FirebaseStorageService()
    elif settings.storage_provider == "cloudinary":
        return CloudinaryStorageService()
    else:
        raise ValueError(f"Unsupported storage provider: {settings.storage_provider}")
