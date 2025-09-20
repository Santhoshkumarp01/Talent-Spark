export interface VerticalJumpMetrics {
  repCount: number
  maxHeight: number
  averageHeight: number
  formScore: number
  phase: 'ground' | 'takeoff' | 'airtime' | 'landing'
  hangTime: number
}

export class VerticalJumpAnalyzer {
  private repCount = 0
  private isInAir = false
  private jumpStartTime = 0
  private heights: number[] = []
  private hangTimes: number[] = []
  private formScores: number[] = []
  private baselineY = 0
  private calibrated = false

  analyzeFrame(landmarks: any[]): VerticalJumpMetrics {
    if (!landmarks || landmarks.length < 33) {
      return {
        repCount: this.repCount,
        maxHeight: 0,
        averageHeight: 0,
        formScore: 0,
        phase: 'ground',
        hangTime: 0
      }
    }

    // Key landmarks for vertical jump analysis
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Calculate center of mass position (hip midpoint)
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    // Calibrate baseline if needed
    if (!this.calibrated) {
      this.baselineY = hipMidpoint.y
      this.calibrated = true
    }

    // Calculate jump height (lower y values = higher position in screen coordinates)
    const currentHeight = Math.max(0, (this.baselineY - hipMidpoint.y) * 100)

    // Calculate knee angles to detect takeoff preparation
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

    // Detect jump phases
    const isPreparingJump = avgKneeAngle < 140 && currentHeight < 5 // Squatting down
    const isCurrentlyInAir = currentHeight > 10 // Significant height
    const isLanding = !isCurrentlyInAir && this.isInAir

    let phase: 'ground' | 'takeoff' | 'airtime' | 'landing' = 'ground'

    if (isPreparingJump) {
      phase = 'takeoff'
    } else if (isCurrentlyInAir) {
      phase = 'airtime'
    } else if (isLanding) {
      phase = 'landing'
    }

    // Count jumps and track metrics
    const currentTime = Date.now()

    if (!this.isInAir && isCurrentlyInAir) {
      // Starting a jump
      this.isInAir = true
      this.jumpStartTime = currentTime
    } else if (this.isInAir && !isCurrentlyInAir) {
      // Landing from a jump
      this.repCount++
      this.isInAir = false
      
      const hangTime = (currentTime - this.jumpStartTime) / 1000
      this.hangTimes.push(hangTime)
    }

    // Track heights during airtime
    if (isCurrentlyInAir) {
      this.heights.push(currentHeight)
    }

    // Calculate form score
    const formScore = this.calculateFormScore(landmarks, avgKneeAngle, phase)
    if (formScore > 0) {
      this.formScores.push(formScore)
    }

    return {
      repCount: this.repCount,
      maxHeight: this.heights.length > 0 ? Math.max(...this.heights) : 0,
      averageHeight: this.heights.length > 0 
        ? this.heights.reduce((a, b) => a + b, 0) / this.heights.length 
        : 0,
      formScore: Math.round(formScore),
      phase,
      hangTime: this.hangTimes.length > 0 
        ? this.hangTimes[this.hangTimes.length - 1] 
        : 0
    }
  }

  private calculateAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) {
      angle = 360 - angle
    }
    return angle
  }

  private calculateFormScore(landmarks: any[], kneeAngle: number, phase: string): number {
    // Form scoring based on different phases
    let score = 100

    // Check body alignment
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }
    const ankleMidpoint = {
      x: (leftAnkle.x + rightAnkle.x) / 2,
      y: (leftAnkle.y + rightAnkle.y) / 2
    }

    // Body alignment score (should be relatively straight vertical line)
    const bodyAlignment = Math.abs(shoulderMidpoint.x - ankleMidpoint.x)
    const alignmentScore = Math.max(0, 100 - bodyAlignment * 500)

    // Takeoff preparation score
    let takeoffScore = 100
    if (phase === 'takeoff') {
      // Good takeoff should have knees bent between 90-140 degrees
      takeoffScore = kneeAngle < 90 ? 60 : kneeAngle > 140 ? 70 : 100
    }

    // Landing preparation score
    let landingScore = 100
    if (phase === 'landing') {
      // Good landing should have slightly bent knees (not completely straight)
      landingScore = kneeAngle > 170 ? 60 : kneeAngle < 90 ? 70 : 100
    }

    // Arm positioning score (arms should swing up during takeoff)
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]
    const armHeight = ((leftWrist.y + rightWrist.y) / 2) - shoulderMidpoint.y
    let armScore = 100
    
    if (phase === 'takeoff' || phase === 'airtime') {
      // Arms should be raised during jump
      armScore = armHeight < -0.1 ? 100 : 70 // Negative y means arms are up
    }

    // Combine scores with weights
    return (alignmentScore * 0.4 + takeoffScore * 0.3 + landingScore * 0.2 + armScore * 0.1)
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
      averageHangTime: this.hangTimes.length > 0 
        ? Math.round((this.hangTimes.reduce((a, b) => a + b, 0) / this.hangTimes.length) * 100) / 100 
        : 0,
      formScore: this.formScores.length > 0 
        ? Math.round(this.formScores.reduce((a, b) => a + b, 0) / this.formScores.length) 
        : 0,
      consistency: this.calculateConsistency()
    }
  }

  private calculateConsistency(): number {
    if (this.heights.length < 3) return 100

    const avgHeight = this.heights.reduce((a, b) => a + b, 0) / this.heights.length
    const variance = this.heights.reduce((acc, height) => acc + Math.pow(height - avgHeight, 2), 0) / this.heights.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 2))
  }

  reset() {
    this.repCount = 0
    this.isInAir = false
    this.jumpStartTime = 0
    this.heights = []
    this.hangTimes = []
    this.formScores = []
    this.baselineY = 0
    this.calibrated = false
  }
}