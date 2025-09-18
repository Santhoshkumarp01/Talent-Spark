import React, { useState, useRef, useEffect } from 'react'

interface RecordProps {
  onNext: () => void
  onBack: () => void
  profileData: any
}

const Record: React.FC<RecordProps> = ({ onNext, onBack, profileData }) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera')
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [repCount, setRepCount] = useState(0)
  const [currentDepth, setCurrentDepth] = useState('Ready')
  const [formScore, setFormScore] = useState(100)
  const [faceDetected, setFaceDetected] = useState(false)
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simulate face detection and rep counting
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setFaceDetected(Math.random() > 0.3) // 70% face detection
        setRepCount(prev => {
          const newCount = prev + (Math.random() > 0.7 ? 1 : 0)
          return Math.min(newCount, 30) // Max 30 reps
        })
        setCurrentDepth(['Shallow', 'Good', 'Deep', 'Perfect'][Math.floor(Math.random() * 4)])
        setFormScore(Math.max(70, 100 - Math.floor(Math.random() * 15)))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isRecording])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('camera')
    } catch (error) {
      alert('Camera access denied. Please use upload mode.')
      setMode('upload')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file)
      
      // Create video URL for preview
      const videoURL = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = videoURL
      }
      
      // Simulate AI analysis
      setAnalyzing(true)
      setTimeout(() => {
        setRepCount(Math.floor(Math.random() * 20) + 15) // 15-35 reps
        setCurrentDepth('Analyzed')
        setFormScore(Math.floor(Math.random() * 30) + 70) // 70-100
        setFaceDetected(true)
        setAnalyzing(false)
      }, 3000)
    } else {
      alert('Please upload a valid video file')
    }
  }

  const startRecording = () => {
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer)
          setIsRecording(true)
          setRepCount(0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setTimeout(() => onNext(), 1000)
  }

  useEffect(() => {
    if (mode === 'camera') {
      startCamera()
    }
  }, [mode])

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      position: 'relative'
    }}>
      {/* Animated particles background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
        `
      }} />

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '1.5rem',
        position: 'relative',
        zIndex: 10
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
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          <span style={{ fontSize: '1.2rem' }}>←</span>
          Back
        </button>
        
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 20px rgba(255,255,255,0.5)'
        }}>
          🏋️ AI Squat Assessment
        </h1>
        
        <div style={{ width: '80px' }} />
      </div>

      {/* Mode Selection */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '0 1.5rem',
        marginBottom: '2rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '0.5rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <button
            onClick={() => setMode('camera')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              borderRadius: '15px',
              background: mode === 'camera' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'camera' ? '0 10px 20px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            📹 Live Camera
          </button>
          <button
            onClick={() => setMode('upload')}
            style={{
              padding: '0.8rem 1.5rem',
              border: 'none',
              borderRadius: '15px',
              background: mode === 'upload' 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)'
                : 'transparent',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: mode === 'upload' ? '0 10px 20px rgba(255, 107, 107, 0.4)' : 'none'
            }}
          >
            📁 Upload Video
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '0 1.5rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Video Area */}
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          {mode === 'upload' && !uploadedVideo ? (
            // Upload Zone
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '400px',
                height: '400px',
                border: '3px dashed rgba(255,255,255,0.3)',
                borderRadius: '30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s infinite'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)'
                e.target.style.borderColor = 'rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)'
                e.target.style.borderColor = 'rgba(255,255,255,0.3)'
              }}
            >
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📤</div>
              <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Upload Your Squat Video
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: '1.5' }}>
                Click to select video file<br/>
                <small>Supports MP4, WebM, MOV</small>
              </div>
            </div>
          ) : (
            // Video Player
            <div style={{ position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay={mode === 'camera'}
                playsInline
                muted={mode === 'camera'}
                controls={mode === 'upload'}
                style={{
                  width: '400px',
                  height: '400px',
                  borderRadius: '30px',
                  objectFit: 'cover',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
              />
              
              {/* Pose overlay lines */}
              <svg 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '400px',
                  height: '400px',
                  borderRadius: '30px',
                  pointerEvents: 'none'
                }}
              >
                {/* Simulated pose skeleton */}
                <line x1="200" y1="100" x2="200" y2="200" stroke="#00ff41" strokeWidth="3" opacity="0.8" />
                <line x1="200" y1="200" x2="160" y2="280" stroke="#00ff41" strokeWidth="3" opacity="0.8" />
                <line x1="200" y1="200" x2="240" y2="280" stroke="#00ff41" strokeWidth="3" opacity="0.8" />
                <line x1="160" y1="280" x2="150" y2="350" stroke="#00ff41" strokeWidth="3" opacity="0.8" />
                <line x1="240" y1="280" x2="250" y2="350" stroke="#00ff41" strokeWidth="3" opacity="0.8" />
                <circle cx="200" cy="80" r="20" fill="rgba(0,255,65,0.3)" stroke="#00ff41" strokeWidth="2" />
              </svg>

              {/* Status Overlays */}
              {countdown > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '6rem',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '0 0 30px rgba(255,255,255,0.8)',
                  animation: 'bounce 0.5s'
                }}>
                  {countdown}
                </div>
              )}

              {isRecording && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(255,0,0,0.8)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 'bold'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'white',
                    animation: 'pulse 1s infinite'
                  }} />
                  RECORDING
                </div>
              )}

              {/* Face Detection Status */}
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: faceDetected 
                  ? 'rgba(0,255,0,0.8)' 
                  : 'rgba(255,0,0,0.8)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {faceDetected ? '👤 Face Detected' : '❌ No Face'}
              </div>

              {analyzing && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255,255,255,0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    🤖 AI Analyzing Video...
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
                    Detecting poses and counting reps
                  </div>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Live Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { label: 'Reps', value: repCount, color: '#00d2ff', icon: '🔢' },
            { label: 'Depth', value: currentDepth, color: '#feca57', icon: '📏' },
            { label: 'Form', value: `${formScore}%`, color: '#00ff41', icon: '✨' },
            { label: 'AI Score', value: 'A+', color: '#ff6b6b', icon: '🎯' }
          ].map((stat, index) => (
            <div 
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                padding: '1.5rem',
                borderRadius: '20px',
                textAlign: 'center',
                minWidth: '120px',
                border: `2px solid ${stat.color}30`,
                boxShadow: `0 10px 30px ${stat.color}20`,
                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                {stat.icon}
              </div>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: stat.color,
                marginBottom: '0.3rem',
                textShadow: `0 0 10px ${stat.color}50`
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255,255,255,0.7)',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          padding: '1.5rem',
          borderRadius: '20px',
          maxWidth: '500px',
          textAlign: 'center',
          marginBottom: '2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💡</div>
          <p style={{ 
            color: 'white', 
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {mode === 'upload' && !uploadedVideo && 
              "Upload a video of your squat exercise. Our AI will analyze your form and count reps automatically!"
            }
            {mode === 'upload' && uploadedVideo && !analyzing &&
              "Video uploaded! Review the AI analysis results below."
            }
            {mode === 'camera' && !isRecording && 
              "Position yourself in the frame. Keep your face visible and start recording when ready!"
            }
            {mode === 'camera' && isRecording &&
              "Great! Keep squatting with proper form. AI is tracking your movement in real-time."
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {mode === 'camera' && !isRecording && (
            <button
              onClick={startRecording}
              disabled={countdown > 0}
              style={{
                background: faceDetected 
                  ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
                  : 'rgba(255,255,255,0.3)',
                color: 'white',
                border: 'none',
                padding: '1.2rem 2.5rem',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: faceDetected && countdown === 0 ? 'pointer' : 'not-allowed',
                boxShadow: faceDetected 
                  ? '0 20px 40px rgba(0,210,255,0.4)' 
                  : 'none',
                transition: 'all 0.3s ease',
                opacity: countdown > 0 ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (faceDetected && countdown === 0) {
                  e.target.style.transform = 'translateY(-3px)'
                  e.target.style.boxShadow = '0 25px 50px rgba(0,210,255,0.6)'
                }
              }}
              onMouseLeave={(e) => {
                if (faceDetected && countdown === 0) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 20px 40px rgba(0,210,255,0.4)'
                }
              }}
            >
              {countdown > 0 ? `Starting in ${countdown}...` : 
               faceDetected ? '🎬 Start Recording' : '⏳ Face Required'}
            </button>
          )}

          {mode === 'camera' && isRecording && (
            <button
              onClick={stopRecording}
              style={{
                background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                color: 'white',
                border: 'none',
                padding: '1.2rem 2.5rem',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(255, 65, 108, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 25px 50px rgba(255, 65, 108, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 20px 40px rgba(255, 65, 108, 0.4)'
              }}
            >
              🛑 Stop Recording
            </button>
          )}

          {mode === 'upload' && uploadedVideo && !analyzing && (
            <button
              onClick={() => onNext()}
              style={{
                background: 'linear-gradient(135deg, #00ff41 0%, #00d2ff 100%)',
                color: 'white',
                border: 'none',
                padding: '1.2rem 2.5rem',
                borderRadius: '25px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(0, 255, 65, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 25px 50px rgba(0, 255, 65, 0.6)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 20px 40px rgba(0, 255, 65, 0.4)'
              }}
            >
              ✨ View Results
            </button>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default Record
