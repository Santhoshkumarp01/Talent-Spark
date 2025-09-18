from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime

from ..models.schemas import (
    ReviewDecision, SubmissionStatus, LeaderboardEntry, 
    BenchmarkResult, Gender
)
from ..services.scoring import ScoreCalculator
from ..services.db import get_firestore_client

router = APIRouter()

@router.post("/submissions/{submission_id}/decision")
async def make_decision(submission_id: str, decision: ReviewDecision):
    """
    Admin decision on submission (approve/reject)
    """
    try:
        db = get_firestore_client()
        
        # Get submission
        doc = db.collection("submissions").document(submission_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Submission not found")
            
        submission_data = doc.to_dict()
        
        # Update submission status
        update_data = {
            "status": decision.decision.value,
            "reviewed_at": datetime.now(),
            "reviewer_notes": decision.notes
        }
        
        db.collection("submissions").document(submission_id).update(update_data)
        
        # If approved, add to leaderboard
        if decision.decision == SubmissionStatus.APPROVED:
            await add_to_leaderboard(submission_data, db)
            
        return {
            "success": True,
            "submission_id": submission_id,
            "decision": decision.decision.value,
            "message": "Decision recorded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decision failed: {str(e)}")

async def add_to_leaderboard(submission_data: dict, db):
    """
    Add approved submission to leaderboard
    """
    profile = submission_data["profile_data"]
    assessment = submission_data["assessment_data"]
    
    # Determine age band
    age_band = get_age_band(profile["age"])
    
    # Create leaderboard entry
    leaderboard_entry = {
        "user_id": f"user_{submission_data['id'][-8:]}",  # Anonymized
        "age_band": age_band,
        "gender": profile["gender"],
        "total_reps": assessment["total_reps"],
        "form_score": assessment["form_score"],
        "submission_date": submission_data["created_at"],
        "submission_id": submission_data["id"]
    }
    
    # Add to appropriate leaderboard collection
    collection_name = f"leaderboard_{age_band}_{profile['gender']}"
    db.collection(collection_name).add(leaderboard_entry)

def get_age_band(age: int) -> str:
    """Calculate age band from age"""
    if age <= 15:
        return "13-15"
    elif age <= 18:
        return "16-18"  
    elif age <= 25:
        return "19-25"
    elif age <= 35:
        return "26-35"
    else:
        return "36+"

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    age_band: Optional[str] = None,
    gender: Optional[Gender] = None,
    limit: int = 100
):
    """
    Get leaderboard entries with optional filters
    """
    try:
        db = get_firestore_client()
        
        # If specific filters, query that collection
        if age_band and gender:
            collection_name = f"leaderboard_{age_band}_{gender.value}"
            query = db.collection(collection_name)
        else:
            # Query all leaderboard collections and merge
            query = db.collection_group("leaderboard")
            if age_band:
                query = query.where("age_band", "==", age_band)
            if gender:
                query = query.where("gender", "==", gender.value)
                
        # Order by reps descending, then form score descending
        docs = query.order_by("total_reps", direction="DESCENDING")\
                   .order_by("form_score", direction="DESCENDING")\
                   .limit(limit).stream()
        
        entries = []
        rank = 1
        
        for doc in docs:
            data = doc.to_dict()
            entry = LeaderboardEntry(
                rank=rank,
                user_id=data["user_id"],
                age_band=data["age_band"],
                gender=Gender(data["gender"]),
                total_reps=data["total_reps"],
                form_score=data["form_score"],
                submission_date=data["submission_date"]
            )
            entries.append(entry)
            rank += 1
            
        return entries
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Leaderboard fetch failed: {str(e)}")

@router.get("/benchmark/{age}/{gender}/{reps}", response_model=BenchmarkResult)
async def get_benchmark_result(age: int, gender: Gender, reps: int):
    """
    Get benchmark comparison for given performance
    """
    try:
        calculator = ScoreCalculator()
        
        profile_data = {
            "age": age,
            "gender": gender.value,
            "height": 170,  # Default for benchmark calculation
            "weight": 65    # Default for benchmark calculation
        }
        
        result = calculator.compare_performance(reps, profile_data)
        
        return BenchmarkResult(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark calculation failed: {str(e)}")

@router.get("/admin/stats")
async def get_admin_stats():
    """
    Get admin dashboard statistics
    """
    try:
        db = get_firestore_client()
        
        # Get counts by status
        submissions_ref = db.collection("submissions")
        
        pending_count = len(list(submissions_ref.where("status", "==", "pending").stream()))
        approved_count = len(list(submissions_ref.where("status", "==", "approved").stream()))
        rejected_count = len(list(submissions_ref.where("status", "==", "rejected").stream()))
        flagged_count = len(list(submissions_ref.where("risk_score", "==", "red").stream()))
        
        total_count = pending_count + approved_count + rejected_count
        
        return {
            "pending_reviews": pending_count,
            "approved_today": approved_count,  # Could be refined to today only
            "flagged_submissions": flagged_count,
            "total_assessments": total_count,
            "approval_rate": round((approved_count / total_count * 100), 1) if total_count > 0 else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stats fetch failed: {str(e)}")
