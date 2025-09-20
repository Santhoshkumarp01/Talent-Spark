interface PoseLandmark {
  x: number
  y: number
  z: number
}

interface EnduranceRunMetrics {
  stepCount: number
  currentPace: number
  averagePace: number
  strideLength: number
  formScore: number
  lastStepTime: number
  cadence: number
}

export class EnduranceRunAnalyzer {
  private stepCount = 0
  private isLeftFootUp = false
  private isRightFootUp = false
  private lastStepTime = 0
  private stepTimes: number[] = []
  private strideLengths: number[] = []
  private formScores: number[] = []
  private lastLeftFootY = 0
  private lastRightFootY = 0

  analyzeFrame(landmarks: PoseLandmark[]): EnduranceRunMetrics {
    if (!landmarks || landmarks.length < 33) {
      return this.getCurrentMetrics()
    }

    // Key landmarks for endurance running analysis
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Detect foot lifting (running motion)
    const leftFootHeight = leftAnkle.y
    const rightFootHeight = rightAnkle.y
    const hipLevel = (leftHip.y + rightHip.y) / 2

    // Calculate relative foot heights to hip level
    const leftFootRelativeHeight = hipLevel - leftFootHeight
    const rightFootRelativeHeight = hipLevel - rightFootHeight

    // Detect left foot step
    if (!this.isLeftFootUp && leftFootRelativeHeight > 0.1) {
      this.isLeftFootUp = true
    } else if (this.isLeftFootUp && leftFootRelativeHeight < 0.05) {
      this.stepCount++
      this.isLeftFootUp = false
      this.recordStepTime()
    }

    // Detect right foot step
    if (!this.isRightFootUp && rightFootRelativeHeight > 0.1) {
      this.isRightFootUp = true
    } else if (this.isRightFootUp && rightFootRelativeHeight < 0.05) {
      this.stepCount++
      this.isRightFootUp = false
      this.recordStepTime()
    }

    // Calculate stride length
    const currentStrideLength = Math.abs(leftAnkle.x - rightAnkle.x)
    this.strideLengths.push(currentStrideLength)

    // Calculate form score
    const currentFormScore = this.calculateRunningForm(landmarks)
    this.formScores.push(currentFormScore)

    // Update last foot positions
    this.lastLeftFootY = leftFootHeight
    this.lastRightFootY = rightFootHeight

    return this.getCurrentMetrics()
  }

  private recordStepTime(): void {
    const currentTime = Date.now()
    if (this.lastStepTime > 0) {
      this.stepTimes.push(currentTime - this.lastStepTime)
    }
    this.lastStepTime = currentTime
  }

  private calculateRunningForm(landmarks: PoseLandmark[]): number {
    // Key form elements for running
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    let totalScore = 0
    let scoreComponents = 0

    // 1. Posture Score (shoulder-hip alignment)
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    const postureAngle = Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      shoulderMidpoint.x - hipMidpoint.x
    ) * 180 / Math.PI

    // Good running posture: slight forward lean (80-95 degrees)
    const postureScore = Math.max(0, 100 - Math.abs(87.5 - Math.abs(postureAngle)) * 2)
    totalScore += postureScore
    scoreComponents++

    // 2. Knee Drive Score
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const maxKneeAngle = Math.max(leftKneeAngle, rightKneeAngle)

    // Good knee drive: 120-150 degrees
    const kneeScore = maxKneeAngle >= 120 && maxKneeAngle <= 150 ? 100 :
                    Math.max(0, 100 - Math.abs(135 - maxKneeAngle))
    totalScore += kneeScore
    scoreComponents++

    // 3. Stride Length Score
    const strideLength = Math.abs(leftAnkle.x - rightAnkle.x)
    // Optimal stride: not too long, not too short (0.15-0.35 normalized units)
    const strideScore = strideLength >= 0.15 && strideLength <= 0.35 ? 100 :
                       Math.max(0, 100 - Math.abs(0.25 - strideLength) * 200)
    totalScore += strideScore
    scoreComponents++

    // 4. Foot Strike Pattern
    const leftFootAngle = Math.atan2(leftAnkle.y - leftKnee.y, leftAnkle.x - leftKnee.x) * 180 / Math.PI
    const rightFootAngle = Math.atan2(rightAnkle.y - rightKnee.y, rightAnkle.x - rightKnee.x) * 180 / Math.PI

    // Good foot strike: close to perpendicular to ground
    const footStrikeScore = Math.max(0, 100 - Math.abs(90 - Math.abs((leftFootAngle + rightFootAngle) / 2)))
    totalScore += footStrikeScore
    scoreComponents++

    return scoreComponents > 0 ? totalScore / scoreComponents : 0
  }

  private calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    
    if (angle > 180.0) {
      angle = 360 - angle
    }
    
    return angle
  }

  private getCurrentMetrics(): EnduranceRunMetrics {
    const averagePace = this.stepTimes.length > 0 
      ? 60000 / (this.stepTimes.reduce((a, b) => a + b, 0) / this.stepTimes.length) // Steps per minute
      : 0

    const currentPace = this.stepTimes.length > 0 
      ? 60000 / this.stepTimes[this.stepTimes.length - 1] // Latest pace
      : 0

    const averageStrideLength = this.strideLengths.length > 0
      ? this.strideLengths.reduce((a, b) => a + b, 0) / this.strideLengths.length
      : 0

    const formScore = this.formScores.length > 0
      ? this.formScores.reduce((a, b) => a + b, 0) / this.formScores.length
      : 100

    const cadence = averagePace // Steps per minute = cadence

    return {
      stepCount: this.stepCount,
      currentPace: Math.round(currentPace),
      averagePace: Math.round(averagePace),
      strideLength: Math.round(averageStrideLength * 1000) / 1000, // Round to 3 decimal places
      formScore: Math.round(formScore),
      lastStepTime: this.lastStepTime,
      cadence: Math.round(cadence)
    }
  }

  reset(): void {
    this.stepCount = 0
    this.isLeftFootUp = false
    this.isRightFootUp = false
    this.lastStepTime = 0
    this.stepTimes = []
    this.strideLengths = []
    this.formScores = []
    this.lastLeftFootY = 0
    this.lastRightFootY = 0
  }

  getDetailedMetrics() {
    const metrics = this.getCurrentMetrics()
    
    return {
      totalSteps: this.stepCount,
      averagePace: metrics.averagePace,
      averageStrideLength: metrics.strideLength,
      formScore: metrics.formScore,
      cadence: metrics.cadence,
      consistency: this.calculateConsistency(),
      totalDistance: this.calculateTotalDistance()
    }
  }

  private calculateConsistency(): number {
    if (this.stepTimes.length < 3) return 100

    const avgStepTime = this.stepTimes.reduce((a, b) => a + b, 0) / this.stepTimes.length
    const variance = this.stepTimes.reduce((acc, time) => acc + Math.pow(time - avgStepTime, 2), 0) / this.stepTimes.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) / 10))
  }

  private calculateTotalDistance(): number {
    // Estimate total distance based on step count and average stride length
    const avgStrideLength = this.strideLengths.length > 0
      ? this.strideLengths.reduce((a, b) => a + b, 0) / this.strideLengths.length
      : 0.5 // Default stride length in meters

    // Convert normalized stride length to approximate meters (rough estimation)
    const strideInMeters = avgStrideLength * 2 // Rough conversion factor
    
    return Math.round((this.stepCount * strideInMeters) * 100) / 100 // Round to 2 decimal places
  }
}

export default EnduranceRunAnalyzer