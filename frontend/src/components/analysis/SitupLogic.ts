interface PoseLandmark {
  x: number
  y: number
  z: number
}

interface SitupMetrics {
  repCount: number
  currentDepth: number
  averageDepth: number
  formScore: number
  lastRepTime: number
}

export class SitupAnalyzer {
  private repCount = 0
  private isSitupDown = false
  private depths: number[] = []
  private lastRepTime = 0
  private repTimes: number[] = []

  analyzeFrame(landmarks: PoseLandmark[]): SitupMetrics {
    if (!landmarks || landmarks.length < 33) {
      return this.getCurrentMetrics()
    }

    // Key landmarks for sit-up analysis
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const nose = landmarks[0]

    // Calculate torso angle (angle between shoulder-hip line and horizontal)
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    // Calculate torso elevation angle
    const torsoAngle = Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      Math.abs(shoulderMidpoint.x - hipMidpoint.x)
    ) * 180 / Math.PI

    // Normalize to 0-90 range (0 = lying flat, 90 = sitting upright)
    const normalizedAngle = Math.max(0, Math.min(90, Math.abs(torsoAngle)))

    // Calculate sit-up depth (higher angle = deeper sit-up)
    const depth = Math.max(0, normalizedAngle / 60 * 100) // 60 degrees = 100% depth
    
    // Detect sit-up phases
    const isCurrentlyDown = normalizedAngle < 15  // Lying down position
    const isCurrentlyUp = normalizedAngle > 35    // Sitting up position

    // Count reps - complete cycle from lying down to sitting up
    if (!this.isSitupDown && isCurrentlyDown) {
      // Going down (or starting position)
      this.isSitupDown = true
    } else if (this.isSitupDown && isCurrentlyUp) {
      // Coming up - count the rep
      this.repCount++
      this.isSitupDown = false
      
      const currentTime = Date.now()
      if (this.lastRepTime > 0) {
        this.repTimes.push(currentTime - this.lastRepTime)
      }
      this.lastRepTime = currentTime
    }

    // Track depths during the up phase
    if (isCurrentlyUp) {
      this.depths.push(depth)
    }

    return this.getCurrentMetrics()
  }

  private getCurrentMetrics(): SitupMetrics {
    const averageDepth = this.depths.length > 0 
      ? this.depths.reduce((a, b) => a + b, 0) / this.depths.length 
      : 0

    // Calculate form score based on consistency and depth
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
    if (this.depths.length < 2) return 100

    // Calculate consistency score
    const avgDepth = this.depths.reduce((a, b) => a + b, 0) / this.depths.length
    const variance = this.depths.reduce((acc, depth) => acc + Math.pow(depth - avgDepth, 2), 0) / this.depths.length
    const consistency = Math.max(0, 100 - Math.sqrt(variance) * 2)

    // Calculate depth score (prefer deeper sit-ups, but not over-extension)
    const optimalDepth = 80 // Target around 80% depth for good form
    const depthScore = Math.max(0, 100 - Math.abs(avgDepth - optimalDepth) * 2)

    // Calculate tempo consistency (sit-ups shouldn't be too fast)
    let tempoScore = 100
    if (this.repTimes.length > 2) {
      const avgRepTime = this.repTimes.reduce((a, b) => a + b, 0) / this.repTimes.length
      const tempoVariance = this.repTimes.reduce((acc, time) => acc + Math.pow(time - avgRepTime, 2), 0) / this.repTimes.length
      tempoScore = Math.max(0, 100 - Math.sqrt(tempoVariance) / 100)
    }

    return Math.round((consistency * 0.4 + depthScore * 0.4 + tempoScore * 0.2))
  }

  reset() {
    this.repCount = 0
    this.isSitupDown = false
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
      consistency: this.calculateConsistency(),
      optimalRange: this.calculateOptimalRange()
    }
  }

  private calculateConsistency(): number {
    if (this.depths.length < 3) return 100

    const avgDepth = this.depths.reduce((a, b) => a + b, 0) / this.depths.length
    const variance = this.depths.reduce((acc, depth) => acc + Math.pow(depth - avgDepth, 2), 0) / this.depths.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 3))
  }

  private calculateOptimalRange(): boolean {
    if (this.depths.length === 0) return true
    
    const avgDepth = this.depths.reduce((a, b) => a + b, 0) / this.depths.length
    return avgDepth >= 60 && avgDepth <= 90 // Optimal sit-up range
  }
}

export default SitupAnalyzer