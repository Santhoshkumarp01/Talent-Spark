export interface SitupMetrics {
  repCount: number
  depth: number
  formScore: number
  phase: 'up' | 'down' | 'transition'
}

export class SitupAnalyzer {
  private repCount = 0
  private isDown = false
  private lastTorsoAngle = 90
  private depths: number[] = []
  private formScores: number[] = []

  analyzeFrame(landmarks: any[]): SitupMetrics {
    if (!landmarks || landmarks.length < 33) {
      return {
        repCount: this.repCount,
        depth: 0,
        formScore: 0,
        phase: 'up'
      }
    }

    // Key landmarks for sit-ups
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const nose = landmarks[0]

    // Calculate torso angle (shoulder to hip line relative to vertical)
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    }

    // Calculate torso angle from horizontal (0 = lying down, 90 = sitting up)
    const torsoAngle = Math.abs(Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      shoulderMidpoint.x - hipMidpoint.x
    ) * 180 / Math.PI)

    // Normalize angle to 0-90 range for sit-up analysis
    const normalizedAngle = Math.min(90, Math.abs(torsoAngle - 90))

    // Calculate depth (higher angle = more sit-up completion)
    const depth = Math.max(0, Math.min(100, normalizedAngle / 45 * 100))

    // Determine sit-up phase
    const isCurrentlyDown = normalizedAngle < 20  // Lying down position
    const isCurrentlyUp = normalizedAngle > 40    // Sitting up position

    // Count reps - complete cycle from down to up
    if (!this.isDown && isCurrentlyDown) {
      this.isDown = true
    } else if (this.isDown && isCurrentlyUp) {
      this.repCount++
      this.isDown = false
    }

    // Calculate form score
    const formScore = this.calculateFormScore(landmarks, normalizedAngle)
    
    if (isCurrentlyUp) {
      this.depths.push(depth)
      this.formScores.push(formScore)
    }

    return {
      repCount: this.repCount,
      depth: Math.round(depth),
      formScore: Math.round(formScore),
      phase: isCurrentlyDown ? 'down' : isCurrentlyUp ? 'up' : 'transition'
    }
  }

  private calculateFormScore(landmarks: any[], torsoAngle: number): number {
    // Check knee position stability
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // Knees should be bent and stable
    const leftKneeAngle = this.calculateAngle(landmarks[23], leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(landmarks[24], rightKnee, rightAnkle)
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

    // Score components
    let kneeStabilityScore = Math.max(0, 100 - Math.abs(90 - avgKneeAngle)) // Knees should be around 90 degrees
    let torsoScore = torsoAngle > 30 ? 100 : Math.max(0, torsoAngle * 3.33) // Reward good sit-up range

    // Check head and neck alignment
    const nose = landmarks[0]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    }

    // Head should be in line with torso, not straining forward
    const headAlignment = Math.abs(nose.x - shoulderMidpoint.x)
    let headScore = Math.max(0, 100 - headAlignment * 500)

    return (kneeStabilityScore * 0.3 + torsoScore * 0.5 + headScore * 0.2)
  }

  private calculateAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) {
      angle = 360 - angle
    }
    return angle
  }

  reset() {
    this.repCount = 0
    this.isDown = false
    this.depths = []
    this.formScores = []
  }
}