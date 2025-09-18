interface SessionMetrics {
  totalReps: number
  averageDepth: number
  formScore: number
  duration: number
  grade: string
  benchmark: string
}

class SessionManager {
  private metrics: SessionMetrics | null = null
  private isActive = false
  private startTime = 0

  startSession() {
    this.isActive = true
    this.startTime = Date.now()
    this.metrics = null
  }

  updateMetrics(metrics: Partial<SessionMetrics>) {
    if (!this.metrics) {
      this.metrics = {
        totalReps: 0,
        averageDepth: 0,
        formScore: 0,
        duration: 0,
        grade: 'N/A',
        benchmark: 'Unknown'
      }
    }
    
    this.metrics = { ...this.metrics, ...metrics }
  }

  endSession() {
    if (this.metrics) {
      this.metrics.duration = Math.round((Date.now() - this.startTime) / 1000)
    }
    this.isActive = false
  }

  getMetrics(): SessionMetrics | null {
    return this.metrics
  }

  isSessionActive(): boolean {
    return this.isActive
  }

  reset() {
    this.metrics = null
    this.isActive = false
    this.startTime = 0
  }
}

export default new SessionManager()
