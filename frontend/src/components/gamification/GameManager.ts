// GameManager.ts

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  overallScore: number;
  totalAssessments: number;
  badges: Badge[];
  rank: number;
  grade: string;
}

export interface UserStats {
  totalPoints: number;
  currentRank: number;
  badgesEarned: Badge[];
  totalAssessments: number;
  streakDays: number;
}

export class GameManager {
  private static readonly BADGES: Badge[] = [
    { id: 'first_steps', name: 'First Steps', description: 'Complete your first assessment', icon: '🎉', rarity: 'common', points: 50 },
    { id: 'ten_reps', name: 'Ten Reps Club', description: 'Complete 10+ reps in single exercise', icon: '💪', rarity: 'common', points: 75 },
    { id: 'perfect_form', name: 'Perfect Form', description: 'Achieve 90%+ form score', icon: '✨', rarity: 'rare', points: 150 },
    { id: 'twenty_plus', name: 'Twenty Plus', description: 'Complete 20+ reps in single exercise', icon: '🚀', rarity: 'epic', points: 250 },
    { id: 'grade_master', name: 'Grade Master', description: 'Achieve A+ grade', icon: '🌟', rarity: 'epic', points: 300 },
    { id: 'consistency_king', name: 'Consistency King', description: 'Complete 7 consecutive days', icon: '🔥', rarity: 'rare', points: 200 },
    { id: 'century_club', name: 'Century Club', description: 'Complete 100 total reps', icon: '💯', rarity: 'epic', points: 400 },
    { id: 'improvement_star', name: 'Improvement Star', description: 'Improve by 2 grades', icon: '📈', rarity: 'rare', points: 175 },
  ];

  static calculateOverallScore(grade: string, reps: number, formScore: number, badges: Badge[] = []): number {
    const gradePoints: Record<string, number> = { 'A+': 100, 'A': 85, 'B+': 70, 'B': 55, 'C+': 40, 'C': 25, 'D': 15, 'F': 0 };
    const safeGrade = grade || 'F';
    const baseScore = (gradePoints[safeGrade] || 0) + (reps * 2) + formScore;
    const badgeBonus = badges.reduce((total, badge) => total + (badge.points || 0), 0);
    return baseScore + badgeBonus;
  }

  static checkBadgeUnlocks(assessmentData: any, userHistory: any[] = []): Badge[] {
    const newBadges: Badge[] = [];
    if (!assessmentData) return newBadges;

    const existingBadgeIds = userHistory.flatMap(a => a?.badgesEarned?.map((b: any) => b?.id) || []);

    const totalReps: number = assessmentData?.analysisResults?.totalReps ?? 0;
    const formScore: number = assessmentData?.analysisResults?.formScore ?? 0;
    const currentGrade: string = assessmentData?.grade ?? 'F';

    // First Steps
    if (!existingBadgeIds.includes('first_steps') && userHistory.length === 0) {
      const badge = this.BADGES.find(b => b.id === 'first_steps');
      if (badge) newBadges.push(badge);
    }

    // Ten Reps Club
    if (!existingBadgeIds.includes('ten_reps') && totalReps >= 10) {
      const badge = this.BADGES.find(b => b.id === 'ten_reps');
      if (badge) newBadges.push(badge);
    }

    // Perfect Form
    if (!existingBadgeIds.includes('perfect_form') && formScore >= 90) {
      const badge = this.BADGES.find(b => b.id === 'perfect_form');
      if (badge) newBadges.push(badge);
    }

    // Twenty Plus
    if (!existingBadgeIds.includes('twenty_plus') && totalReps >= 20) {
      const badge = this.BADGES.find(b => b.id === 'twenty_plus');
      if (badge) newBadges.push(badge);
    }

    // Grade Master
    if (!existingBadgeIds.includes('grade_master') && currentGrade === 'A+') {
      const badge = this.BADGES.find(b => b.id === 'grade_master');
      if (badge) newBadges.push(badge);
    }

    // Century Club
    if (!existingBadgeIds.includes('century_club')) {
      const totalHistoryReps = userHistory.reduce((sum, a) => sum + (a?.analysisResults?.totalReps || 0), 0);
      if ((totalHistoryReps + totalReps) >= 100) {
        const badge = this.BADGES.find(b => b.id === 'century_club');
        if (badge) newBadges.push(badge);
      }
    }

    // Improvement Star
    if (!existingBadgeIds.includes('improvement_star') && userHistory.length > 0) {
      const gradeValues: Record<string, number> = { 'F': 0, 'D': 1, 'C': 2, 'C+': 3, 'B': 4, 'B+': 5, 'A': 6, 'A+': 7 };
      const currentGradeValue = gradeValues[currentGrade] ?? 0;
      const validGrades = userHistory
        .map(a => gradeValues[a?.grade ?? 'F'] ?? 0)
        .filter(val => val !== undefined && val !== null && !Number.isNaN(val));

      if (validGrades.length > 0) {
        const bestPreviousGrade = Math.max(...validGrades);
        if (currentGradeValue - bestPreviousGrade >= 2) {
          const badge = this.BADGES.find(b => b.id === 'improvement_star');
          if (badge) newBadges.push(badge);
        }
      }
    }

    // Consistency King (optional simple heuristic: 7 or more assessments)
    if (!existingBadgeIds.includes('consistency_king') && userHistory.length + 1 >= 7) {
      const badge = this.BADGES.find(b => b.id === 'consistency_king');
      if (badge) newBadges.push(badge);
    }

    return newBadges;
  }

