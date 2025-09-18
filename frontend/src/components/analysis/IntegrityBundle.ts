interface DeviceInfo {
  userAgent: string
  platform: string
  timestamp: number
  timezone: string
  screenResolution: string
}

interface FaceSnapshot {
  timestamp: number
  imageData: string
  confidence: number
}

interface VideoMetrics {
  duration: number
  fps: number
  resolution: string
  fileSize: number
}

interface AssessmentData {
  totalReps: number
  averageDepth: number
  formScore: number
  averageRepTime: number
  consistency: number
  timestamps: number[]
}

interface IntegrityData {
  sessionId: string
  profileData: any
  deviceInfo: DeviceInfo
  faceSnapshots: FaceSnapshot[]
  videoMetrics: VideoMetrics
  assessmentData: AssessmentData
  contentHash: string
  version: string
}

export class IntegrityBundleManager {
  private sessionId: string
  private faceSnapshots: FaceSnapshot[] = []
  private startTime: number = 0

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  startSession(profileData: any) {
    this.startTime = Date.now()
    this.faceSnapshots = []
    
    // Capture initial face snapshot
    this.addFaceSnapshot('', 1.0) // Will be populated by FaceGate component
  }

  addFaceSnapshot(imageData: string, confidence: number = 1.0) {
    this.faceSnapshots.push({
      timestamp: Date.now(),
      imageData,
      confidence
    })
  }

  async createBundle(
    videoBlob: Blob, 
    assessmentData: AssessmentData, 
    profileData: any
  ): Promise<IntegrityData> {
    const videoMetrics = await this.analyzeVideo(videoBlob)
    const deviceInfo = this.getDeviceInfo()
    
    // Create the bundle
    const bundle: IntegrityData = {
      sessionId: this.sessionId,
      profileData,
      deviceInfo,
      faceSnapshots: this.faceSnapshots,
      videoMetrics,
      assessmentData,
      contentHash: await this.generateContentHash(videoBlob, assessmentData),
      version: '1.0.0'
    }

    return bundle
  }

  private generateSessionId(): string {
    return `ts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`
    }
  }

  private async analyzeVideo(videoBlob: Blob): Promise<VideoMetrics> {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(videoBlob)
      
      video.onloadedmetadata = () => {
        const metrics: VideoMetrics = {
          duration: Math.round(video.duration),
          fps: 30, // Estimated
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          fileSize: videoBlob.size
        }
        
        URL.revokeObjectURL(url)
        resolve(metrics)
      }
      
      video.src = url
    })
  }

  private async generateContentHash(videoBlob: Blob, assessmentData: AssessmentData): Promise<string> {
    const combinedData = JSON.stringify({
      videoSize: videoBlob.size,
      assessmentData,
      sessionId: this.sessionId,
      timestamp: this.startTime
    })

    const encoder = new TextEncoder()
    const data = encoder.encode(combinedData)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  verifyIntegrity(bundle: IntegrityData): boolean {
    // Basic integrity checks
    const hasSessionId = !!bundle.sessionId
    const hasValidTimestamps = bundle.faceSnapshots.every(snap => snap.timestamp > 0)
    const hasContentHash = !!bundle.contentHash
    const hasMinFaceSnapshots = bundle.faceSnapshots.length >= 2
    
    return hasSessionId && hasValidTimestamps && hasContentHash && hasMinFaceSnapshots
  }

  getSessionId(): string {
    return this.sessionId
  }

  reset() {
    this.sessionId = this.generateSessionId()
    this.faceSnapshots = []
    this.startTime = 0
  }
}

export default IntegrityBundleManager
