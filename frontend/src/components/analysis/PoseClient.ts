// Extend the Window interface to include Pose from MediaPipe
declare global {
  interface Window {
    Pose: any
  }
}

// MediaPipe pose detection wrapper
export class PoseClient {
  private pose: any = null
  private isInitialized = false

  async initialize() {
    try {
      // Load MediaPipe scripts
      await this.loadMediaPipeScripts()
      
      // Initialize pose
      this.pose = new window.Pose({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })

      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize pose detection:', error)
      throw error
    }
  }

  private async loadMediaPipeScripts() {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
    ]

    for (const src of scripts) {
      await this.loadScript(src)
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async detectPose(imageElement: HTMLVideoElement | HTMLImageElement): Promise<any> {
    if (!this.isInitialized || !this.pose) {
      throw new Error('Pose client not initialized')
    }

    return new Promise((resolve) => {
      this.pose.onResults((results: any) => {
        resolve(results)
      })
      this.pose.send({ image: imageElement })
    })
  }

  destroy() {
    if (this.pose) {
      this.pose.close()
      this.pose = null
    }
    this.isInitialized = false
  }
}

export default PoseClient
