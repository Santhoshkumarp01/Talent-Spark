interface BenchmarkData {
  ageMin: number
  ageMax: number
  gender: 'male' | 'female'
  excellent: number
  good: number
  average: number
  belowAverage: number
}

interface ProfileData {
  age: number
  gender: 'male' | 'female'
  height: number
  weight: number
}

interface BenchmarkResult {
  grade: string
  percentile: number
  category: string
  recommendation: string
}

export class BenchmarkComparer {
  private benchmarks: BenchmarkData[] = [
    // Male benchmarks
    { ageMin: 13, ageMax: 15, gender: 'male', excellent: 30, good: 25, average: 20, belowAverage: 15 },
    { ageMin: 16, ageMax: 18, gender: 'male', excellent: 35, good: 30, average: 25, belowAverage: 20 },
    { ageMin: 19, ageMax: 25, gender: 'male', excellent: 40, good: 35, average: 30, belowAverage: 25 },
    { ageMin: 26, ageMax: 35, gender: 'male', excellent: 35, good: 30, average: 25, belowAverage: 20 },
    
    // Female benchmarks
    { ageMin: 13, ageMax: 15, gender: 'female', excellent: 25, good: 20, average: 16, belowAverage: 12 },
    { ageMin: 16, ageMax: 18, gender: 'female', excellent: 30, good: 25, average: 20, belowAverage: 16 },
    { ageMin: 19, ageMax: 25, gender: 'female', excellent: 35, good: 30, average: 25, belowAverage: 20 },
    { ageMin: 26, ageMax: 35, gender: 'female', excellent: 30, good: 25, average: 20, belowAverage: 16 },
  ]

  comparePerformance(reps: number, profile: ProfileData): BenchmarkResult {
    const benchmark = this.findBenchmark(profile.age, profile.gender)
    
    if (!benchmark) {
      return {
        grade: 'N/A',
        percentile: 50,
        category: 'No benchmark available',
        recommendation: 'Keep practicing!'
      }
    }

    let grade: string
    let percentile: number
    let category: string
    let recommendation: string

    if (reps >= benchmark.excellent) {
      grade = 'A+'
      percentile = 90 + Math.min(10, Math.floor((reps - benchmark.excellent) / 2))
      category = 'Excellent'
      recommendation = 'Outstanding performance! You\'re in the top tier for your age group.'
    } else if (reps >= benchmark.good) {
      grade = 'B+'
      percentile = 70 + Math.floor((reps - benchmark.good) / (benchmark.excellent - benchmark.good) * 20)
      category = 'Good'
      recommendation = 'Great job! You\'re performing above average for your age group.'
    } else if (reps >= benchmark.average) {
      grade = 'B'
      percentile = 40 + Math.floor((reps - benchmark.average) / (benchmark.good - benchmark.average) * 30)
      category = 'Average'
      recommendation = 'Solid performance! With consistent training, you can reach the next level.'
    } else if (reps >= benchmark.belowAverage) {
      grade = 'C+'
      percentile = 20 + Math.floor((reps - benchmark.belowAverage) / (benchmark.average - benchmark.belowAverage) * 20)
      category = 'Below Average'
      recommendation = 'Keep working! Focus on proper form and gradual improvement.'
    } else {
      grade = 'C'
      percentile = Math.max(5, Math.floor(reps / benchmark.belowAverage * 20))
      category = 'Needs Improvement'
      recommendation = 'Don\'t give up! Every rep counts towards building your strength.'
    }

    return { grade, percentile, category, recommendation }
  }

  private findBenchmark(age: number, gender: 'male' | 'female'): BenchmarkData | null {
    return this.benchmarks.find(b => 
      age >= b.ageMin && age <= b.ageMax && b.gender === gender
    ) || null
  }

  getAgeBand(age: number): string {
    if (age <= 15) return '13-15'
    if (age <= 18) return '16-18'
    if (age <= 25) return '19-25'
    if (age <= 35) return '26-35'
    return '36+'
  }

  getAllBenchmarks(): BenchmarkData[] {
    return [...this.benchmarks]
  }
}

export default BenchmarkComparer
