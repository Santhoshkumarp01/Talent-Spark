import { Pose } from '@mediapipe/pose'
import { SquatAnalyzer } from './SquatAnalyzer'
import { PushupAnalyzer } from './PushupAnalyzer'
import { SitupAnalyzer } from './SitupAnalyzer'
import { VerticalJumpAnalyzer } from './VerticalJumpAnalyzer'
import { ShuttleRunAnalyzer } from './ShuttleRunAnalyzer'
import { EnduranceRunAnalyzer } from './EnduranceRunAnalyzer'
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
  maxHeight?: number
  averageHeight?: number
  hangTime?: number
  averageSpeed?: number
  totalDistance?: number
  averagePace?: number
  cadence?: number
  strideLength?: number
  formScore: number
  duration: number
  faceVerification: {
    detected: boolean
    confidence: number
    continuousFrames: number
  }
  timestamps: number[]
  workoutType: 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs'
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
    workoutType: 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs',
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
    workoutType: 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs',
    referenceFaceData: string
  ): Promise<AnalysisResults> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Select appropriate analyzer based on workout type
    let analyzer: SquatAnalyzer | PushupAnalyzer | SitupAnalyzer | VerticalJumpAnalyzer | ShuttleRunAnalyzer | EnduranceRunAnalyzer
    
    switch (workoutType) {
      case 'squats':
        analyzer = new SquatAnalyzer()
        break
      case 'pushups':
        analyzer = new PushupAnalyzer()
        break
      case 'situps':
        analyzer = new SitupAnalyzer()
        break
      case 'vertical-jumps':
        analyzer = new VerticalJumpAnalyzer()
        break
      case 'shuttle-run':
        analyzer = new ShuttleRunAnalyzer()
        break
      case 'endurance-runs':
        analyzer = new EnduranceRunAnalyzer()
        break
      default:
        throw new Error(`Unsupported workout type: ${workoutType}`)
    }
    
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
    let heights: number[] = []
    let speeds: number[] = []
    let distances: number[] = []
    let paces: number[] = []
    let cadences: number[] = []
    let strideLengths: number[] = []
    let formScores: number[] = []
    let faceDetections = 0
    let faceConfidences: number[] = []
    let hangTimes: number[] = []

    allResults.forEach(result => {
      if (result.movement) {
        totalReps = Math.max(totalReps, result.movement.repCount || result.movement.stepCount || 0)
        
        // Handle different movement metrics based on workout type
        if (workoutType === 'vertical-jumps') {
          if (result.movement.currentHeight > 0) {
            heights.push(result.movement.currentHeight)
          }
          if (result.movement.hangTime > 0) {
            hangTimes.push(result.movement.hangTime)
          }
        } else if (workoutType === 'shuttle-run') {
          if (result.movement.speed > 0) {
            speeds.push(result.movement.speed)
          }
          if (result.movement.distance > 0) {
            distances.push(result.movement.distance)
          }
        } else if (workoutType === 'endurance-runs') {
          if (result.movement.pace > 0) {
            paces.push(result.movement.pace)
          }
          if (result.movement.cadence > 0) {
            cadences.push(result.movement.cadence)
          }
          if (result.movement.stride > 0) {
            strideLengths.push(result.movement.stride / 100) // Convert back from percentage
          }
        } else {
          // For squats, pushups, situps
          if (result.movement.depth > 0) {
            depths.push(result.movement.depth)
          }
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

    const maxHeight = heights.length > 0 ? Math.max(...heights) : undefined
    const averageHeight = heights.length > 0 
      ? heights.reduce((a, b) => a + b, 0) / heights.length 
      : undefined

    const averageHangTime = hangTimes.length > 0 
      ? hangTimes.reduce((a, b) => a + b, 0) / hangTimes.length 
      : undefined

    const averageSpeed = speeds.length > 0 
      ? speeds.reduce((a, b) => a + b, 0) / speeds.length 
      : undefined

    const totalDistance = distances.length > 0 
      ? distances.reduce((a, b) => a + b, 0) 
      : undefined

    const averagePace = paces.length > 0 
      ? paces.reduce((a, b) => a + b, 0) / paces.length 
      : undefined

    const averageCadence = cadences.length > 0 
      ? cadences.reduce((a, b) => a + b, 0) / cadences.length 
      : undefined

    const averageStrideLength = strideLengths.length > 0 
      ? strideLengths.reduce((a, b) => a + b, 0) / strideLengths.length 
      : undefined

    const formScore = formScores.length > 0
      ? formScores.reduce((a, b) => a + b, 0) / formScores.length
      : 0

    const faceConfidence = faceConfidences.length > 0
      ? faceConfidences.reduce((a, b) => a + b, 0) / faceConfidences.length
      : 0

    const baseResults = {
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
      workoutType: workoutType as 'squats' | 'pushups' | 'situps' | 'vertical-jumps' | 'shuttle-run' | 'endurance-runs'
    }

    // Add workout-specific metrics
    if (workoutType === 'vertical-jumps') {
      return {
        ...baseResults,
        maxHeight: maxHeight ? Math.round(maxHeight) : 0,
        averageHeight: averageHeight ? Math.round(averageHeight) : 0,
        hangTime: averageHangTime ? Math.round(averageHangTime * 100) / 100 : 0
      }
    } else if (workoutType === 'shuttle-run') {
      return {
        ...baseResults,
        averageSpeed: averageSpeed ? Math.round(averageSpeed * 1000) / 1000 : 0,
        totalDistance: totalDistance ? Math.round(totalDistance * 100) / 100 : 0
      }
    } else if (workoutType === 'endurance-runs') {
      return {
        ...baseResults,
        averagePace: averagePace ? Math.round(averagePace) : 0,
        cadence: averageCadence ? Math.round(averageCadence) : 0,
        strideLength: averageStrideLength ? Math.round(averageStrideLength * 1000) / 1000 : 0,
        totalDistance: totalReps && averageStrideLength ? Math.round((totalReps * averageStrideLength * 2) * 100) / 100 : 0
      }
    }

    return baseResults
  }
}