import React, { useState, useEffect } from 'react'
import { GameManager } from '../../components/gamification/GameManager'

interface DashboardProps {
  onBack: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [assessments, setAssessments] = useState<any[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [gamificationStats, setGamificationStats] = useState({
    totalUsers: 0,
    totalBadges: 0,
    topPerformer: '',
    averageGrade: 'B'
  })

  useEffect(() => {
    loadAssessments()
    loadLeaderboardData()
  }, [])

  const loadAssessments = () => {
    const allAssessments: any[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('assessment_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!)
          allAssessments.push({ id: key, ...data })
        } catch (error) {
          console.error('Error parsing assessment:', error)
        }
      }
    }
    
    allAssessments.sort((a, b) => b.timestamp - a.timestamp)
    setAssessments(allAssessments)
  }

  const loadLeaderboardData = () => {
    const leaderboard = GameManager.getLeaderboard()
    setLeaderboardData(leaderboard.slice(0, 10)) // Top 10 for admin view
    
    // Calculate gamification stats
    const totalBadges = leaderboard.reduce((sum, user) => sum + user.badges.length, 0)
    const grades = leaderboard.map(user => user.grade)
    const gradeValues = { 'A+': 4.3, 'A': 4.0, 'B+': 3.3, 'B': 3.0, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0 }
    const avgGradeValue = grades.reduce((sum, grade) => sum + (gradeValues[grade] || 0), 0) / grades.length
    const avgGrade = Object.keys(gradeValues).find(key => Math.abs(gradeValues[key] - avgGradeValue) < 0.2) || 'B'
    
    setGamificationStats({
      totalUsers: leaderboard.length,
      totalBadges,
      topPerformer: leaderboard[0]?.name || 'No data',
      averageGrade: avgGrade
    })
  }

  const getGradeColor = (grade: string): string => {
    const colors = {
      'A+': '#00ff41', 'A': '#00d2ff', 'B+': '#feca57',
      'B': '#ff9ff3', 'C+': '#ff6b6b', 'C': '#ff9f43', 'D': '#95a5a6', 'F': '#ff4757'
    }
    return colors[grade] || '#95a5a6'
  }

