import hashlib
import json
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np

from ..models.schemas import IntegrityBundle, RiskLevel

class IntegrityVerifier:
    """Handles integrity verification of submissions"""
    
    def __init__(self):
        self.max_face_gap_seconds = 30
        self.min_face_confidence = 0.7
        self.max_timestamp_drift = 5000  # milliseconds
    
    async def verify_bundle(self, bundle: IntegrityBundle, video_content: bytes) -> Dict:
        """
        Perform comprehensive integrity verification
        """
        verification_result = {
            "content_hash_valid": await self.verify_content_hash(bundle, video_content),
            "timestamp_consistent": self.verify_timestamps(bundle),
            "face_continuity_valid": self.verify_face_continuity(bundle),
            "video_metrics_valid": await self.verify_video_metrics(bundle, video_content),
            "device_info_consistent": self.verify_device_info(bundle),
            "session_integrity_valid": self.verify_session_integrity(bundle)
        }
        
        return verification_result
    
    async def verify_content_hash(self, bundle: IntegrityBundle, video_content: bytes) -> bool:
        """Verify content hash matches video and assessment data"""
        try:
            # Reconstruct hash from current data
            combined_data = json.dumps({
                "videoSize": len(video_content),
                "assessmentData": bundle.assessment_data.dict(),
                "sessionId": bundle.session_id,
                "timestamp": bundle.device_info.timestamp
            }, sort_keys=True)
            
            calculated_hash = hashlib.sha256(combined_data.encode()).hexdigest()
            
            return calculated_hash == bundle.content_hash
            
        except Exception as e:
            print(f"Hash verification failed: {e}")
            return False
    
    def verify_timestamps(self, bundle: IntegrityBundle) -> bool:
        """Verify timestamp consistency"""
        try:
            device_timestamp = bundle.device_info.timestamp
            
            # Check face snapshot timestamps are reasonable
            for snapshot in bundle.face_snapshots:
                time_diff = abs(snapshot.timestamp - device_timestamp)
                if time_diff > self.max_timestamp_drift * 10:  # Allow more drift for snapshots
                    return False
            
            # Check assessment timestamps are in sequence
            timestamps = bundle.assessment_data.timestamps
            if len(timestamps) > 1:
                for i in range(1, len(timestamps)):
                    if timestamps[i] <= timestamps[i-1]:
                        return False
                        
            return True
            
        except Exception as e:
            print(f"Timestamp verification failed: {e}")
            return False
    
    def verify_face_continuity(self, bundle: IntegrityBundle) -> bool:
        """Verify face snapshots show continuity"""
        try:
            snapshots = bundle.face_snapshots
            
            if len(snapshots) < 2:
                return False
            
            # Check minimum confidence levels
            low_confidence_count = sum(1 for snap in snapshots if snap.confidence < self.min_face_confidence)
            if low_confidence_count > len(snapshots) * 0.3:  # Allow up to 30% low confidence
                return False
            
            # Check for large gaps in face detection
            sorted_snapshots = sorted(snapshots, key=lambda x: x.timestamp)
            for i in range(1, len(sorted_snapshots)):
                gap = (sorted_snapshots[i].timestamp - sorted_snapshots[i-1].timestamp) / 1000
                if gap > self.max_face_gap_seconds:
                    return False
                    
            return True
            
        except Exception as e:
            print(f"Face continuity verification failed: {e}")
            return False
    
    async def verify_video_metrics(self, bundle: IntegrityBundle, video_content: bytes) -> bool:
        """Verify video metrics match actual video"""
        try:
            # Save video temporarily for analysis
            temp_path = f"/tmp/verify_{bundle.session_id}.webm"
            with open(temp_path, 'wb') as f:
                f.write(video_content)
            
            # Analyze with OpenCV
            cap = cv2.VideoCapture(temp_path)
            
            if not cap.isOpened():
                return False
            
            # Get actual metrics
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            actual_duration = frame_count / fps if fps > 0 else 0
            actual_resolution = f"{width}x{height}"
            
            cap.release()
            
            # Compare with bundle metrics
            metrics = bundle.video_metrics
            duration_diff = abs(actual_duration - metrics.duration)
            
            return (
                duration_diff < 2 and  # Allow 2 second difference
                actual_resolution == metrics.resolution and
                len(video_content) == metrics.file_size
            )
            
        except Exception as e:
            print(f"Video metrics verification failed: {e}")
            return False
    
    def verify_device_info(self, bundle: IntegrityBundle) -> bool:
        """Verify device info is consistent and realistic"""
        try:
            device_info = bundle.device_info
            
            # Basic validation
            if not device_info.user_agent or not device_info.platform:
                return False
            
            # Check timestamp is recent (within last hour)
            current_time = datetime.now().timestamp() * 1000
            time_diff = abs(current_time - device_info.timestamp)
            
            if time_diff > 3600000:  # 1 hour in milliseconds
                return False
                
            return True
            
        except Exception as e:
            print(f"Device info verification failed: {e}")
            return False
    
    def verify_session_integrity(self, bundle: IntegrityBundle) -> bool:
        """Verify overall session makes sense"""
        try:
            # Check session ID format
            if not bundle.session_id.startswith('ts_'):
                return False
            
            # Check assessment data is reasonable
            assessment = bundle.assessment_data
            if assessment.total_reps < 0 or assessment.total_reps > 200:
                return False
                
            if assessment.average_depth < 0 or assessment.average_depth > 100:
                return False
                
            if assessment.form_score < 0 or assessment.form_score > 100:
                return False
                
            return True
            
        except Exception as e:
            print(f"Session integrity verification failed: {e}")
            return False
    
    def calculate_risk_score(self, verification_result: Dict, bundle: IntegrityBundle) -> Tuple[RiskLevel, List[str]]:
        """Calculate overall risk score and flags"""
        flags = []
        risk_points = 0
        
        # Check each verification result
        if not verification_result["content_hash_valid"]:
            flags.append("Content hash mismatch")
            risk_points += 3
            
        if not verification_result["timestamp_consistent"]:
            flags.append("Timestamp inconsistencies")
            risk_points += 2
            
        if not verification_result["face_continuity_valid"]:
            flags.append("Face continuity issues")
            risk_points += 2
            
        if not verification_result["video_metrics_valid"]:
            flags.append("Video metrics mismatch")
            risk_points += 2
            
        if not verification_result["device_info_consistent"]:
            flags.append("Device info suspicious")
            risk_points += 1
            
        if not verification_result["session_integrity_valid"]:
            flags.append("Session data invalid")
            risk_points += 3
        
        # Additional behavioral flags
        assessment = bundle.assessment_data
        
        # Suspiciously perfect performance
        if assessment.form_score > 98 and assessment.consistency > 98:
            flags.append("Unrealistically perfect form")
            risk_points += 1
        
        # Too fast rep time
        if assessment.average_rep_time < 1000:  # Less than 1 second per rep
            flags.append("Unusually fast rep time")
            risk_points += 1
        
        # Determine risk level
        if risk_points >= 5:
            risk_level = RiskLevel.RED
        elif risk_points >= 2:
            risk_level = RiskLevel.YELLOW
        else:
            risk_level = RiskLevel.GREEN
            
        return risk_level, flags