  static getLeaderboard(): LeaderboardEntry[] {
    const allAssessments: any[] = [];

    // Load all assessments from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('assessment_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          if (data) allAssessments.push(data);
        } catch {
          continue;
        }
      }
    }

    // Group by user name
    const userMap = new Map<string, any>();
    allAssessments.forEach(assessment => {
      const userName: string | undefined = assessment?.profileData?.name;
      if (!userName) return;

      if (!userMap.has(userName)) {
        userMap.set(userName, {
          assessments: [] as any[],
          bestScore: 0,
          bestGrade: 'F' as string,
          bestAssessment: null as any,
          totalBadges: [] as Badge[],
        });
      }

      const userData = userMap.get(userName);
      userData.assessments.push(assessment);

      const score = this.calculateOverallScore(
        assessment?.grade ?? 'F',
        assessment?.analysisResults?.totalReps ?? 0,
        assessment?.analysisResults?.formScore ?? 0,
        assessment?.badgesEarned ?? []
      );

      if (score > userData.bestScore) {
        userData.bestScore = score;
        userData.bestAssessment = assessment;
        userData.bestGrade = assessment?.grade ?? 'F';
      }

      if (assessment?.badgesEarned && Array.isArray(assessment.badgesEarned)) {
        userData.totalBadges = [...userData.totalBadges, ...assessment.badgesEarned];
      }
    });

    const leaderboardEntries: LeaderboardEntry[] = Array.from(userMap.entries()).map(([name, data]) => ({
      userId: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      overallScore: data.bestScore ?? 0,
      totalAssessments: data.assessments?.length ?? 0,
      badges: data.totalBadges ?? [],
      rank: 0,
      grade: data.bestGrade ?? 'F',
    }));

    leaderboardEntries.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0));
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardEntries.slice(0, 100);
  }

  static getUserStats(userName: string): UserStats | null {
    if (!userName) return null;

    const userAssessments: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('assessment_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!);
          if (data?.profileData?.name === userName) {
            userAssessments.push(data);
          }
        } catch {
          continue;
        }
      }
    }

    if (userAssessments.length === 0) return null;

    const allBadges: Badge[] = userAssessments.flatMap(a => a?.badgesEarned || []);
    const totalPoints = allBadges.reduce((total, badge) => total + (badge?.points || 0), 0);

    const leaderboard = this.getLeaderboard();
    const userEntry = leaderboard.find(entry => entry?.name === userName);

    return {
      totalPoints: totalPoints || 0,
      currentRank: userEntry?.rank || 999,
      badgesEarned: allBadges || [],
      totalAssessments: userAssessments.length || 0,
      streakDays: Math.min(userAssessments.length || 0, 7),
    };
  }

  static getAllBadges(): Badge[] {
    return [...this.BADGES];
  }

  static getBadgeById(id: string): Badge | undefined {
    if (!id) return undefined;
    return this.BADGES.find(badge => badge?.id === id);
  }
}
