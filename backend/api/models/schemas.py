from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"

class SubmissionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"

class RiskLevel(str, Enum):
    GREEN = "green"
    YELLOW = "yellow" 
    RED = "red"

class ProfileData(BaseModel):
    age: int = Field(..., ge=10, le=100)
    gender: Gender
    height: int = Field(..., ge=100, le=250)  # cm
    weight: int = Field(..., ge=30, le=200)   # kg

class DeviceInfo(BaseModel):
    user_agent: str
    platform: str
    timestamp: int
    timezone: str
    screen_resolution: str

class FaceSnapshot(BaseModel):
    timestamp: int
    image_data: str  # base64
    confidence: float = Field(..., ge=0.0, le=1.0)

class VideoMetrics(BaseModel):
    duration: int  # seconds
    fps: int
    resolution: str
    file_size: int

class AssessmentData(BaseModel):
    total_reps: int = Field(..., ge=0)
    average_depth: float = Field(..., ge=0.0, le=100.0)
    form_score: float = Field(..., ge=0.0, le=100.0)
    average_rep_time: int  # milliseconds
    consistency: float = Field(..., ge=0.0, le=100.0)
    timestamps: List[int]

class IntegrityBundle(BaseModel):
    session_id: str
    profile_data: ProfileData
    device_info: DeviceInfo
    face_snapshots: List[FaceSnapshot]
    video_metrics: VideoMetrics
    assessment_data: AssessmentData
    content_hash: str
    version: str

class SubmissionCreate(BaseModel):
    integrity_bundle: IntegrityBundle

class SubmissionResponse(BaseModel):
    success: bool
    submission_id: str
    message: str
    upload_url: Optional[str] = None

class SubmissionDetail(BaseModel):
    id: str
    profile_data: ProfileData
    assessment_data: AssessmentData
    video_url: str
    risk_score: RiskLevel
    risk_flags: List[str]
    status: SubmissionStatus
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

class ReviewDecision(BaseModel):
    decision: SubmissionStatus
    notes: Optional[str] = None
    
    @validator('decision')
    def validate_decision(cls, v):
        if v not in [SubmissionStatus.APPROVED, SubmissionStatus.REJECTED]:
            raise ValueError('Decision must be approved or rejected')
        return v

class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    age_band: str
    gender: Gender
    total_reps: int
    form_score: float
    submission_date: datetime
    
class BenchmarkResult(BaseModel):
    grade: str
    percentile: int
    category: str
    recommendation: str
