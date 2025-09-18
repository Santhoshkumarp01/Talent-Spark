interface UserProfile {
  age: number
  gender: 'male' | 'female'
  height: number
  weight: number
  ageBand: string
}

class ProfileManager {
  private profile: UserProfile | null = null

  setProfile(profileData: Omit<UserProfile, 'ageBand'>) {
    this.profile = {
      ...profileData,
      ageBand: this.calculateAgeBand(profileData.age)
    }
  }

  getProfile(): UserProfile | null {
    return this.profile
  }

  private calculateAgeBand(age: number): string {
    if (age <= 15) return '13-15'
    if (age <= 18) return '16-18'
    if (age <= 25) return '19-25'
    if (age <= 35) return '26-35'
    return '36+'
  }

  clearProfile() {
    this.profile = null
  }
}

export default new ProfileManager()
