// Types for the LeetCode Challenge Tracker

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  leetcodeUsername: string;
  createdAt?: string;
  // user may belong to multiple challenges; store full member records
  memberships?: ChallengeMember[];
  // challenges created/owned by this user
  ownedChallenges?: Challenge[];
}

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  dailyTarget: number;
  difficulty: "easy" | "medium" | "hard" | "any";
  penaltyAmount?: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  ownerId?: string;
  visibility?: string;
  members: ChallengeMember[];
  isActive: boolean;
  difficultyFilter?: string[];
  status?: "ACTIVE" | "PENDING" | "COMPLETED" | "CANCELLED";
  minSubmissionsPerDay?: number;
}

export interface ChallengeMember {
  userId: string;
  userName: string;
  avatar?: string;
  status: "completed" | "failed" | "pending";
  joinedAt: string;
  streak: number;
  totalPenalty: number;
  dailyProgress: DailyProgress[];
}

export interface DailyProgress {
  date: string;
  solved: number;
  target: number;
  status: "completed" | "failed" | "pending";
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  totalSolved: number;
  currentStreak: number;
  missedDays: number;
  penaltyAmount: number;
}

export interface Stats {
  todayStatus: "completed" | "failed" | "pending";
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

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type AchievementCategory =
  | 'streak'
  | 'problem_solving'
  | 'challenge'
  | 'difficulty'
  | 'social'
  | 'special';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  requirement: number;
  unlockedAt?: string;
  progress?: number;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export type UserTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface TierInfo {
  tier: UserTier;
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface UserTierProgress {
  currentTier: UserTier;
  totalPoints: number;
  currentTierInfo: TierInfo;
  nextTierInfo: TierInfo | null;
  pointsToNextTier: number;
  progressPercentage: number;
}

export interface GamificationStats {
  totalPoints: number;
  currentTier: UserTier;
  achievementsUnlocked: number;
  totalAchievements: number;
  recentAchievements: Achievement[];
  nextAchievements: Achievement[];
}

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

// LeetCode profile returned from the backend
export interface LeetCodeProfile {
  username: string;
  streak: number;
  totalActiveDays: number;
  activeYears: number[];
  // the calendar may come as a JSON string or object mapping dates to counts
  submissionCalendar: string | Record<string, number>;
}

export interface ChallengeInvite {
  id: string;
  challengeId: string;
  challengeName: string;
  inviterId: string;
  inviterName: string;
  senderName?: string;
  inviteeId: string;
  inviteeName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  username: string;
  leetcodeUsername?: string;
  avatar?: string;
}

export interface DashboardResponse {
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    totalPenalties: number;
  };
  activeChallenges: Challenge[];
  recentActivity: ActivityData[];
}

export interface LeaderboardMember {
  userId: string;
  userName?: string;
  username?: string;
  totalPenalty?: number;
  status?: string;
  avatar?: string;
}

export interface ChallengeResponse {
  id: string;
  name: string;
  description: string;
  minSubmissionsPerDay: number;
  difficultyFilter: string[] | null;
  uniqueProblemConstraint: boolean;
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  createdAt: string;
  members?: LeaderboardMember[];
}

export interface TodayStatusResponse {
  date: string;
  challenges: Challenge[];
  summary: {
    totalChallenges: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

export interface DashboardStats {
  currentStreak: number;
  longestStreak: number;
  totalPenalties: number;
  totalSubmissions: number;
}

export interface SessionStatus {
  isValid: boolean;
  expiresAt: string;
}

