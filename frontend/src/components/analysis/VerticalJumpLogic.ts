interface PoseLandmark {
  x: number
  y: number
  z: number
}

interface VerticalJumpMetrics {
  repCount: number
  currentHeight: number
  maxHeight: number
  averageHeight: number
  formScore: number
  lastJumpTime: number
  hangTime: number
}

export class VerticalJumpAnalyzer {
  private repCount = 0
  private isInAir = false
  private jumpStartTime = 0
  private landingTime = 0
  private heights: number[] = []
  private hangTimes: number[] = []
  private lastJumpTime = 0
  private baselineHipY = 0
  private calibrated = false
  private frameCount = 0

  analyzeFrame(landmarks: PoseLandmark[]): VerticalJumpMetrics {
    if (!landmarks || landmarks.length < 33) {
      return this.getCurrentMetrics()
    }

    this.frameCount++

    // Key landmarks for vertical jump analysis
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Calculate hip center position (primary indicator for vertical movement)
    const hipCenterY = (leftHip.y + rightHip.y) / 2

    // Calibrate baseline during first few frames
    if (!this.calibrated && this.frameCount < 30) {
      if (this.frameCount === 1) {
        this.baselineHipY = hipCenterY
      } else {
        // Update baseline with moving average for stability
        this.baselineHipY = (this.baselineHipY * 0.9) + (hipCenterY * 0.1)
      }
      
      if (this.frameCount === 29) {
        this.calibrated = true
      }
    }

    if (!this.calibrated) {
      return this.getCurrentMetrics()
    }

    // Calculate current height (inverted because screen Y increases downward)
    const currentHeight = Math.max(0, (this.baselineHipY - hipCenterY) * 200) // Scale factor for sensitivity

    // Calculate knee angles for jump phase detection
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const averageKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

    // Detect jump phases
    const heightThreshold = 8 // Minimum height to consider "in air"
    const isCurrentlyInAir = currentHeight > heightThreshold
    const isPreparingJump = averageKneeAngle < 130 && currentHeight < 3 // Squatting for takeoff

    // State transitions and rep counting
    const currentTime = Date.now()

    if (!this.isInAir && isCurrentlyInAir) {
      // Takeoff detected
      this.isInAir = true
      this.jumpStartTime = currentTime
    } else if (this.isInAir && !isCurrentlyInAir) {
      // Landing detected
      this.repCount++
      this.isInAir = false
      this.landingTime = currentTime
      
      // Calculate hang time
      const hangTime = (this.landingTime - this.jumpStartTime) / 1000
      this.hangTimes.push(hangTime)
      
      // Update last jump time
      if (this.lastJumpTime > 0) {
        this.lastJumpTime = currentTime - this.lastJumpTime
      }
      this.lastJumpTime = currentTime
    }

    // Track height data during jumps
    if (isCurrentlyInAir) {
      this.heights.push(currentHeight)
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

  private getCurrentMetrics(): VerticalJumpMetrics {
    const maxHeight = this.heights.length > 0 
      ? Math.max(...this.heights) 
      : 0

    const averageHeight = this.heights.length > 0 
      ? this.heights.reduce((a, b) => a + b, 0) / this.heights.length 
      : 0

    const currentHeight = this.heights.length > 0 
      ? this.heights[this.heights.length - 1] 
      : 0

    // Simple form score based on consistency and technique
    const formScore = this.calculateFormScore()

    const averageHangTime = this.hangTimes.length > 0
      ? this.hangTimes.reduce((a, b) => a + b, 0) / this.hangTimes.length
      : 0

    return {
      repCount: this.repCount,
      currentHeight: Math.round(currentHeight),
      maxHeight: Math.round(maxHeight),
      averageHeight: Math.round(averageHeight),
      formScore,
      lastJumpTime: this.lastJumpTime,
      hangTime: Math.round(averageHangTime * 100) / 100
    }
  }

  private calculateFormScore(): number {
    if (this.heights.length < 3) return 100

    // Calculate consistency score
    const avgHeight = this.heights.reduce((a, b) => a + b, 0) / this.heights.length
    const variance = this.heights.reduce((acc, height) => acc + Math.pow(height - avgHeight, 2), 0) / this.heights.length
    const consistency = Math.max(0, 100 - Math.sqrt(variance) * 2)

    // Calculate height score (reward higher jumps)
    const heightScore = Math.min(100, avgHeight * 2)

    // Calculate hang time consistency
    let hangTimeConsistency = 100
    if (this.hangTimes.length > 1) {
      const avgHangTime = this.hangTimes.reduce((a, b) => a + b, 0) / this.hangTimes.length
      const hangTimeVariance = this.hangTimes.reduce((acc, time) => acc + Math.pow(time - avgHangTime, 2), 0) / this.hangTimes.length
      hangTimeConsistency = Math.max(0, 100 - Math.sqrt(hangTimeVariance) * 50)
    }

    return Math.round((consistency * 0.4 + heightScore * 0.4 + hangTimeConsistency * 0.2))
  }

  reset() {
    this.repCount = 0
    this.isInAir = false
    this.jumpStartTime = 0
    this.landingTime = 0
    this.heights = []
    this.hangTimes = []
    this.lastJumpTime = 0
    this.baselineHipY = 0
    this.calibrated = false
    this.frameCount = 0
  }

  getDetailedMetrics() {
    return {
      totalJumps: this.repCount,
      maxHeight: this.heights.length > 0 
        ? Math.round(Math.max(...this.heights)) 
        : 0,
      averageHeight: this.heights.length > 0 
        ? Math.round(this.heights.reduce((a, b) => a + b, 0) / this.heights.length) 
        : 0,
      formScore: this.calculateFormScore(),
      averageHangTime: this.hangTimes.length > 0 
        ? Math.round((this.hangTimes.reduce((a, b) => a + b, 0) / this.hangTimes.length) * 100) / 100
        : 0,
      consistency: this.calculateConsistency(),
      jumpFrequency: this.repCount > 1 && this.lastJumpTime > 0 
        ? Math.round(60000 / (this.lastJumpTime / this.repCount)) // Jumps per minute
        : 0
    }
  }

  private calculateConsistency(): number {
    if (this.heights.length < 3) return 100

    const avgHeight = this.heights.reduce((a, b) => a + b, 0) / this.heights.length
    const variance = this.heights.reduce((acc, height) => acc + Math.pow(height - avgHeight, 2), 0) / this.heights.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 3))
  }
}

export default VerticalJumpAnalyzer