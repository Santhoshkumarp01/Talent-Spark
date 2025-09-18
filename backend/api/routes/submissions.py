from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import asyncio
from datetime import datetime

from ..models.schemas import (
    SubmissionCreate, SubmissionResponse, SubmissionDetail,
    IntegrityBundle, SubmissionStatus, RiskLevel
)
from ..services.verify import IntegrityVerifier
from ..services.scoring import ScoreCalculator
from ..services.storage import get_storage_service
from ..services.db import get_firestore_client

router = APIRouter()

@router.post("/submissions", response_model=SubmissionResponse)
async def create_submission(
    video: UploadFile = File(...),
    integrity_bundle: str = Form(...)
):
    """
    Create new assessment submission with video and integrity data
    """
    try:
        # Parse integrity bundle
        bundle_data = json.loads(integrity_bundle)
        bundle = IntegrityBundle(**bundle_data)
        
        # Verify video file
        if video.content_type not in ["video/webm", "video/mp4"]:
            raise HTTPException(status_code=400, detail="Invalid video format")
        
        if video.size > 100 * 1024 * 1024:  # 100MB limit
            raise HTTPException(status_code=400, detail="Video file too large")
        
        # Initialize services
        verifier = IntegrityVerifier()
        storage = get_storage_service()
        db = get_firestore_client()
        
        # Generate submission ID
        submission_id = f"sub_{int(datetime.now().timestamp())}_{bundle.session_id[-6:]}"
        
        # Perform integrity verification
        video_content = await video.read()
        verification_result = await verifier.verify_bundle(bundle, video_content)
        
        # Upload video to storage
        video_filename = f"submissions/{submission_id}/video.webm"
        video_url = await storage.upload_video(video_content, video_filename)
        
        # Calculate risk score
        risk_score, risk_flags = verifier.calculate_risk_score(
            verification_result, bundle
        )
        
        # Store in database
        submission_doc = {
            "id": submission_id,
            "profile_data": bundle.profile_data.dict(),
            "assessment_data": bundle.assessment_data.dict(),
            "video_url": video_url,
            "risk_score": risk_score.value,
            "risk_flags": risk_flags,
            "status": SubmissionStatus.PENDING.value,
            "created_at": datetime.now(),
            "integrity_bundle": bundle.dict(),
            "verification_result": verification_result
        }
        
        db.collection("submissions").document(submission_id).set(submission_doc)
        
        return SubmissionResponse(
            success=True,
            submission_id=submission_id,
            message="Submission created successfully",
            upload_url=video_url
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid integrity bundle format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission failed: {str(e)}")

@router.get("/submissions", response_model=List[SubmissionDetail])
async def list_submissions(
    status: Optional[SubmissionStatus] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    Get list of submissions for admin review
    """
    try:
        db = get_firestore_client()
        
        query = db.collection("submissions").order_by("created_at", direction="DESCENDING")
        
        if status:
            query = query.where("status", "==", status.value)
            
        docs = query.limit(limit).offset(offset).stream()
        
        submissions = []
        for doc in docs:
            data = doc.to_dict()
            submission = SubmissionDetail(
                id=data["id"],
                profile_data=data["profile_data"],
                assessment_data=data["assessment_data"],
                video_url=data["video_url"],
                risk_score=RiskLevel(data["risk_score"]),
                risk_flags=data["risk_flags"],
                status=SubmissionStatus(data["status"]),
                created_at=data["created_at"],
                reviewed_at=data.get("reviewed_at"),
                reviewer_notes=data.get("reviewer_notes")
            )
            submissions.append(submission)
            
        return submissions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch submissions: {str(e)}")

@router.get("/submissions/{submission_id}", response_model=SubmissionDetail)
async def get_submission(submission_id: str):
    """
    Get detailed submission info for admin review
    """
    try:
        db = get_firestore_client()
        
        doc = db.collection("submissions").document(submission_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        data = doc.to_dict()
        
        return SubmissionDetail(
            id=data["id"],
            profile_data=data["profile_data"],
            assessment_data=data["assessment_data"],
            video_url=data["video_url"],
            risk_score=RiskLevel(data["risk_score"]),
            risk_flags=data["risk_flags"],
            status=SubmissionStatus(data["status"]),
            created_at=data["created_at"],
            reviewed_at=data.get("reviewed_at"),
            reviewer_notes=data.get("reviewer_notes")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch submission: {str(e)}")

@router.get("/submissions/{submission_id}/status")
async def get_submission_status(submission_id: str):
    """
    Get submission status for frontend polling
    """
    try:
        db = get_firestore_client()
        
        doc = db.collection("submissions").document(submission_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        data = doc.to_dict()
        
        return {
            "submission_id": submission_id,
            "status": data["status"],
            "created_at": data["created_at"].isoformat(),
            "reviewed_at": data.get("reviewed_at").isoformat() if data.get("reviewed_at") else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status check failed: {str(e)}")
