import React, { useState, useEffect } from 'react'
import { GameManager, UserStats, Badge } from '../components/gamification/GameManager'

interface ProfileProps {
  onBack: () => void
  userName: string
}

const Profile: React.FC<ProfileProps> = ({ onBack, userName }) => {
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [userName])

  const loadUserData = async () => {
    setLoading(true)
    try {
      const stats = GameManager.getUserStats(userName)
      const badges = GameManager.getAllBadges()
      setUserStats(stats)
      setAllBadges(badges)
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeProgress = (): number => {
    if (!userStats) return 0
    return (userStats.badgesEarned.length / allBadges.length) * 100
  }

  const getRankBadgeColor = (rank: number): string => {
    if (rank <= 10) return '#FFD700' // Gold
    if (rank <= 50) return '#C0C0C0' // Silver
    if (rank <= 100) return '#CD7F32' // Bronze
    return '#94A3B8' // Gray
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          Loading profile...
        </div>
      </div>
    )
  }

  if (!userStats) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h2>No profile found</h2>
          <p>Complete an assessment to create your profile</p>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '15px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
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
          border: '1px solid rgba(255,255,255,0.2)',
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
          
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 1rem',
            background: `linear-gradient(135deg, ${getRankBadgeColor(userStats.currentRank)} 0%, ${getRankBadgeColor(userStats.currentRank)}80 100%)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            👤
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 0.5rem 0'
          }}>
            {userName}
          </h1>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            marginTop: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: getRankBadgeColor(userStats.currentRank), fontSize: '1.5rem', fontWeight: 'bold' }}>
                #{userStats.currentRank}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>National Rank</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ff41', fontSize: '1.5rem', fontWeight: 'bold' }}>
                #{userStats.stateRank}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>State Rank</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#feca57', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {userStats.totalPoints.toLocaleString()}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>Total Points</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              {userStats.totalAssessments}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Total Assessments</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              {userStats.streakDays}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Day Streak</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
              {userStats.badgesEarned.length}/{allBadges.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Badges Earned</div>
          </div>
        </div>

        {/* Badge Progress */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
            🏅 Badge Collection ({Math.round(getBadgeProgress())}% Complete)
          </h3>
          
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '15px',
            padding: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
              height: '12px',
              borderRadius: '10px',
              width: `${getBadgeProgress()}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>

          {/* Earned Badges */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>✅ Earned Badges</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {userStats.badgesEarned.map(badge => (
                <div
                  key={badge.id}
                  style={{
                    background: 'rgba(0,255,65,0.1)',
                    border: '2px solid rgba(0,255,65,0.3)',
                    borderRadius: '15px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>{badge.icon}</div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {badge.name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {badge.description}
                    </div>
                    <div style={{ color: '#00ff41', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      +{badge.points} points
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Badges */}
          <div>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>🔒 Locked Badges</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {allBadges
                .filter(badge => !userStats.badgesEarned.some(earned => earned.id === badge.id))
                .map(badge => (
                <div
                  key={badge.id}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '15px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    opacity: 0.7
                  }}
                >
                  <div style={{ fontSize: '2rem', filter: 'grayscale(100%)' }}>{badge.icon}</div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      {badge.name}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                      {badge.description}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                      Requirement: {badge.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Bests */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
            🎯 Personal Best Records
          </h3>
          
          {userStats.personalBests.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏃</div>
              Complete more assessments to see your personal bests!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {userStats.personalBests.map(best => (
                <div
                  key={best.exercise}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>
                      {best.exercise.toLowerCase() === 'squats' ? '🏋️' : '💪'}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {best.exercise}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {new Date(best.achievedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {best.reps}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        Reps
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {best.formScore}%
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        Form
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: best.grade === 'A+' ? '#00ff41' : best.grade === 'A' ? '#00d2ff' : '#feca57',
                        fontSize: '1.5rem', 
                        fontWeight: 'bold' 
                      }}>
                        {best.grade}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        Grade
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
