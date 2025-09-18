import React, { useState, useEffect } from 'react'

interface SyncProps {
  onBack: () => void
  onHome: () => void
  submissionData: any
}

const Sync: React.FC<SyncProps> = ({ onBack, onHome, submissionData }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [uploadSpeed, setUploadSpeed] = useState('0 KB/s')

  const steps = [
    { 
      id: 'preparing',
      title: 'Preparing Assessment Data',
      description: 'Encrypting and packaging your performance data...',
      icon: '📦',
      duration: 1500
    },
    { 
      id: 'video',
      title: 'Processing Video Analysis',
      description: 'Securing your workout video with AI verification...',
      icon: '🎥',
      duration: 2000
    },
    { 
      id: 'face',
      title: 'Face Verification Complete',
      description: 'Identity authentication and security check passed...',
      icon: '🔒',
      duration: 1000
    },
    { 
      id: 'upload',
      title: 'Uploading to SAI Servers',
      description: 'Transmitting to Sports Authority of India database...',
      icon: '☁️',
      duration: 2500
    },
    { 
      id: 'verification',
      title: 'Awaiting Official Verification',
      description: 'Your assessment is now in the official review queue...',
      icon: '⏳',
      duration: 1000
    }
  ]

  useEffect(() => {
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        
        // Simulate upload progress
        const step = steps[i]
        const progressIncrement = 100 / steps.length
        
        // Animate progress for current step
        const startProgress = i * progressIncrement
        const endProgress = (i + 1) * progressIncrement
        
        const animateProgress = () => {
          const duration = step.duration
          const startTime = Date.now()
          
          const animate = () => {
            const elapsed = Date.now() - startTime
            const percent = Math.min(elapsed / duration, 1)
            
            const currentProgress = startProgress + (percent * progressIncrement)
            setProgress(currentProgress)
            
            // Simulate upload speed
            if (step.id === 'upload') {
              const speed = (50 + Math.random() * 200).toFixed(0)
              setUploadSpeed(`${speed} KB/s`)
            }
            
            if (percent < 1) {
              requestAnimationFrame(animate)
            } else if (i === steps.length - 1) {
              // All steps complete
              setTimeout(() => {
                setIsComplete(true)
                setSubmissionId(`TS_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`)
              }, 500)
            }
          }
          
          animate()
        }
        
        animateProgress()
        await new Promise(resolve => setTimeout(resolve, step.duration))
      }
    }
    
    processSteps()
  }, [])

  if (isComplete) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #00ff41 0%, #00d2ff 50%, #3a7bd5 100%)',
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
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 30px 60px rgba(0,255,65,0.3)'
        }}>
          {/* Success Animation */}
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 2rem',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            animation: 'bounce 2s infinite'
          }}>
            ✅
          </div>

          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            marginBottom: '1rem',
            fontWeight: 'bold'
          }}>
            Assessment Submitted Successfully!
          </h1>
          
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.2rem', 
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Your fitness assessment has been securely uploaded to the Sports Authority of India servers and is now awaiting official verification.
          </p>

          {/* Submission Details Card */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              📄 Submission Details
            </h3>
            
            <div style={{ display: 'grid', gap: '0.8rem', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Submission ID:</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{submissionId}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Assessment Type:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {submissionData.selectedWorkout?.charAt(0).toUpperCase() + submissionData.selectedWorkout?.slice(1)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Submitted:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {new Date().toLocaleString()}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status:</span>
                <span style={{ 
                  fontWeight: 'bold',
                  color: '#00ff41',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#00ff41',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  Pending Review
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Expected Review:</span>
                <span style={{ fontWeight: 'bold' }}>2-3 Business Days</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
              📋 What Happens Next?
            </h4>
            
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '0.8rem' }}>
                ✅ <strong>Step 1:</strong> SAI officials will review your assessment data
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                📊 <strong>Step 2:</strong> Performance analysis and benchmarking
              </div>
              <div style={{ marginBottom: '0.8rem' }}>
                🔍 <strong>Step 3:</strong> Face verification and authenticity check
              </div>
              <div>
                📧 <strong>Step 4:</strong> Official results notification (via portal)
              </div>
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
              onClick={onHome}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#00d2ff',
                border: 'none',
                padding: '1.2rem 2.5rem',
                borderRadius: '25px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(255,255,255,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255,255,255,0.3)'
              }}
            >
              🏠 Back to Home
            </button>

            <button
              onClick={() => window.location.href = '#admin'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.5)',
                padding: '1.2rem 2rem',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🏛️ Admin Panel
            </button>
          </div>

          {/* Footer Info */}
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            marginTop: '2rem',
            lineHeight: '1.4'
          }}>
            Keep your Submission ID safe for tracking. You can check your assessment status in the admin panel or contact SAI support if needed.
          </p>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
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
        maxWidth: '600px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'pulse 2s infinite'
          }}>
            📤
          </div>
          
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
          }}>
            Uploading Assessment
          </h1>
          
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.8)',
            margin: 0
          }}>
            Securely transmitting your performance data to SAI servers
          </p>
        </div>

        {/* Progress Bar */}
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
            width: `${progress}%`,
            transition: 'width 0.3s ease',
            boxShadow: '0 2px 10px rgba(0,210,255,0.5)'
          }} />
        </div>

        {/* Progress Percentage */}
        <div style={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '2rem',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {Math.round(progress)}%
        </div>

        {/* Current Step */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '2.5rem',
              animation: 'bounce 1s infinite'
            }}>
              {steps[currentStep]?.icon}
            </div>
            <div>
              <h3 style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: 'bold',
                margin: 0,
                marginBottom: '0.3rem'
              }}>
                {steps[currentStep]?.title}
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontSize: '0.95rem'
              }}>
                {steps[currentStep]?.description}
              </p>
            </div>
          </div>

          {/* Upload Speed (only during upload step) */}
          {steps[currentStep]?.id === 'upload' && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              padding: '0.8rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>Upload Speed:</span>
              <span style={{ 
                color: '#00ff41', 
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}>
                {uploadSpeed}
              </span>
            </div>
          )}
        </div>

        {/* Steps Overview */}
        <div style={{
          display: 'grid',
          gap: '0.8rem'
        }}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.8rem',
                borderRadius: '10px',
                background: index <= currentStep 
                  ? 'rgba(0,255,65,0.2)' 
                  : 'rgba(255,255,255,0.05)',
                border: index === currentStep 
                  ? '2px solid #00ff41' 
                  : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                fontSize: '1.2rem',
                opacity: index <= currentStep ? 1 : 0.5
              }}>
                {index < currentStep ? '✅' : index === currentStep ? step.icon : '🔘'}
              </div>
              <span style={{
                color: index <= currentStep ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                fontWeight: index === currentStep ? 'bold' : 'normal'
              }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.9rem'
        }}>
          Please keep this page open until upload is complete.
          <br/>
          Your assessment data is encrypted and secure.
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
            60% { transform: translateY(-4px); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default Sync
