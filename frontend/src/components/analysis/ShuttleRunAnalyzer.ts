export interface ShuttleRunMetrics {
  repCount: number
  distance: number
  formScore: number
  phase: 'left' | 'right' | 'center' | 'transition'
  speed: number
}

export class ShuttleRunAnalyzer {
  private repCount = 0
  private isMovingRight = false
  private isMovingLeft = false
  private lastPosition = 0
  private positions: number[] = []
  private formScores: number[] = []
  private lastTimestamp = 0
  private speeds: number[] = []

  analyzeFrame(landmarks: any[]): ShuttleRunMetrics {
    if (!landmarks || landmarks.length < 33) {
      return {
        repCount: this.repCount,
        distance: 0,
        formScore: 0,
        phase: 'center',
        speed: 0
      }
    }

    // Key landmarks for shuttle run analysis
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Calculate center position (torso midpoint)
    const torsoCenter = {
      x: (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4,
      y: (leftShoulder.y + rightShoulder.y + leftHip.y + rightHip.y) / 4
    }

    // Track horizontal movement
    const currentPosition = torsoCenter.x
    const movement = currentPosition - this.lastPosition
    const currentTimestamp = Date.now()

    // Calculate speed if we have a previous timestamp
    let speed = 0
    if (this.lastTimestamp > 0) {
      const timeDiff = (currentTimestamp - this.lastTimestamp) / 1000 // seconds
      speed = Math.abs(movement) / timeDiff
      this.speeds.push(speed)
    }

    // Determine movement direction and phase
    const isCurrentlyRight = currentPosition > 0.6 // Moving to right side
    const isCurrentlyLeft = currentPosition < 0.4  // Moving to left side
    const isCenter = currentPosition >= 0.4 && currentPosition <= 0.6

    // Count shuttle runs (full left-right or right-left cycles)
    if (!this.isMovingRight && isCurrentlyRight) {
      this.isMovingRight = true
      this.isMovingLeft = false
    } else if (!this.isMovingLeft && isCurrentlyLeft) {
      this.isMovingLeft = true
      if (this.isMovingRight) {
        this.repCount++ // Completed one full shuttle
        this.isMovingRight = false
      }
    } else if (this.isMovingLeft && isCurrentlyRight) {
      if (this.isMovingLeft) {
        this.repCount++ // Completed reverse shuttle
      }
      this.isMovingRight = true
      this.isMovingLeft = false
    }

    // Calculate distance covered
    const distance = Math.abs(currentPosition - this.lastPosition) * 100

    // Calculate form score
    const formScore = this.calculateFormScore(landmarks, speed)
    this.formScores.push(formScore)

    // Store position for next frame
    this.positions.push(currentPosition)
    this.lastPosition = currentPosition
    this.lastTimestamp = currentTimestamp

    // Determine current phase
    let phase: 'left' | 'right' | 'center' | 'transition' = 'center'
    if (isCurrentlyLeft) phase = 'left'
    else if (isCurrentlyRight) phase = 'right'
    else if (Math.abs(movement) > 0.02) phase = 'transition'

    return {
      repCount: this.repCount,
      distance: Math.round(distance * 100) / 100,
      formScore: Math.round(formScore),
      phase,
      speed: Math.round(speed * 1000) / 1000
    }
  }

  private calculateFormScore(landmarks: any[], speed: number): number {
    // Check body alignment during movement
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]

    // Calculate body alignment (shoulders should be level)
    const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y)
    const hipAlignment = Math.abs(leftHip.y - rightHip.y)
    
    // Score for maintaining level shoulders and hips
    const alignmentScore = Math.max(0, 100 - (shoulderAlignment + hipAlignment) * 500)

    // Check forward lean (good running posture)
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    // Calculate forward lean angle
    const leanAngle = Math.atan2(
      shoulderMidpoint.x - hipMidpoint.x,
      hipMidpoint.y - shoulderMidpoint.y
    ) * 180 / Math.PI

    // Optimal lean is slight forward (5-15 degrees)
    const leanScore = Math.max(0, 100 - Math.abs(Math.abs(leanAngle) - 10) * 5)

    // Speed consistency score (penalize erratic speed changes)
    let speedScore = 100
    if (this.speeds.length > 5) {
      const recentSpeeds = this.speeds.slice(-5)
      const avgSpeed = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
      const speedVariance = recentSpeeds.reduce((acc, s) => acc + Math.pow(s - avgSpeed, 2), 0) / recentSpeeds.length
      speedScore = Math.max(0, 100 - Math.sqrt(speedVariance) * 50)
    }

    // Knee lift score (higher knees during running)
    const avgKneeHeight = (leftKnee.y + rightKnee.y) / 2
    const avgHipHeight = (leftHip.y + rightHip.y) / 2
    const kneeLift = Math.max(0, avgHipHeight - avgKneeHeight)
    const kneeLiftScore = Math.min(100, kneeLift * 500)

    // Weighted combination
    return (alignmentScore * 0.3 + leanScore * 0.2 + speedScore * 0.3 + kneeLiftScore * 0.2)
  }

  reset() {
    this.repCount = 0
    this.isMovingRight = false
    this.isMovingLeft = false
    this.lastPosition = 0
    this.positions = []
    this.formScores = []
    this.lastTimestamp = 0
    this.speeds = []
  }

  getDetailedMetrics() {
    const avgFormScore = this.formScores.length > 0 
      ? this.formScores.reduce((a, b) => a + b, 0) / this.formScores.length 
      : 0

    const avgSpeed = this.speeds.length > 0
      ? this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length
      : 0

    const totalDistance = this.positions.length > 1
      ? this.positions.reduce((total, pos, i) => {
          if (i === 0) return 0
          return total + Math.abs(pos - this.positions[i - 1])
        }, 0) * 100
      : 0

    return {
      totalReps: this.repCount,
      averageSpeed: Math.round(avgSpeed * 1000) / 1000,
      formScore: Math.round(avgFormScore),
      totalDistance: Math.round(totalDistance * 100) / 100,
      maxSpeed: this.speeds.length > 0 ? Math.max(...this.speeds) : 0
    }
  }
}