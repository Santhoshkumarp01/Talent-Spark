import React, { useState, useEffect } from 'react'
import { GameManager } from '../components/gamification/GameManager'

// Define types locally to avoid import issues
interface LeaderboardEntry {
  userId: string
  name: string
  overallScore: number
  totalAssessments: number
  badges: any[]
  rank: number
  grade: string
}

interface LeaderboardProps {
  onBack: () => void
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = () => {
    setLoading(true)
    try {
      const data = GameManager.getLeaderboard()
      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': '#00ff41', 'A': '#00d2ff', 'B+': '#feca57',
      'B': '#ff9ff3', 'C+': '#ff6b6b', 'C': '#ff9f43', 'D': '#95a5a6', 'F': '#ff4757'
    }
    return colors[(grade || 'F') as keyof typeof colors] || '#95a5a6'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: '2rem',
          marginBottom: '2rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', margin: 0 }}>
            TalentSpark Leaderboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
            Compete with athletes across India
          </p>
        </div>

        {/* Leaderboard */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'white', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏃</div>
              No participants yet. Be the first!
            </div>
          ) : (
            <div>
              <h3 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
                🏆 Top Athletes ({leaderboard.length})
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.userId}
                    style={{
                      background: index < 3 
                        ? `linear-gradient(135deg, ${getGradeColor(entry.grade)}20 0%, ${getGradeColor(entry.grade)}10 100%)`
                        : 'rgba(255,255,255,0.05)',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      border: index < 3 
                        ? `2px solid ${getGradeColor(entry.grade)}60`
                        : '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                      <div style={{
                        fontSize: index < 3 ? '1.8rem' : '1.2rem',
                        fontWeight: 'bold',
                        color: index < 3 ? getGradeColor(entry.grade) : 'white',
                        minWidth: '4rem'
                      }}>
                        {getRankDisplay(entry.rank)}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          marginBottom: '0.3rem'
                        }}>
                          {entry.name}
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: '0.9rem',
                          display: 'flex',
                          gap: '1rem'
                        }}>
                          <span>🎯 {entry.totalAssessments} tests</span>
                          <span>🏅 {entry.badges.length} badges</span>
                          <span>📊 Grade: {entry.grade}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.4rem',
                        marginBottom: '0.2rem'
                      }}>
                        {entry.overallScore.toLocaleString()}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.9rem'
                      }}>
                        points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
