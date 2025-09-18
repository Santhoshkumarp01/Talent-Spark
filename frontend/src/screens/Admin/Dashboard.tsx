import React, { useState, useEffect } from 'react'

interface AssessmentRecord {
  id: string
  timestamp: number
  profileData: any
  selectedWorkout: string
  analysisResults: any
  grade: string
  faceVerificationPassed: boolean
  submittedAt: string
}

interface DashboardProps {
  onBack: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentRecord | null>(null)
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = () => {
    const allAssessments: AssessmentRecord[] = []
    
    // Load from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('assessment_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!)
          allAssessments.push({
            id: key,
            ...data
          })
        } catch (error) {
          console.error('Error parsing assessment:', error)
        }
      }
    }
    
    // Sort by timestamp (newest first)
    allAssessments.sort((a, b) => b.timestamp - a.timestamp)
    setAssessments(allAssessments)
  }

  const deleteAssessment = (id: string) => {
    if (confirm('Are you sure you want to delete this assessment?')) {
      localStorage.removeItem(id)
      loadAssessments()
      if (selectedAssessment?.id === id) {
        setSelectedAssessment(null)
      }
    }
  }

  const exportData = () => {
    const dataStr = JSON.stringify(assessments, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `assessments_${new Date().toISOString().slice(0,10)}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete ALL assessment data? This cannot be undone.')) {
      const keysToDelete = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('assessment_')) {
          keysToDelete.push(key)
        }
      }
      keysToDelete.forEach(key => localStorage.removeItem(key))
      loadAssessments()
      setSelectedAssessment(null)
    }
  }

  const filteredAssessments = assessments.filter(assessment => {
    if (filter === 'passed') return assessment.faceVerificationPassed
    if (filter === 'failed') return !assessment.faceVerificationPassed
    return true
  })

  const getGradeColor = (grade: string) => {
    const colors = {
      'A+': '#00ff41', 'A': '#00d2ff', 'B+': '#feca57',
      'B': '#ff9ff3', 'C+': '#ff6b6b', 'C': '#ff9f43', 'F': '#ff4757', 'D': '#95a5a6'
    }
    return colors[grade] || '#95a5a6'
  }

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
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={exportData}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              📤 Export Data
            </button>
            
            <button
              onClick={clearAllData}
              style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.5rem',
                borderRadius: '15px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              🗑️ Clear All
            </button>
            
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
        </div>

        {/* Stats Cards */}
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
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.3rem' }}>
              {assessments.length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Total Assessments</div>
          </div>

          <div style={{
            background: 'rgba(0,255,65,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(0,255,65,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#00ff41', marginBottom: '0.5rem' }}>✅</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.3rem' }}>
              {assessments.filter(a => a.faceVerificationPassed).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Face Verified</div>
          </div>

          <div style={{
            background: 'rgba(255,107,107,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255,107,107,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#ff6b6b', marginBottom: '0.5rem' }}>⚠️</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.3rem' }}>
              {assessments.filter(a => !a.faceVerificationPassed).length}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Face Failed</div>
          </div>

          <div style={{
            background: 'rgba(254,202,87,0.2)',
            borderRadius: '15px',
            padding: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(254,202,87,0.3)'
          }}>
            <div style={{ fontSize: '2rem', color: '#feca57', marginBottom: '0.5rem' }}>⭐</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '0.3rem' }}>
              {assessments.length > 0 
                ? (assessments.reduce((sum, a) => sum + (a.analysisResults?.formScore || 0), 0) / assessments.length).toFixed(1)
                : 0
              }%
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Avg Form Score</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold' }}>Filter:</span>
          {(['all', 'passed', 'failed'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                background: filter === filterType 
                  ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '0.9rem'
              }}
            >
              {filterType} ({
                filterType === 'all' ? assessments.length :
                filterType === 'passed' ? assessments.filter(a => a.faceVerificationPassed).length :
                assessments.filter(a => !a.faceVerificationPassed).length
              })
            </button>
          ))}
        </div>

        {/* Assessments List */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem'
        }}>
          <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>📋 Assessment Records ({filteredAssessments.length})</h2>
          
          {filteredAssessments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '1.1rem', 
              padding: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              No assessments found for "{filter}" filter
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    border: selectedAssessment?.id === assessment.id 
                      ? '2px solid #00d2ff' 
                      : '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
                    gap: '1rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {assessment.profileData?.name || 'Unknown User'}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {new Date(assessment.timestamp).toLocaleDateString()} • {new Date(assessment.timestamp).toLocaleTimeString()}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                        {assessment.profileData?.age}y • {assessment.profileData?.gender} • {assessment.profileData?.height}cm • {assessment.profileData?.weight}kg
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: getGradeColor(assessment.grade), 
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        marginBottom: '0.2rem'
                      }}>
                        {assessment.grade}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        Grade
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {assessment.analysisResults?.totalReps || 0}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        {assessment.selectedWorkout} reps
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                        {assessment.analysisResults?.formScore || 0}%
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        Form Score
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        color: assessment.faceVerificationPassed ? '#00ff41' : '#ff6b6b',
                        fontSize: '1.2rem',
                        marginBottom: '0.2rem'
                      }}>
                        {assessment.faceVerificationPassed ? '✅' : '❌'}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                        {assessment.analysisResults?.faceVerification?.confidence || 0}%
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSelectedAssessment(
                          selectedAssessment?.id === assessment.id ? null : assessment
                        )}
                        style={{
                          background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        {selectedAssessment?.id === assessment.id ? 'Hide' : 'View'}
                      </button>
                      
                      <button
                        onClick={() => deleteAssessment(assessment.id)}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedAssessment?.id === assessment.id && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '15px',
                      borderTop: '2px solid #00d2ff'
                    }}>
                      <h4 style={{ color: 'white', marginBottom: '1rem' }}>📄 Detailed Analysis</h4>
                      
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        color: 'white',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <strong>📊 Performance Metrics:</strong>
                          <div style={{ marginLeft: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                            • Total Reps: {assessment.analysisResults?.totalReps || 0}
                            <br/>• Average Depth: {assessment.analysisResults?.averageDepth || 0}%
                            <br/>• Form Score: {assessment.analysisResults?.formScore || 0}%
                            <br/>• Duration: {assessment.analysisResults?.duration || 0}s
                          </div>
                        </div>
                        
                        <div>
                          <strong>🎯 AI Detection:</strong>
                          <div style={{ marginLeft: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                            • Poses Detected: {assessment.analysisResults?.posesDetected || 0}/{assessment.analysisResults?.totalFrames || 0}
                            <br/>• Detection Rate: {assessment.analysisResults?.totalFrames > 0 ? Math.round((assessment.analysisResults?.posesDetected || 0) / assessment.analysisResults.totalFrames * 100) : 0}%
                            <br/>• Workout Type: {assessment.selectedWorkout}
                            <br/>• Submitted: {new Date(assessment.submittedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <details style={{ marginTop: '1rem' }}>
                        <summary style={{ color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}>
                          🔍 Raw Data (Click to expand)
                        </summary>
                        <pre style={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          fontSize: '0.7rem',
                          maxHeight: '200px',
                          overflow: 'auto',
                          background: 'rgba(0,0,0,0.5)',
                          padding: '1rem',
                          borderRadius: '10px',
                          marginTop: '0.5rem'
                        }}>
                          {JSON.stringify(assessment, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
