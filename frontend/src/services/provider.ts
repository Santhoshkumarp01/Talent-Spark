interface StorageProvider {
  uploadVideo(blob: Blob, filename: string): Promise<string>
  getVideoUrl(filename: string): Promise<string>
}

class CloudinaryProvider implements StorageProvider {
  private cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  private uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  async uploadVideo(blob: Blob, filename: string): Promise<string> {
    const formData = new FormData()
    formData.append('file', blob)
    formData.append('upload_preset', this.uploadPreset)
    formData.append('public_id', filename)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/video/upload`,
      { method: 'POST', body: formData }
    )

    const result = await response.json()
    return result.secure_url
  }

  async getVideoUrl(filename: string): Promise<string> {
    return `https://res.cloudinary.com/${this.cloudName}/video/upload/${filename}`
  }
}

export { CloudinaryProvider }
export type { StorageProvider }
