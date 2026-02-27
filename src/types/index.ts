// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
}

export interface Challenge {
  id: string;
  name: string;
  dailyTarget: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  members: ChallengeMember[];
  isActive: boolean;
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: 'completed' | 'failed' | 'pending';
  streak: number;
  totalPenalty: number;
  dailyProgress: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  solved: number;
  target: number;
  status: 'completed' | 'failed' | 'pending';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalSolved: number;
  currentStreak: number;
  longestStreak?: number;
  missedDays: number;
  penaltyAmount: number;
}

export interface Stats {
  todayStatus: 'completed' | 'failed' | 'pending';
  todaySolved: number;
  todayTarget: number;
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;
  activeChallenges: number;
  totalSolved: number;
}

export interface ActivityData {
  date: string;
  count: number;
}

export interface ChartData {
  date: string;
  solved: number;
  target: number;
}

export type RawData = {
  date?: string;
  displayDate?: string;
  solved?: number;
  passed?: number;
  submissions?: number;
  target?: number;
  dailyTarget?: number;
};

// ============================================
// Streak & Consistency Tracking Types
// ============================================

/**
 * Activity log structure for streak persistence
 */
export interface ActivityLog {
  dates: string[]; // Array of dates in YYYY-MM-DD format
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

/**
 * Complete streak data with statistics
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeToday: boolean;
  missedDays: number;
  dates: string[];
  lastUpdated: string;
  isLoading: boolean;
}

/**
 * Activity statistics summary
 */
export interface ActivityStats {
  currentStreak: number;
  longestStreak: number;
  missedDays: number;
  activeToday: boolean;
  totalActiveDays: number;
  dates: string[];
}
