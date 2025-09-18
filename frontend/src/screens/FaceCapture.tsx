import React, { useState, useRef, useEffect } from 'react'

interface FaceCaptureProps {
  onNext: () => void
  onBack: () => void
  onFaceCapture: (faceData: string) => void
  profileData: any
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onNext, onBack, onFaceCapture, profileData }) => {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [faceCaptured, setFaceCaptured] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    startCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      setError('Camera access required for face verification.')
    }
  }

  const captureFace = () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const faceData = canvas.toDataURL('image/jpeg', 0.8)
    onFaceCapture(faceData)
    setFaceCaptured(true)
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
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
          🔐 Face Verification
        </h1>
        <div style={{ width: '100px' }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
          borderRadius: '30px', padding: '2rem', maxWidth: '600px', margin: '0 auto 2rem',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
            Hello {profileData.name}! 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            One-time face capture for workout video verification
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,0,0,0.2)', border: '1px solid rgba(255,0,0,0.5)',
            borderRadius: '15px', padding: '1rem', color: 'white', marginBottom: '2rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '400px', height: '300px', borderRadius: '20px',
              objectFit: 'cover', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          />
          
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', width: '200px', height: '250px',
            border: '3px dashed rgba(0,255,0,0.6)', borderRadius: '50%',
            pointerEvents: 'none'
          }} />
          
          {faceCaptured && (
            <div style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(0,255,0,0.8)', color: 'white',
              padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold'
            }}>
              ✅ Face Captured
            </div>
          )}
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {!faceCaptured ? (
            <button
              onClick={captureFace}
              disabled={!stream}
              style={{
                background: stream 
                  ? 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)'
                  : 'rgba(255,255,255,0.3)',
                color: 'white', border: 'none', padding: '1.2rem 2.5rem',
                borderRadius: '25px', fontSize: '1.2rem', fontWeight: 'bold',
                cursor: stream ? 'pointer' : 'not-allowed',
                boxShadow: stream ? '0 20px 40px rgba(0,210,255,0.4)' : 'none'
              }}
            >
              📸 Capture Face
            </button>
          ) : (
            <button
              onClick={onNext}
              style={{
                background: 'linear-gradient(135deg, #00ff41 0%, #00d2ff 100%)',
                color: 'white', border: 'none', padding: '1.2rem 2.5rem',
                borderRadius: '25px', fontSize: '1.2rem', fontWeight: 'bold',
                cursor: 'pointer', boxShadow: '0 20px 40px rgba(0,255,65,0.4)'
              }}
            >
              ✅ Continue to Workouts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FaceCapture
