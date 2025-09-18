import React, { useState, useEffect } from 'react'
import { GameManager } from '../components/gamification/GameManager'

interface ReviewProps {
  onNext: () => void
  onBack: () => void
  analysisResults: any
  profileData: any
  selectedWorkout: 'squats' | 'pushups'
}

const Review: React.FC<ReviewProps> = ({ 
  onNext, onBack, analysisResults, profileData, selectedWorkout 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>('')
  const [newBadges, setNewBadges] = useState<any[]>([])
  const [pointsEarned, setPointsEarned] = useState(0)

  // Use REAL analysis results (not fake data)
  const {
    totalReps = 0,
    formScore = 0,
    averageDepth = 0,
    duration = 0,
    faceVerification = { confidence: 0, detected: false },
    posesDetected = 0,
    totalFrames = 0
  } = analysisResults || {}

  // Calculate real grade based on actual results
  const calculateGrade = (reps: number, form: number, faceMatch: number): string => {
    if (faceMatch < 70) return 'F' // Failed face verification
    if (form >= 90 && reps >= 20) return 'A+'
    if (form >= 85 && reps >= 15) return 'A'
    if (form >= 75 && reps >= 10) return 'B+'
    if (form >= 65 && reps >= 8) return 'B'
    if (form >= 55 && reps >= 5) return 'C+'
    if (form >= 45 && reps >= 3) return 'C'
    return 'D'
  }

  const grade = calculateGrade(totalReps, formScore, faceVerification.confidence)
  const faceVerificationPassed = faceVerification.confidence >= 70

  // Gamification Effect
  useEffect(() => {
    if (analysisResults && profileData) {
      // Get user's assessment history
      const userAssessments = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('assessment_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key)!)
            if (data.profileData.name === profileData.name) {
              userAssessments.push(data)
            }
          } catch (error) {
            continue
          }
        }
      }
      
      // Check for new badges
      const assessmentData = { grade, analysisResults, selectedWorkout }
      const badges = GameManager.checkBadgeUnlocks(assessmentData, userAssessments)
      setNewBadges(badges)
      
      // Calculate points earned
      const basePoints = GameManager.calculateOverallScore(grade, totalReps, formScore)
      const badgePoints = badges.reduce((total, badge) => total + badge.points, 0)
      setPointsEarned(basePoints + badgePoints)
    }
  }, [analysisResults, profileData, grade, totalReps, formScore])

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A+': return '#00ff41'
      case 'A': return '#00d2ff'
      case 'B+': return '#feca57'
      case 'B': return '#ff9ff3'
      case 'C+': return '#ff6b6b'
      case 'C': return '#ff9f43'
      default: return '#ff4757'
    }
  }

  const getPerformanceMessage = (grade: string): string => {
    switch (grade) {
      case 'A+': return 'Outstanding Performance!'
      case 'A': return 'Excellent Work!'
      case 'B+': return 'Great Performance!'
      case 'B': return 'Good Effort!'
      case 'C+': return 'Decent Performance'
      case 'C': return 'Room for Improvement'
      case 'F': return 'Face Verification Failed'
      default: return 'Keep Practicing!'
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Generate unique submission ID
    const submissionId = `TS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Prepare submission data
    const submissionData = {
      id: submissionId,
      timestamp: Date.now(),
      profileData,
      selectedWorkout,
      analysisResults,
      grade,
      faceVerificationPassed,
      submittedAt: new Date().toISOString(),
      status: faceVerificationPassed ? 'verified' : 'pending_review',
      
      // NEW: Add gamification data
      badgesEarned: newBadges,
      pointsEarned: pointsEarned,
      overallScore: GameManager.calculateOverallScore(grade, totalReps, formScore, newBadges)
    }
    
    try {
      // Store in localStorage (acts as local database)
      localStorage.setItem(`assessment_${submissionId}`, JSON.stringify(submissionData))
      
      // Simulate network submission delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Assessment submitted successfully:', submissionData)
      
      // Mark as submitted
      setSubmissionId(submissionId)
      setSubmitted(true)
      
    } catch (error) {
      console.error('Submission failed:', error)
      alert('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinue = () => {
    onNext() // Go to Sync screen which shows success
  }

  // If submitted, show success state
  if (submitted) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00ff41 0%, #00d2ff 100%)',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '3rem',
          textAlign: 'center',
          maxWidth: '600px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>
            Assessment Submitted!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
            Your fitness assessment has been successfully submitted for review.
          </p>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>
              <strong>Submission ID:</strong> {submissionId}
            </div>
            <div style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>
              <strong>Status:</strong> {faceVerificationPassed ? '✅ Verified' : '⏳ Pending Review'}
            </div>
            <div style={{ color: 'white', fontSize: '1rem', marginBottom: '1rem' }}>
              <strong>Grade:</strong> <span style={{ color: getGradeColor(grade) }}>{grade}</span>
            </div>
            <div style={{ color: 'white', fontSize: '1rem' }}>
              <strong>Points Earned:</strong> <span style={{ color: '#feca57' }}>+{pointsEarned}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={handleContinue}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#00d2ff',
                border: 'none',
                padding: '1.2rem 2rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '3rem'
      }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            padding: '0.8rem 1.2rem',
            borderRadius: '15px',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <span>←</span> Back
        </button>
        
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 20px rgba(255,255,255,0.5)'
        }}>
          📊 Assessment Results
        </h1>
        
        <div style={{ width: '100px' }} />
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Face Verification Alert */}
        {!faceVerificationPassed && (
          <div style={{
            background: 'rgba(255,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255,0,0,0.5)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Face Verification Failed
            </h3>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              Confidence: {faceVerification.confidence}% (Required: 70%+)
              <br/>This assessment will require manual review for official verification.
            </p>
          </div>
        )}

        {/* Grade Card */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '3rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: getGradeColor(grade),
            marginBottom: '1rem',
            textShadow: `0 0 30px ${getGradeColor(grade)}50`
          }}>
            {grade}
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            {getPerformanceMessage(grade)}
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            {selectedWorkout.charAt(0).toUpperCase() + selectedWorkout.slice(1)} Assessment for {profileData.name}
          </p>
        </div>

        {/* Badge Unlock Animation - NEW GAMIFICATION FEATURE */}
        {newBadges.length > 0 && (
          <div style={{
            background: 'rgba(0,255,65,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '30px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '2px solid rgba(0,255,65,0.3)',
            textAlign: 'center',
            animation: 'bounce 1s infinite'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: '#00ff41', fontSize: '1.8rem', marginBottom: '1rem' }}>
              New Achievement{newBadges.length > 1 ? 's' : ''} Unlocked!
            </h2>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}>
              {newBadges.map(badge => (
                <div
                  key={badge.id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '15px',
                    padding: '1rem',
                    minWidth: '150px',
                    animation: 'glow 2s ease-in-out infinite alternate'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                    {badge.name}
                  </div>
                  <div style={{ color: '#00ff41', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    +{badge.points} bonus points!
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
              Total bonus: <span style={{ color: '#00ff41', fontWeight: 'bold' }}>
                +{newBadges.reduce((total, badge) => total + badge.points, 0)} points
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { 
              label: 'Total Reps', 
              value: totalReps, 
              icon: '🔢',
              color: '#00d2ff',
              suffix: ''
            },
            { 
              label: 'Form Score', 
              value: formScore, 
              icon: '✨',
              color: '#00ff41',
              suffix: '%'
            },
            { 
              label: 'Avg Depth', 
              value: averageDepth, 
              icon: '📏',
              color: '#feca57',
              suffix: '%'
            },
            { 
              label: 'Points Earned', 
              value: pointsEarned.toLocaleString(), 
              icon: '💎',
              color: '#ff6b6b',
              suffix: ' pts'
            }
          ].map((stat, index) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                border: `2px solid ${stat.color}30`,
                boxShadow: `0 10px 30px ${stat.color}20`
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '0.5rem',
                textShadow: `0 0 20px ${stat.color}50`
              }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{
                fontSize: '1rem',
                color: 'rgba(255,255,255,0.8)',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analysis */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '25px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            💡 Detailed Analysis
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              <span>Poses Detected:</span>
              <span style={{ fontWeight: 'bold' }}>
                {posesDetected}/{totalFrames} frames ({Math.round(posesDetected/totalFrames*100)}%)
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              <span>Face Verification:</span>
              <span style={{ 
                fontWeight: 'bold',
                color: faceVerificationPassed ? '#00ff41' : '#ff6b6b'
              }}>
                {faceVerification.confidence}% {faceVerificationPassed ? '✅' : '❌'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              <span>Exercise Type:</span>
              <span style={{ fontWeight: 'bold' }}>
                {selectedWorkout.charAt(0).toUpperCase() + selectedWorkout.slice(1)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              <span>Assessment Status:</span>
              <span style={{ 
                fontWeight: 'bold',
                color: faceVerificationPassed ? '#00ff41' : '#feca57'
              }}>
                {faceVerificationPassed ? 'Auto-Verified' : 'Manual Review Required'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: 'white',
              fontSize: '1rem'
            }}>
              <span>Duration:</span>
              <span style={{ fontWeight: 'bold' }}>
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '25px',
          padding: '2rem',
          marginBottom: '3rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            🎯 Performance Insights
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {formScore >= 80 && (
              <div style={{ color: '#00ff41', fontSize: '1rem' }}>
                ✅ Excellent form consistency - keep it up!
              </div>
            )}
            {totalReps >= 15 && (
              <div style={{ color: '#00ff41', fontSize: '1rem' }}>
                ✅ Great endurance and rep count!
              </div>
            )}
            {averageDepth >= 80 && (
              <div style={{ color: '#00ff41', fontSize: '1rem' }}>
                ✅ Perfect depth control throughout exercise!
              </div>
            )}
            
            {formScore < 70 && (
              <div style={{ color: '#feca57', fontSize: '1rem' }}>
                ⚡ Focus on maintaining proper form throughout the movement
              </div>
            )}
            {totalReps < 10 && (
              <div style={{ color: '#feca57', fontSize: '1rem' }}>
                ⚡ Try to increase repetitions for better endurance scoring
              </div>
            )}
            {averageDepth < 70 && (
              <div style={{ color: '#feca57', fontSize: '1rem' }}>
                ⚡ Work on achieving greater depth in your {selectedWorkout}
              </div>
            )}

            {newBadges.length > 0 && (
              <div style={{ color: '#00ff41', fontSize: '1rem' }}>
                🎉 You unlocked {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}! Check the leaderboard to see your ranking!
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: 'none',
              padding: '1.2rem 2rem',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🔄 Record Again
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              background: faceVerificationPassed 
                ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
                : 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
              color: 'white',
              border: 'none',
              padding: '1.2rem 2.5rem',
              borderRadius: '25px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 20px 40px rgba(0,210,255,0.4)',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Submitting...
              </span>
            ) : (
              faceVerificationPassed 
                ? '📤 Submit for Official Verification'
                : '⚠️ Submit for Manual Review'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes glow {
          from { box-shadow: 0 0 20px rgba(0,255,65,0.5); }
          to { box-shadow: 0 0 30px rgba(0,255,65,0.8); }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Review