  const deleteAssessment = (assessmentId: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      localStorage.removeItem(assessmentId)
      loadAssessments()
      loadLeaderboardData()
      if (selectedAssessment?.id === assessmentId) {
        setSelectedAssessment(null)
      }
    }
  }

  const filteredAssessments = assessments.filter(assessment => {
    if (filter === 'all') return true
    if (filter === 'verified') return assessment.faceVerificationPassed
    if (filter === 'pending') return !assessment.faceVerificationPassed
    return true
  })

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              🏛️ Talent Spark Admin
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', margin: 0 }}>
              Fitness Assessment Management Dashboard
            </p>
          </div>
          
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '1rem 1.5rem',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back to App
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(0,210,255,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(0,210,255,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#00d2ff', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
              {assessments.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Total Assessments</div>
          </div>

          <div style={{
            background: 'rgba(0,255,65,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(0,255,65,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#00ff41', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
              {assessments.filter(a => a.faceVerificationPassed).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Verified</div>
          </div>

          <div style={{
            background: 'rgba(254,202,87,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(254,202,87,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#feca57', marginBottom: '0.5rem' }}>⏳</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
              {assessments.filter(a => !a.faceVerificationPassed).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Pending Review</div>
          </div>

          <div style={{
            background: 'rgba(255,107,107,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,107,107,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#ff6b6b', marginBottom: '0.5rem' }}>📈</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
              {gamificationStats.averageGrade}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)' }}>Average Grade</div>
          </div>
        </div>

        {/* Gamification Overview */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
            🎮 Gamification Overview
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'rgba(0,210,255,0.2)',
              borderRadius: '15px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(0,210,255,0.3)'
            }}>
              <div style={{ fontSize: '2rem', color: '#00d2ff', marginBottom: '0.5rem' }}>👥</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
                {gamificationStats.totalUsers}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Active Competitors</div>
            </div>

            <div style={{
              background: 'rgba(254,202,87,0.2)',
              borderRadius: '15px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(254,202,87,0.3)'
            }}>
              <div style={{ fontSize: '2rem', color: '#feca57', marginBottom: '0.5rem' }}>🏅</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>
                {gamificationStats.totalBadges}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Total Badges Earned</div>
            </div>

            <div style={{
              background: 'rgba(0,255,65,0.2)',
              borderRadius: '15px',
              padding: '1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(0,255,65,0.3)'
            }}>
              <div style={{ fontSize: '2rem', color: '#00ff41', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', marginBottom: '0.3rem' }}>
                {gamificationStats.topPerformer}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Top Performer</div>
            </div>
          </div>
          
          {/* Top Performers Leaderboard */}
          {leaderboardData.length > 0 && (
            <div>
              <h3 style={{ color: 'white', marginBottom: '1rem' }}>🏆 Top 10 Performers</h3>
              <div style={{
                display: 'grid',
                gap: '0.5rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.userId}
                    style={{
                      background: index < 3 
                        ? `linear-gradient(135deg, ${getGradeColor(user.grade)}20 0%, ${getGradeColor(user.grade)}10 100%)`
                        : 'rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      padding: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: index < 3 
                        ? `1px solid ${getGradeColor(user.grade)}40`
                        : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        fontSize: index < 3 ? '1.3rem' : '1rem',
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'white',
                        minWidth: '2.5rem'
                      }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                          {user.name}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                          {user.totalAssessments} tests • Grade: {user.grade}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {user.overallScore.toLocaleString()}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        {user.badges.length} badges
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assessment Records */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ color: 'white', margin: 0 }}>📋 Assessment Records ({filteredAssessments.length})</h2>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Assessments</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
          
          {filteredAssessments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '1.1rem',
              padding: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              No assessments found. Complete some assessments to see data here.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    background: selectedAssessment?.id === assessment.id 
                      ? 'rgba(0,210,255,0.2)' 
                      : 'rgba(255,255,255,0.05)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: selectedAssessment?.id === assessment.id 
                      ? '2px solid #00d2ff' 
                      : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedAssessment(assessment)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          color: getGradeColor(assessment.grade),
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          minWidth: '2rem'
                        }}>
                          {assessment.grade}
                        </span>
                        <div>
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {assessment.profileData.name}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                            {assessment.selectedWorkout.charAt(0).toUpperCase() + assessment.selectedWorkout.slice(1)} • {' '}
                            {new Date(assessment.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '2rem',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.9rem'
                      }}>
                        <span>🔢 {assessment.analysisResults?.totalReps || 0} reps</span>
                        <span>✨ {assessment.analysisResults?.formScore || 0}% form</span>
                        <span>💎 {assessment.pointsEarned || 0} points</span>
                        <span>🏅 {assessment.badgesEarned?.length || 0} badges</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: assessment.faceVerificationPassed 
                          ? 'rgba(0,255,65,0.2)' 
                          : 'rgba(255,202,87,0.2)',
                        color: assessment.faceVerificationPassed ? '#00ff41' : '#feca57',
                        border: assessment.faceVerificationPassed 
                          ? '1px solid rgba(0,255,65,0.3)' 
                          : '1px solid rgba(255,202,87,0.3)'
                      }}>
                        {assessment.faceVerificationPassed ? '✅ Verified' : '⏳ Pending'}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAssessment(assessment.id)
                        }}
                        style={{
                          background: 'rgba(255,107,107,0.2)',
                          color: '#ff6b6b',
                          border: '1px solid rgba(255,107,107,0.3)',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Assessment Details */}
        {selectedAssessment && (
          <div style={{
            background: 'rgba(0,210,255,0.1)',
            borderRadius: '20px',
            padding: '2rem',
            marginTop: '2rem',
            border: '2px solid rgba(0,210,255,0.3)'
          }}>
            <h3 style={{ color: '#00d2ff', marginBottom: '1.5rem' }}>
              📊 Assessment Details - {selectedAssessment.profileData.name}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{ color: 'white' }}>
                <strong>Personal Info:</strong><br/>
                Age: {selectedAssessment.profileData.age}<br/>
                Gender: {selectedAssessment.profileData.gender}<br/>
                Height: {selectedAssessment.profileData.height}cm<br/>
                Weight: {selectedAssessment.profileData.weight}kg
              </div>
              
              <div style={{ color: 'white' }}>
                <strong>Performance:</strong><br/>
                Reps: {selectedAssessment.analysisResults?.totalReps || 0}<br/>
                Form Score: {selectedAssessment.analysisResults?.formScore || 0}%<br/>
                Average Depth: {selectedAssessment.analysisResults?.averageDepth || 0}%<br/>
                Grade: <span style={{ color: getGradeColor(selectedAssessment.grade) }}>{selectedAssessment.grade}</span>
              </div>
              
              <div style={{ color: 'white' }}>
                <strong>Verification:</strong><br/>
                Face Match: {selectedAssessment.analysisResults?.faceVerification?.confidence || 0}%<br/>
                Status: {selectedAssessment.faceVerificationPassed ? '✅ Verified' : '⏳ Pending'}<br/>
                Submitted: {new Date(selectedAssessment.timestamp).toLocaleString()}
              </div>

              <div style={{ color: 'white' }}>
                <strong>Gamification:</strong><br/>
                Points Earned: {selectedAssessment.pointsEarned || 0}<br/>
                Total Score: {selectedAssessment.overallScore || 0}<br/>
                Badges: {selectedAssessment.badgesEarned?.length || 0}<br/>
                {selectedAssessment.badgesEarned?.map(badge => badge.icon).join(' ') || 'None'}
              </div>
            </div>
            
            {selectedAssessment.badgesEarned?.length > 0 && (
              <div>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>🏅 Badges Earned:</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {selectedAssessment.badgesEarned.map((badge, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '0.8rem',
                        textAlign: 'center',
                        minWidth: '100px'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{badge.icon}</div>
                      <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {badge.name}
                      </div>
                      <div style={{ color: '#00ff41', fontSize: '0.7rem' }}>
                        +{badge.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
