from typing import Dict, Any
import json
import os

class ScoreCalculator:
    """Handles performance scoring and benchmark comparison"""
    
    def __init__(self):
        # Load benchmarks from JSON file
        self.benchmarks = self.load_benchmarks()
    
    def load_benchmarks(self) -> Dict:
        """Load benchmark data"""
        # Default benchmarks if file not found
        return {
            "squats": {
                "male": {
                    "13-15": {"excellent": 30, "good": 25, "average": 20, "below": 15},
                    "16-18": {"excellent": 35, "good": 30, "average": 25, "below": 20},
                    "19-25": {"excellent": 40, "good": 35, "average": 30, "below": 25},
                    "26-35": {"excellent": 35, "good": 30, "average": 25, "below": 20}
                },
                "female": {
                    "13-15": {"excellent": 25, "good": 20, "average": 16, "below": 12},
                    "16-18": {"excellent": 30, "good": 25, "average": 20, "below": 16},
                    "19-25": {"excellent": 35, "good": 30, "average": 25, "below": 20},
                    "26-35": {"excellent": 30, "good": 25, "average": 20, "below": 16}
                }
            }
        }
    
    def get_age_band(self, age: int) -> str:
        """Get age band from age"""
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
    
    def compare_performance(self, reps: int, profile_data: Dict) -> Dict[str, Any]:
        """Compare performance against benchmarks"""
        age_band = self.get_age_band(profile_data["age"])
        gender = profile_data["gender"]
        
        # Get benchmark thresholds
        benchmarks = self.benchmarks["squats"].get(gender, {}).get(age_band)
        
        if not benchmarks:
            return {
                "grade": "N/A",
                "percentile": 50,
                "category": "No benchmark available",
                "recommendation": "Keep practicing!"
            }
        
        # Determine grade and category
        if reps >= benchmarks["excellent"]:
            grade = "A+"
            percentile = 90 + min(10, (reps - benchmarks["excellent"]) // 2)
            category = "Excellent"
            recommendation = "Outstanding performance! You're in the top tier for your age group."
        elif reps >= benchmarks["good"]:
            grade = "B+"
            percentile = 70 + ((reps - benchmarks["good"]) / (benchmarks["excellent"] - benchmarks["good"])) * 20
            category = "Good"
            recommendation = "Great job! You're performing above average for your age group."
        elif reps >= benchmarks["average"]:
            grade = "B"
            percentile = 40 + ((reps - benchmarks["average"]) / (benchmarks["good"] - benchmarks["average"])) * 30
            category = "Average"
            recommendation = "Solid performance! With consistent training, you can reach the next level."
        elif reps >= benchmarks["below"]:
            grade = "C+"
            percentile = 20 + ((reps - benchmarks["below"]) / (benchmarks["average"] - benchmarks["below"])) * 20
            category = "Below Average"
            recommendation = "Keep working! Focus on proper form and gradual improvement."
        else:
            grade = "C"
            percentile = max(5, (reps / benchmarks["below"]) * 20)
            category = "Needs Improvement"
            recommendation = "Don't give up! Every rep counts towards building your strength."
        
        return {
            "grade": grade,
            "percentile": int(percentile),
            "category": category,
            "recommendation": recommendation
        }
    
    def calculate_composite_score(self, assessment_data: Dict) -> float:
        """Calculate composite score from multiple metrics"""
        # Weight different components
        weights = {
            "reps": 0.4,
            "form": 0.3,
            "consistency": 0.2,
            "depth": 0.1
        }
        
        # Normalize scores to 0-100 scale
        rep_score = min(100, (assessment_data["total_reps"] / 50) * 100)  # 50 reps = 100 points
        form_score = assessment_data["form_score"]
        consistency_score = assessment_data["consistency"]
        depth_score = assessment_data["average_depth"]
        
        composite = (
            rep_score * weights["reps"] +
            form_score * weights["form"] +
            consistency_score * weights["consistency"] +
            depth_score * weights["depth"]
        )
        
        return round(composite, 1)
