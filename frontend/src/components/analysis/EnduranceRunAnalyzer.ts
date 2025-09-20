export interface EnduranceRunMetrics {
  repCount: number
  stride: number
  formScore: number
  pace: number
  phase: 'up' | 'down' | 'transition'
}

export class EnduranceRunAnalyzer {
  private repCount = 0
  private isUp = false
  private lastHipHeight = 0
  private strides: number[] = []
  private formScores: number[] = []
  private lastRepTime = 0
  private paces: number[] = []

  analyzeFrame(landmarks: any[]): EnduranceRunMetrics {
    if (!landmarks || landmarks.length < 33) {
      return {
        repCount: this.repCount,
        stride: 0,
        formScore: 0,
        pace: 0,
        phase: 'up'
      }
    }

    // Key landmarks for endurance running
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Calculate hip height (average of left and right hips)
    const hipHeight = (leftHip.y + rightHip.y) / 2

    // Calculate knee lift angles
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const maxKneeAngle = Math.max(leftKneeAngle, rightKneeAngle)

    // Calculate stride length based on foot positioning
    const strideLength = Math.abs(leftAnkle.x - rightAnkle.x)

    // Determine running phase based on hip height and knee lift
    const isCurrentlyUp = hipHeight < this.lastHipHeight - 0.02 && maxKneeAngle > 140 // High knee lift
    const isCurrentlyDown = hipHeight > this.lastHipHeight + 0.01 // Lower hip position

    // Count steps/strides
    if (!this.isUp && isCurrentlyUp) {
      this.isUp = true
      const currentTime = Date.now()
      if (this.lastRepTime > 0) {
        const timeDiff = (currentTime - this.lastRepTime) / 1000 // Convert to seconds
        const pace = timeDiff > 0 ? 60 / timeDiff : 0 // Steps per minute
        this.paces.push(pace)
      }
      this.lastRepTime = currentTime
    } else if (this.isUp && isCurrentlyDown) {
      this.repCount++
      this.isUp = false
    }

    // Calculate form score
    const formScore = this.calculateFormScore(landmarks, maxKneeAngle, strideLength)
    
    if (isCurrentlyUp) {
      this.strides.push(strideLength)
      this.formScores.push(formScore)
    }

    this.lastHipHeight = hipHeight

    return {
      repCount: this.repCount,
      stride: Math.round(strideLength * 100),
      formScore: Math.round(formScore),
      pace: this.paces.length > 0 ? Math.round(this.paces[this.paces.length - 1]) : 0,
      phase: isCurrentlyUp ? 'up' : isCurrentlyDown ? 'down' : 'transition'
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

  private calculateFormScore(landmarks: any[], kneeAngle: number, strideLength: number): number {
    // Check posture - shoulders should be relatively aligned over hips
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]

    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    // Calculate posture score (good running posture = slight forward lean)
    const postureAngle = Math.abs(Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      shoulderMidpoint.x - hipMidpoint.x
    ) * 180 / Math.PI)

    // Good running form scores
    let postureScore = Math.max(0, 100 - Math.abs(85 - postureAngle) * 2) // Slight forward lean
    let kneeScore = kneeAngle > 120 ? 100 : Math.max(0, kneeAngle - 90) // Good knee lift
    let strideScore = strideLength > 0.1 && strideLength < 0.4 ? 100 : Math.max(0, 100 - Math.abs(0.25 - strideLength) * 200)

    // Check arm positioning
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]

    const leftArmAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist)
    const rightArmAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist)
    const avgArmAngle = (leftArmAngle + rightArmAngle) / 2

    let armScore = Math.max(0, 100 - Math.abs(90 - avgArmAngle)) // Arms should be around 90 degrees

    return (postureScore * 0.3 + kneeScore * 0.3 + strideScore * 0.2 + armScore * 0.2)
  }

  reset() {
    this.repCount = 0
    this.isUp = false
    this.strides = []
    this.formScores = []
    this.lastRepTime = 0
    this.paces = []
  }

  getDetailedMetrics() {
    const averageStride = this.strides.length > 0 
      ? Math.round(this.strides.reduce((a, b) => a + b, 0) / this.strides.length * 100) 
      : 0

    const averagePace = this.paces.length > 0 
      ? Math.round(this.paces.reduce((a, b) => a + b, 0) / this.paces.length) 
      : 0

    const formScore = this.formScores.length > 0
      ? Math.round(this.formScores.reduce((a, b) => a + b, 0) / this.formScores.length)
      : 0

    return {
      totalSteps: this.repCount,
      averageStride,
      formScore,
      averagePace,
      consistency: this.calculateConsistency()
    }
  }

  private calculateConsistency(): number {
    if (this.strides.length < 3) return 100

    const avgStride = this.strides.reduce((a, b) => a + b, 0) / this.strides.length
    const variance = this.strides.reduce((acc, stride) => acc + Math.pow(stride - avgStride, 2), 0) / this.strides.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 100))
  }
}