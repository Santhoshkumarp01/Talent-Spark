import IndexedDBManager from './idb'
import { submitAssessment } from '../services/api'

class SyncQueue {
  private idb: IndexedDBManager
  private isOnline = navigator.onLine
  private syncInProgress = false

  constructor() {
    this.idb = new IndexedDBManager()
    this.setupEventListeners()
  }

  async initialize() {
    await this.idb.initialize()
    if (this.isOnline) {
      this.processPendingUploads()
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processPendingUploads()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  async queueAssessment(videoBlob: Blob, integrityBundle: any) {
    const assessment = {
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoBlob,
      integrityBundle,
      timestamp: Date.now(),
      status: 'pending' as const
    }

    await this.idb.storeAssessment(assessment)
    
    if (this.isOnline) {
      this.processPendingUploads()
    }
  }

  private async processPendingUploads() {
    if (this.syncInProgress || !this.isOnline) return
    
    this.syncInProgress = true
    
    try {
      const pendingAssessments = await this.idb.getPendingAssessments()
      
      for (const assessment of pendingAssessments) {
        try {
          await submitAssessment(assessment.videoBlob, assessment.integrityBundle)
          await this.idb.updateAssessmentStatus(assessment.id, 'uploaded')
        } catch (error) {
          console.error('Upload failed:', error)
          await this.idb.updateAssessmentStatus(assessment.id, 'failed')
        }
      }
    } finally {
      this.syncInProgress = false
    }
  }

  async getPendingCount(): Promise<number> {
    const pending = await this.idb.getPendingAssessments()
    return pending.length
  }

  async retryFailed() {
    // Convert failed back to pending
    const transaction = this.idb['db']?.transaction(['assessments'], 'readwrite')
    // Implementation for retrying failed uploads
  }
}

export default SyncQueue
