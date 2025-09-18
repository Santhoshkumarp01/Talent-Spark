import React, { useState, useRef } from 'react'
import { RealPoseAnalyzer } from '../components/analysis/RealPoseAnalyzer'
import { FaceDetector } from '../components/analysis/FaceDetector'

interface VideoUploadProps {
  onNext: () => void
  onBack: () => void
  selectedWorkout: 'squats' | 'pushups'
  faceData: string
  onAnalysisComplete: (results: any) => void
}

const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onNext, onBack, selectedWorkout, faceData, onAnalysisComplete 
}) => {
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [analysisStep, setAnalysisStep] = useState('')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file)
      const videoURL = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = videoURL
      }
      
      // Start real AI analysis
      setAnalyzing(true)
      await performRealAnalysis(file)
    } else {
      alert('Please upload a valid video file')
    }
  }

  const performRealAnalysis = async (videoFile: File) => {
    try {
      setAnalyzing(true)
      setProgress(0)
      setAnalysisStep('Initializing AI models...')
      console.log('Starting real analysis...')
      
      // Progress simulation while real analysis runs
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + Math.random() * 5
          return prev
        })
      }, 500)
      
      // Initialize analyzers with error handling
      setAnalysisStep('Loading pose detection models...')
      const analyzer = new RealPoseAnalyzer()
      await analyzer.initialize()
      
      setAnalysisStep('Initializing face verification...')
      const faceDetector = new FaceDetector(faceData)
      await faceDetector.initialize() // This won't crash now
      
      console.log('Analyzers initialized, processing video...')
      setAnalysisStep('Detecting poses and counting reps')
      
      // Analyze video
      const results = await analyzer.analyzeVideo(videoFile, selectedWorkout, faceData)
      
      clearInterval(progressTimer)
      setProgress(100)
      setAnalysisStep('Analysis complete!')
      
      console.log('Analysis complete:', results)
      setAnalysisResults(results)
      onAnalysisComplete(results)
      setAnalyzing(false)
      
    } catch (error) {
      console.error('Real analysis failed:', error)
      setAnalyzing(false)
      setProgress(0)
      // Show user-friendly error
      alert(`Analysis failed: ${error.message}. Please try a different video.`)
    }
  }

  const analyzeVideoWithMediaPipe = async (video: HTMLVideoElement, workout: string, referenceFace: string) => {
    // This is where real MediaPipe analysis would happen
    // For now, simulate processing time and return realistic results
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = {
          totalReps: workout === 'squats' ? Math.floor(Math.random() * 15) + 15 : Math.floor(Math.random() * 20) + 10,
          averageDepth: Math.floor(Math.random() * 30) + 70,
          formScore: Math.floor(Math.random() * 25) + 75,
          duration: Math.floor(video.duration || 120),
          faceVerification: {
            faceDetected: true,
            matchConfidence: Math.floor(Math.random() * 15) + 85,
            detectionFrames: Math.floor((video.duration || 120) * 0.8)
          },
          workoutType: workout,
          timestamp: Date.now()
        }
        resolve(results)
      }, 5000) // 5 second analysis simulation
    })
  }

  const triggerUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '2rem',
        maxWidth: '1200px',
        margin: '0 auto 2rem auto',
        width: '100%'
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
        >
          <span>←</span> Back
        </button>
        
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📁 Upload {selectedWorkout === 'squats' ? 'Squat' : 'Push-up'} Video
        </h1>
        
        <div style={{ width: '100px' }} />
      </div>

      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto', 
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* AI Status Card */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: 'clamp(2rem, 6vw, 3rem)', 
            marginBottom: '1rem' 
          }}>
            🤖
          </div>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            AI Analysis Ready
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
            lineHeight: '1.5',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Upload your {selectedWorkout} video. Our AI will count reps, analyze form, and verify 
            your face for authenticity.
          </p>
        </div>

        {/* Video Upload/Display Section */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '25px',
          padding: 'clamp(1.5rem, 4vw, 2rem)',
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '400px'
        }}>
          {!uploadedVideo ? (
            /* Upload Zone */
            <div 
              onClick={triggerUpload}
              style={{
                border: '3px dashed rgba(255,255,255,0.3)',
                borderRadius: '20px',
                padding: 'clamp(2rem, 6vw, 4rem)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'
              }}
            >
              <div style={{ 
                fontSize: 'clamp(3rem, 8vw, 5rem)', 
                marginBottom: '1rem',
                opacity: 0.8
              }}>
                {selectedWorkout === 'squats' ? '🏋️' : '💪'}
              </div>
              <h3 style={{
                color: 'white',
                fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                Upload {selectedWorkout === 'squats' ? 'Squat' : 'Push-up'} Video
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                marginBottom: '0.5rem'
              }}>
                Click to select video file
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
              }}>
                MP4, WebM, MOV supported
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '15px',
                marginTop: '1.5rem',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                fontWeight: 'bold',
                boxShadow: '0 10px 20px rgba(0,210,255,0.3)'
              }}>
                Choose Video File
              </div>
            </div>
          ) : (
            /* Video Display with Analysis */
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Video Player */}
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#000',
                aspectRatio: '16/9',
                maxWidth: '100%'
              }}>
                <video
                  ref={videoRef}
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
                
                {/* Analysis Overlay */}
                {analyzing && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    padding: '2rem'
                  }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px',
                      padding: 'clamp(1.5rem, 4vw, 2rem)',
                      textAlign: 'center',
                      minWidth: '300px',
                      maxWidth: '90%'
                    }}>
                      {/* Loading Spinner */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTop: '4px solid #00d2ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1.5rem'
                      }} />
                      
                      <h3 style={{
                        fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
                        fontWeight: 'bold',
                        marginBottom: '1rem'
                      }}>
                        🤖 AI Analyzing Video...
                      </h3>
                      
                      {/* Progress Steps */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{
                          color: '#00d2ff',
                          fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                          marginBottom: '0.5rem',
                          fontWeight: 'bold'
                        }}>
                          • {analysisStep || 'Detecting poses and counting reps'}
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                        }}>
                          • Analyzing form and technique
                        </div>
                        <div style={{
                          color: 'rgba(255,255,255,0.7)',
                          fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                        }}>
                          • Verifying face identity
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '10px',
                        height: '8px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                          height: '100%',
                          width: `${progress}%`,
                          transition: 'width 0.5s ease',
                          borderRadius: '10px'
                        }} />
                      </div>
                      
                      <div style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
                      }}>
                        {Math.round(progress)}% Complete
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Upload Another Video Button */}
              {!analyzing && (
                <button
                  onClick={triggerUpload}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '2px dashed rgba(255,255,255,0.3)',
                    padding: '1rem 1.5rem',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                    transition: 'all 0.3s ease',
                    alignSelf: 'center'
                  }}
                >
                  📹 Upload Different Video
                </button>
              )}
            </div>
          )}
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>

        {/* Results Display */}
        {uploadedVideo && !analyzing && analysisResults && (
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '2rem',
            marginTop: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
              ✅ Analysis Complete!
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analysisResults.totalReps}</div>
                <div>Reps</div>
              </div>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analysisResults.formScore}%</div>
                <div>Form Score</div>
              </div>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analysisResults.faceVerification.matchConfidence}%</div>
                <div>Face Match</div>
              </div>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{analysisResults.duration}s</div>
                <div>Duration</div>
              </div>
            </div>
            <button
              onClick={onNext}
              style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,210,255,0.3)'
              }}
            >
              📊 View Results
            </button>
          </div>
        )}
      </div>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VideoUpload
