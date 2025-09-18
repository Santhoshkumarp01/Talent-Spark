import React, { useRef, useEffect, useState } from 'react'

interface FaceGateProps {
  onFaceCapture: (faceData: string) => void
  onSkip: () => void
}

const FaceGate: React.FC<FaceGateProps> = ({ onFaceCapture, onSkip }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)

  useEffect(() => {
    initCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera access denied:', error)
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
    
    // Simulate face detection
    setFaceDetected(true)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Face Verification</h2>
        <p className="text-gray-600 mb-6 text-center">
          Please position your face in the center of the frame for identity verification
        </p>
        
        <div className="relative mb-6">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-2xl bg-gray-800"
          />
          
          <div className="absolute inset-4 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center">
            <div className="w-32 h-40 border-2 border-blue-500 rounded-full opacity-50"></div>
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex space-x-4">
          <button
            onClick={captureFace}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Capture Face
          </button>
          
          <button
            onClick={onSkip}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:border-gray-400 transition-colors"
          >
            Skip
          </button>
        </div>
        
        {faceDetected && (
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-xl text-green-800 text-sm text-center">
            ✓ Face captured successfully
          </div>
        )}
      </div>
    </div>
  )
}

export default FaceGate
