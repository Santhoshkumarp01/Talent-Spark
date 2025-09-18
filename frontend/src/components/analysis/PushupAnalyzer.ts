export class PushupAnalyzer {
  private repCount = 0
  private isDown = false
  private elbowAngles: number[] = []
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

    // Key landmarks for push-ups
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]

    // Calculate elbow angles
    const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist)
    const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist)
    const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2

    // Calculate depth (lower angle = deeper push-up)
    const depth = Math.max(0, Math.min(100, (180 - avgElbowAngle) / 90 * 100))

    // Determine push-up phase
    const isCurrentlyDown = avgElbowAngle < 100 // Arms bent, down position
    const isCurrentlyUp = avgElbowAngle > 160   // Arms extended, up position

    // Count reps
    if (!this.isDown && isCurrentlyDown) {
      this.isDown = true
    } else if (this.isDown && isCurrentlyUp) {
      this.repCount++
      this.isDown = false
    }

    // Calculate form score
    const formScore = this.calculatePushupForm(landmarks, avgElbowAngle)
    
    if (isCurrentlyDown) {
      this.elbowAngles.push(avgElbowAngle)
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

  private calculatePushupForm(landmarks: any[], elbowAngle: number): number {
    // Check body alignment (head-shoulder-hip should be straight)
    const nose = landmarks[0]
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

    // Calculate body straightness
    const bodyAngle = Math.abs(Math.atan2(
      shoulderMidpoint.y - hipMidpoint.y,
      shoulderMidpoint.x - hipMidpoint.x
    ) * 180 / Math.PI)

    let alignmentScore = Math.max(0, 100 - Math.abs(bodyAngle)) // Straighter is better
    let depthScore = elbowAngle < 100 ? 100 : Math.max(0, 100 - (elbowAngle - 100) * 1.5)

    return (alignmentScore * 0.6 + depthScore * 0.4)
  }

  reset() {
    this.repCount = 0
    this.isDown = false
    this.elbowAngles = []
    this.formScores = []
  }
}
