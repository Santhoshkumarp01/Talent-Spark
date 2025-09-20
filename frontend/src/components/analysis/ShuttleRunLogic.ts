interface PoseLandmark {
  x: number
  y: number
  z: number
}

interface ShuttleRunMetrics {
  repCount: number
  currentSpeed: number
  averageSpeed: number
  formScore: number
  lastRepTime: number
  totalDistance: number
}

export class ShuttleRunAnalyzer {
  private repCount = 0
  private isMovingLeft = false
  private isMovingRight = false
  private lastCenterX = 0.5
  private speeds: number[] = []
  private lastRepTime = 0
  private repTimes: number[] = []
  private positions: number[] = []
  private lastTimestamp = 0

  analyzeFrame(landmarks: PoseLandmark[]): ShuttleRunMetrics {
    if (!landmarks || landmarks.length < 33) {
      return this.getCurrentMetrics()
    }

    // Key landmarks for shuttle run analysis
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftFoot = landmarks[31] // Left foot index
    const rightFoot = landmarks[32] // Right foot index

    // Calculate body center position (horizontal)
    const bodyCenter = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4
    const currentTimestamp = Date.now()

    // Calculate speed
    let currentSpeed = 0
    if (this.lastTimestamp > 0 && this.positions.length > 0) {
      const distance = Math.abs(bodyCenter - this.positions[this.positions.length - 1])
      const timeDiff = (currentTimestamp - this.lastTimestamp) / 1000 // Convert to seconds
      currentSpeed = distance / timeDiff
      this.speeds.push(currentSpeed)
    }

    // Detect movement direction and shuttle completion
    const leftThreshold = 0.3   // Left side boundary
    const rightThreshold = 0.7  // Right side boundary
    const centerThreshold = 0.1 // How close to center to reset

    const isAtLeft = bodyCenter < leftThreshold
    const isAtRight = bodyCenter > rightThreshold
    const isAtCenter = Math.abs(bodyCenter - 0.5) < centerThreshold

    // Track shuttle runs (full left-to-right or right-to-left movements)
    if (!this.isMovingLeft && isAtLeft) {
      this.isMovingLeft = true
      this.isMovingRight = false
    } else if (!this.isMovingRight && isAtRight) {
      this.isMovingRight = true
      if (this.isMovingLeft) {
        // Completed a full shuttle (left to right)
        this.repCount++
        this.recordRepTime()
      }
      this.isMovingLeft = false
    } else if (this.isMovingRight && isAtLeft) {
      // Completed reverse shuttle (right to left)
      this.repCount++
      this.recordRepTime()
      this.isMovingLeft = true
      this.isMovingRight = false
    }

    // Store position and timestamp for next calculation
    this.positions.push(bodyCenter)
    this.lastTimestamp = currentTimestamp

    return this.getCurrentMetrics()
  }

  private recordRepTime() {
    const currentTime = Date.now()
    if (this.lastRepTime > 0) {
      this.repTimes.push(currentTime - this.lastRepTime)
    }
    this.lastRepTime = currentTime
  }

  private getCurrentMetrics(): ShuttleRunMetrics {
    const averageSpeed = this.speeds.length > 0 
      ? this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length 
      : 0

    const currentSpeed = this.speeds.length > 0 
      ? this.speeds[this.speeds.length - 1] 
      : 0

    const totalDistance = this.calculateTotalDistance()
    const formScore = this.calculateFormScore()

    return {
      repCount: this.repCount,
      currentSpeed: Math.round(currentSpeed * 1000) / 1000,
      averageSpeed: Math.round(averageSpeed * 1000) / 1000,
      formScore,
      lastRepTime: this.lastRepTime,
      totalDistance: Math.round(totalDistance * 100) / 100
    }
  }

  private calculateTotalDistance(): number {
    if (this.positions.length < 2) return 0

    return this.positions.reduce((total, pos, index) => {
      if (index === 0) return 0
      return total + Math.abs(pos - this.positions[index - 1])
    }, 0) * 100 // Scale to reasonable units
  }

  private calculateFormScore(): number {
    if (this.speeds.length < 3) return 100

    // Calculate speed consistency (penalize erratic movements)
    const recentSpeeds = this.speeds.slice(-10) // Last 10 measurements
    const avgSpeed = recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
    const speedVariance = recentSpeeds.reduce((acc, speed) => {
      return acc + Math.pow(speed - avgSpeed, 2)
    }, 0) / recentSpeeds.length

    const consistencyScore = Math.max(0, 100 - Math.sqrt(speedVariance) * 100)

    // Movement efficiency (prefer smooth directional changes)
    let efficiencyScore = 100
    if (this.positions.length > 5) {
      const recentPositions = this.positions.slice(-5)
      let directionChanges = 0
      
      for (let i = 1; i < recentPositions.length - 1; i++) {
        const prev = recentPositions[i - 1]
        const curr = recentPositions[i]
        const next = recentPositions[i + 1]
        
        const dir1 = curr - prev
        const dir2 = next - curr
        
        // Check for direction change
        if ((dir1 > 0 && dir2 < 0) || (dir1 < 0 && dir2 > 0)) {
          directionChanges++
        }
      }
      
      // Penalize excessive direction changes (should be smooth)
      efficiencyScore = Math.max(0, 100 - directionChanges * 20)
    }

    // Speed score (prefer moderate, sustainable speed)
    const optimalSpeed = 0.5 // Adjust based on testing
    const currentSpeed = this.speeds.length > 0 ? this.speeds[this.speeds.length - 1] : 0
    const speedScore = Math.max(0, 100 - Math.abs(currentSpeed - optimalSpeed) * 100)

    return Math.round((consistencyScore * 0.4 + efficiencyScore * 0.4 + speedScore * 0.2))
  }

  reset() {
    this.repCount = 0
    this.isMovingLeft = false
    this.isMovingRight = false
    this.lastCenterX = 0.5
    this.speeds = []
    this.lastRepTime = 0
    this.repTimes = []
    this.positions = []
    this.lastTimestamp = 0
  }

  getDetailedMetrics() {
    const averageRepTime = this.repTimes.length > 0 
      ? Math.round(this.repTimes.reduce((a, b) => a + b, 0) / this.repTimes.length / 1000) 
      : 0

    const maxSpeed = this.speeds.length > 0 ? Math.max(...this.speeds) : 0

    const averageSpeed = this.speeds.length > 0 
      ? this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length 
      : 0

    return {
      totalReps: this.repCount,
      averageSpeed: Math.round(averageSpeed * 1000) / 1000,
      maxSpeed: Math.round(maxSpeed * 1000) / 1000,
      formScore: this.calculateFormScore(),
      averageRepTime,
      totalDistance: this.calculateTotalDistance(),
      consistency: this.calculateSpeedConsistency()
    }
  }

  private calculateSpeedConsistency(): number {
    if (this.speeds.length < 3) return 100

    const avgSpeed = this.speeds.reduce((a, b) => a + b, 0) / this.speeds.length
    const variance = this.speeds.reduce((acc, speed) => {
      return acc + Math.pow(speed - avgSpeed, 2)
    }, 0) / this.speeds.length
    
    return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 50))
  }
}

export default ShuttleRunAnalyzer