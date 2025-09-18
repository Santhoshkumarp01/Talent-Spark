interface StoredAssessment {
  id: string
  videoBlob: Blob
  integrityBundle: any
  timestamp: number
  status: 'pending' | 'uploaded' | 'failed'
}

class IndexedDBManager {
  private dbName = 'TalentSparkDB'
  private version = 1
  private db: IDBDatabase | null = null

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains('assessments')) {
          const store = db.createObjectStore('assessments', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('status', 'status', { unique: false })
        }
      }
    })
  }

  async storeAssessment(assessment: StoredAssessment): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['assessments'], 'readwrite')
    const store = transaction.objectStore('assessments')
    
    return new Promise((resolve, reject) => {
      const request = store.put(assessment)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingAssessments(): Promise<StoredAssessment[]> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['assessments'], 'readonly')
    const store = transaction.objectStore('assessments')
    const index = store.index('status')
    
    return new Promise((resolve, reject) => {
      const request = index.getAll('pending')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async updateAssessmentStatus(id: string, status: 'pending' | 'uploaded' | 'failed'): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')
    
    const transaction = this.db.transaction(['assessments'], 'readwrite')
    const store = transaction.objectStore('assessments')
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id)
      getRequest.onsuccess = () => {
        const assessment = getRequest.result
        if (assessment) {
          assessment.status = status
          const putRequest = store.put(assessment)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          reject(new Error('Assessment not found'))
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }
}

export default IndexedDBManager
