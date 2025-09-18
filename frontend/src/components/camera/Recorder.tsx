import React, { useRef, useEffect, useState } from 'react'

interface RecorderProps {
  onRecordingComplete: (blob: Blob) => void
  isRecording: boolean
  onError: (error: string) => void
}

const Recorder: React.FC<RecorderProps> = ({ onRecordingComplete, isRecording, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    initCamera()
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (isRecording && stream) {
      startRecording()
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording()
    }
  }, [isRecording, stream])

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      onError('Camera access denied. Please allow camera permissions.')
    }
  }

  const startRecording = () => {
    if (!stream) return

    try {
      chunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        onRecordingComplete(blob)
      }

      mediaRecorderRef.current.start(100) // Collect data every 100ms
    } catch (error) {
      onError('Recording failed. Please try again.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-80 h-80 rounded-3xl shadow-2xl bg-gray-800 object-cover"
      />
      
      {isRecording && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500/90 px-3 py-2 rounded-full">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-semibold text-sm">REC</span>
        </div>
      )}
    </div>
  )
}

export default Recorder
