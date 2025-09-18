const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface SubmissionResponse {
  success: boolean
  submissionId: string
  message: string
}

export async function submitAssessment(
  videoBlob: Blob, 
  integrityBundle: any
): Promise<SubmissionResponse> {
  const formData = new FormData()
  formData.append('video', videoBlob, 'assessment.webm')
  formData.append('integrity_bundle', JSON.stringify(integrityBundle))

  const response = await fetch(`${API_BASE_URL}/api/submissions`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return await response.json()
}

export async function getSubmissionStatus(submissionId: string) {
  const response = await fetch(`${API_BASE_URL}/api/submissions/${submissionId}`)
  
  if (!response.ok) {
    throw new Error(`Status check failed: ${response.statusText}`)
  }

  return await response.json()
}

export async function getLeaderboard(ageBand: string, gender: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/leaderboard?age_band=${ageBand}&gender=${gender}`
  )
  
  if (!response.ok) {
    throw new Error(`Leaderboard fetch failed: ${response.statusText}`)
  }

  return await response.json()
}
