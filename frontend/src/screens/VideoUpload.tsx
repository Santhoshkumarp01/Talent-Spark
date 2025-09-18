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

      console.log('Starting real analysis...')

      // Initialize analyzers with error handling
      const analyzer = new RealPoseAnalyzer()
      await analyzer.initialize()

      const faceDetector = new FaceDetector(faceData)
      await faceDetector.initialize() // This won't crash now

      console.log('Analyzers initialized, processing video...')

      // Analyze video
      const results = await analyzer.analyzeVideo(videoFile, selectedWorkout, faceData)

      console.log('Analysis complete:', results)

      setAnalysisResults(results)
      onAnalysisComplete(results)
      setAnalyzing(false)

    } catch (error) {
      console.error('Real analysis failed:', error)
      setAnalyzing(false)

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      padding: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          border: 'none', padding: '0.8rem 1.2rem', borderRadius: '15px',
          color: 'white', fontSize: '1rem', cursor: 'pointer'
        }}>
          <span>←</span> Back
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
          📁 Upload {selectedWorkout === 'squats' ? 'Squat' : 'Push-up'} Video
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          borderRadius: '20px', padding: '1.5rem', maxWidth: '600px', margin: '0 auto 3rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '1rem' }}>
            🤖 AI Analysis Ready
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: '1.6' }}>
            Upload your {selectedWorkout} video. Our AI will count reps, analyze form, and verify your face for authenticity.
          </p>
        </div>

        {!uploadedVideo ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '500px', height: '300px', margin: '0 auto',
              border: '3px dashed rgba(255,255,255,0.4)',
              borderRadius: '25px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
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
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {selectedWorkout === 'squats' ? '🏋️' : '💪'}
            </div>
            <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Upload {selectedWorkout === 'squats' ? 'Squat' : 'Push-up'} Video
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
              Click to select video file<br />
              <small>MP4, WebM, MOV supported</small>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '3rem' }}>
            <video
              ref={videoRef}
              controls
              style={{
                width: '500px', height: '300px', borderRadius: '20px',
                objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            />

            {analyzing && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.9)',
                color: 'white', padding: '2rem', borderRadius: '20px',
                textAlign: 'center', backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)',
                  borderTop: '4px solid white', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
                }} />
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  🤖 AI Analyzing Video...
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.8 }}>
                  • Detecting poses and counting reps<br />
                  • Analyzing form and technique<br />
                  • Verifying face identity
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

        {uploadedVideo && !analyzing && analysisResults && (
          <div style={{
            background: 'rgba(0,255,0,0.1)', backdropFilter: 'blur(10px)',
            borderRadius: '20px', padding: '2rem', maxWidth: '500px', margin: '0 auto 2rem',
            border: '1px solid rgba(0,255,0,0.3)'
          }}>
            <h3 style={{ color: '#00ff41', fontSize: '1.3rem', marginBottom: '1rem' }}>
              ✅ Analysis Complete!
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'white' }}>
              <div>
                <strong>Reps:</strong> {analysisResults.totalReps}
              </div>
              <div>
                <strong>Form Score:</strong> {analysisResults.formScore}%
              </div>
              <div>
                <strong>Face Match:</strong> {analysisResults.faceVerification.matchConfidence}%
              </div>
              <div>
                <strong>Duration:</strong> {analysisResults.duration}s
              </div>
            </div>
          </div>
        )}

        {uploadedVideo && !analyzing && analysisResults && (
          <button
            onClick={onNext}
            style={{
              background: 'linear-gradient(135deg, #00ff41 0%, #00d2ff 100%)',
              color: 'white', border: 'none', padding: '1.2rem 2.5rem',
              borderRadius: '25px', fontSize: '1.2rem', fontWeight: 'bold',
              cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,255,65,0.4)'
            }}
          >
            📊 View Results
          </button>
        )}
      </div>

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
