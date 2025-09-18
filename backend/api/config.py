from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # Environment
    environment: str = "development"
    debug: bool = True
    
    # Database
    firebase_project_id: str = "talent-spark-dev"
    firebase_credentials_path: str = ""
    
    # Storage
    storage_provider: str = "firebase"  # firebase, cloudinary, s3
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    
    # Security
    secret_key: str = "talent-spark-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Upload limits
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    allowed_video_types: list = ["video/webm", "video/mp4"]
    
    # Admin settings
    admin_emails: list = ["admin@talentspark.com"]
    auto_approve_threshold: float = 0.95
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
