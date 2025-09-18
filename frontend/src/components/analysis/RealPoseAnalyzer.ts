import { Pose } from '@mediapipe/pose'
import { SquatAnalyzer } from './SquatAnalyzer'
import { PushupAnalyzer } from './PushupAnalyzer'
import { FaceDetector } from './FaceDetector'

export interface PoseLandmark {
  x: number
  y: number
  z: number
  visibility: number
}

export interface AnalysisResults {
  totalReps: number
  averageDepth: number
  formScore: number
  duration: number
  faceVerification: {
    detected: boolean
    confidence: number
    continuousFrames: number
  }
  timestamps: number[]
  workoutType: 'squats' | 'pushups'
}

export class RealPoseAnalyzer {
  private pose: Pose | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      this.pose.onResults(() => {
        this.isInitialized = true
        resolve()
      })

      // Initialize with a blank image
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, 640, 480)
      
      this.pose.send({ image: canvas })
    })
  }

  async analyzeVideo(
    videoFile: File, 
    workoutType: 'squats' | 'pushups',
    referenceFaceData: string
  ): Promise<AnalysisResults> {
    if (!this.isInitialized || !this.pose) {
      throw new Error('Analyzer not initialized')
    }

    const video = document.createElement('video')
    video.src = URL.createObjectURL(videoFile)
    
    await new Promise((resolve) => {
      video.onloadedmetadata = resolve
    })

    const results = await this.processVideoFrames(video, workoutType, referenceFaceData)
    
    URL.revokeObjectURL(video.src)
    return results
  }

  private async processVideoFrames(
    video: HTMLVideoElement, 
    workoutType: 'squats' | 'pushups',
    referenceFaceData: string
  ): Promise<AnalysisResults> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const analyzer = workoutType === 'squats' 
      ? new SquatAnalyzer() 
      : new PushupAnalyzer()
    
    const faceDetector = new FaceDetector(referenceFaceData)
    await faceDetector.initialize()
    
    const frameRate = 10
    const totalFrames = Math.floor(video.duration * frameRate)
    const frameInterval = video.duration / totalFrames

    let currentTime = 0
    const allResults: any[] = []

    return new Promise((resolve) => {
      const processFrame = () => {
        video.currentTime = currentTime
        
        video.onseeked = async () => {
          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Detect poses
          const poseResults = await this.detectPoseInFrame(canvas)
          
          if (poseResults && poseResults.poseLandmarks) {
            // Analyze workout movement
            const movementData = analyzer.analyzeFrame(poseResults.poseLandmarks)
            
            // Detect face in frame
            const faceData = await faceDetector.detectFaceInFrame(canvas)
            
            allResults.push({
              timestamp: currentTime,
              movement: movementData,
              face: faceData
            })
          }

          currentTime += frameInterval

          if (currentTime < video.duration) {
            processFrame()
          } else {
            // Process all results
            const finalResults = this.compileFinalResults(allResults, workoutType, video.duration)
            resolve(finalResults)
          }
        }
      }

      processFrame()
    })
  }

  private detectPoseInFrame(canvas: HTMLCanvasElement): Promise<any> {
    return new Promise((resolve) => {
      if (!this.pose) {
        resolve(null)
        return
      }

      this.pose.onResults((results) => {
        resolve(results)
      })

      this.pose.send({ image: canvas })
    })
  }

  private compileFinalResults(allResults: any[], workoutType: string, duration: number): AnalysisResults {
    let totalReps = 0
    let depths: number[] = []
    let formScores: number[] = []
    let faceDetections = 0
    let faceConfidences: number[] = []

    allResults.forEach(result => {
      if (result.movement) {
        totalReps = Math.max(totalReps, result.movement.repCount)
        if (result.movement.depth > 0) {
          depths.push(result.movement.depth)
        }
        if (result.movement.formScore > 0) {
          formScores.push(result.movement.formScore)
        }
      }
      
      if (result.face && result.face.detected) {
        faceDetections++
        faceConfidences.push(result.face.confidence)
      }
    })

    const averageDepth = depths.length > 0 
      ? depths.reduce((a, b) => a + b, 0) / depths.length 
      : 0

    const formScore = formScores.length > 0
      ? formScores.reduce((a, b) => a + b, 0) / formScores.length
      : 0

    const faceConfidence = faceConfidences.length > 0
      ? faceConfidences.reduce((a, b) => a + b, 0) / faceConfidences.length
      : 0

    return {
      totalReps,
      averageDepth: Math.round(averageDepth),
      formScore: Math.round(formScore),
      duration: Math.round(duration),
      faceVerification: {
        detected: faceDetections > allResults.length * 0.3,
        confidence: Math.round(faceConfidence * 100),
        continuousFrames: faceDetections
      },
      timestamps: allResults.map(r => r.timestamp),
      workoutType: workoutType as 'squats' | 'pushups'
    }
  }
}
