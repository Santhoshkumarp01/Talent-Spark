export interface SquatMetrics {
  repCount: number
  depth: number
  formScore: number
  phase: 'up' | 'down' | 'transition'
}

export class SquatAnalyzer {
  private repCount = 0
  private isDown = false
  private lastKneeAngle = 180
  private depths: number[] = []
  private formScores: number[] = []

  analyzeFrame(landmarks: any[]): SquatMetrics {
    if (!landmarks || landmarks.length < 33) {
      return {
        repCount: this.repCount,
        depth: 0,
        formScore: 0,
        phase: 'up'
      }
    }

    // Key landmarks for squats
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]

    // Calculate angles
    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle)
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle)
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2

    // Calculate depth (lower angle = deeper squat)
    const depth = Math.max(0, Math.min(100, (180 - avgKneeAngle) / 90 * 100))

    // Determine squat phase
    const isCurrentlyDown = avgKneeAngle < 120 // Squat down position
    const isCurrentlyUp = avgKneeAngle > 160   // Standing position

    // Count reps
    if (!this.isDown && isCurrentlyDown) {
      this.isDown = true
    } else if (this.isDown && isCurrentlyUp) {
      this.repCount++
      this.isDown = false
    }

    // Calculate form score
    const formScore = this.calculateFormScore(landmarks, avgKneeAngle)
    
    if (isCurrentlyDown) {
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

  private calculateAngle(a: any, b: any, c: any): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
    let angle = Math.abs(radians * 180.0 / Math.PI)
    if (angle > 180.0) {
      angle = 360 - angle
    }
    return angle
  }

  private calculateFormScore(landmarks: any[], kneeAngle: number): number {
    // Check back straightness
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

    // Calculate back angle (should be relatively straight)
    const backAngle = Math.abs(Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      shoulderMidpoint.x - hipMidpoint.x
    ) * 180 / Math.PI)

    // Score components
    let backScore = Math.max(0, 100 - Math.abs(90 - backAngle)) // Perfect back is around 90 degrees
    let depthScore = kneeAngle < 120 ? 100 : Math.max(0, 100 - (kneeAngle - 120) * 2)
    
    // Weight distribution (knees should track over toes)
    const leftKnee = landmarks[25]
    const rightKnee = landmarks[26]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]
    
    const kneeAlignment = Math.abs(
      ((leftKnee.x + rightKnee.x) / 2) - ((leftAnkle.x + rightAnkle.x) / 2)
    )
    let alignmentScore = Math.max(0, 100 - kneeAlignment * 1000)

    return (backScore * 0.4 + depthScore * 0.4 + alignmentScore * 0.2)
  }

  reset() {
    this.repCount = 0
    this.isDown = false
    this.depths = []
    this.formScores = []
  }
}
