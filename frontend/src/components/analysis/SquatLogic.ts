interface PoseLandmark {
  x: number
  y: number
  z: number
}

interface SquatMetrics {
  repCount: number
  currentDepth: number
  averageDepth: number
  formScore: number
  lastRepTime: number
}

export class SquatAnalyzer {
  private repCount = 0
  private isSquatDown = false
  private depths: number[] = []
  private lastRepTime = 0
  private repTimes: number[] = []

  analyzeFrame(landmarks: PoseLandmark[]): SquatMetrics {
    if (!landmarks || landmarks.length < 33) {
      return this.getCurrentMetrics()
    }

    // Key landmarks for squat analysis
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Calculate hip and knee angles
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const averageKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

    // Calculate squat depth (lower angle = deeper squat)
    const depth = Math.max(0, (180 - averageKneeAngle) / 90 * 100)
    
    // Detect squat phases
    const isCurrentlyDown = averageKneeAngle < 120 // Squat position
    const isCurrentlyUp = averageKneeAngle > 160   // Standing position

    // Count reps
    if (!this.isSquatDown && isCurrentlyDown) {
      // Going down
      this.isSquatDown = true
    } else if (this.isSquatDown && isCurrentlyUp) {
      // Coming up - count the rep
      this.repCount++
      this.isSquatDown = false
      
      const currentTime = Date.now()
      if (this.lastRepTime > 0) {
        this.repTimes.push(currentTime - this.lastRepTime)
      }
      this.lastRepTime = currentTime
    }

    // Track depths
    if (isCurrentlyDown) {
      this.depths.push(depth)
    }

    return this.getCurrentMetrics()
  }

  private calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    
    if (angle > 180.0) {
      angle = 360 - angle
    }
    
    return angle
  }

  private getCurrentMetrics(): SquatMetrics {
    const averageDepth = this.depths.length > 0 
      ? this.depths.reduce((a, b) => a + b, 0) / this.depths.length 
      : 0

    // Simple form score based on depth consistency
    const formScore = this.calculateFormScore()

    return {
      repCount: this.repCount,
      currentDepth: this.depths.length > 0 ? this.depths[this.depths.length - 1] : 0,
      averageDepth,
      formScore,
      lastRepTime: this.lastRepTime
    }
  }

  private calculateFormScore(): number {
    if (this.depths.length < 3) return 100

    // Calculate consistency score
    const avgDepth = this.depths.reduce((a, b) => a + b, 0) / this.depths.length
    const variance = this.depths.reduce((acc, depth) => acc + Math.pow(depth - avgDepth, 2), 0) / this.depths.length
    const consistency = Math.max(0, 100 - Math.sqrt(variance))

    // Calculate depth score (prefer deeper squats)
    const depthScore = Math.min(100, avgDepth)

    return Math.round((consistency * 0.4 + depthScore * 0.6))
  }

  reset() {
    this.repCount = 0
    this.isSquatDown = false
    this.depths = []
    this.lastRepTime = 0
    this.repTimes = []
  }

  getDetailedMetrics() {
    return {
      totalReps: this.repCount,
      averageDepth: this.depths.length > 0 
        ? Math.round(this.depths.reduce((a, b) => a + b, 0) / this.depths.length) 
        : 0,
      formScore: this.calculateFormScore(),
      averageRepTime: this.repTimes.length > 0 
        ? Math.round(this.repTimes.reduce((a, b) => a + b, 0) / this.repTimes.length / 1000) 
        : 0,
      consistency: this.calculateConsistency()
    }
  }

  private calculateConsistency(): number {
    if (this.depths.length < 3) return 100

    const avgDepth = this.depths.reduce((a, b) => a + b, 0) / this.depths.length
    const variance = this.depths.reduce((acc, depth) => acc + Math.pow(depth - avgDepth, 2), 0) / this.depths.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 2))
  }
}

export default SquatAnalyzer
