// Mock data for development - Replace with actual API calls

import { User, Challenge, LeaderboardEntry, Stats, ActivityData, ChartData, Achievement, TierInfo, UserTierProgress, GamificationStats, UserTier } from '@/types';

export const currentUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  leetcodeUsername: 'alexchen',
  createdAt: '2023-01-01T00:00:00Z'
};

export const mockStats: Stats = {
  todayStatus: 'completed',
  todaySolved: 2,
  todayTarget: 2,
  currentStreak: 14,
  longestStreak: 30,
  totalPenalties: 25,
  activeChallenges: 3,
  totalSolved: 156
};

export const mockChallenges: Challenge[] = [
  {
    id: '1',
    name: 'January Grind',
    dailyTarget: 2,
    difficulty: 'medium',
    penaltyAmount: 5,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    createdBy: '1',
    isActive: true,
    members: [
      {
        userId: '1',
        userName: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'completed',
        joinedAt: '2024-01-01T00:00:00Z',
        streak: 14,
        totalPenalty: 10,
        dailyProgress: []
      },
      {
        userId: '2',
        userName: 'Sarah Miller',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        status: 'completed',
        joinedAt: '2024-01-02T00:00:00Z',
        streak: 12,
        totalPenalty: 15,
        dailyProgress: []
      },
      {
        userId: '3',
        userName: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        status: 'failed',
        joinedAt: '2024-01-03T00:00:00Z',
        streak: 5,
        totalPenalty: 45,
        dailyProgress: []
      }
    ]
  },
  {
    id: '2',
    name: 'Hard Mode Warriors',
    dailyTarget: 1,
    difficulty: 'hard',
    penaltyAmount: 10,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    createdBy: '2',
    isActive: true,
    members: [
      {
        userId: '1',
        userName: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        status: 'pending',
        joinedAt: '2024-01-15T00:00:00Z',
        streak: 8,
        totalPenalty: 20,
        dailyProgress: []
      },
      {
        userId: '4',
        userName: 'Mike Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        status: 'completed',
        joinedAt: '2024-01-16T00:00:00Z',
        streak: 10,
        totalPenalty: 10,
        dailyProgress: []
      }
    ]
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '4', userName: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', totalSolved: 245, currentStreak: 28, missedDays: 2, penaltyAmount: 10 },
  { rank: 2, userId: '2', userName: 'Sarah Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', totalSolved: 198, currentStreak: 21, missedDays: 5, penaltyAmount: 25 },
  { rank: 3, userId: '1', userName: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', totalSolved: 156, currentStreak: 14, missedDays: 5, penaltyAmount: 25 },
  { rank: 4, userId: '5', userName: 'Emily Wang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', totalSolved: 134, currentStreak: 7, missedDays: 8, penaltyAmount: 40 },
  { rank: 5, userId: '3', userName: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', totalSolved: 89, currentStreak: 3, missedDays: 15, penaltyAmount: 75 },
  { rank: 6, userId: '6', userName: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', totalSolved: 67, currentStreak: 0, missedDays: 20, penaltyAmount: 100 }
];

// Generate activity data for heatmap (last 365 days)
export const generateActivityData = (): ActivityData[] => {
  const data: ActivityData[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Random activity level (0-4)
    const random = Math.random();
    let count = 0;
    if (random > 0.3) count = 1;
    if (random > 0.5) count = 2;
    if (random > 0.7) count = 3;
    if (random > 0.9) count = 4;

    data.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }

  return data;
};

export const mockActivityData = generateActivityData();

// Chart data for last 30 days
export const generateChartData = (): ChartData[] => {
  const data: ChartData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0],
      solved: Math.floor(Math.random() * 4) + 1,
      target: 2
    });
  }

  return data;
};

export const mockChartData = generateChartData();

// ============================================================================
// GAMIFICATION MOCK DATA
// ============================================================================

export const tierConfig: TierInfo[] = [
  { tier: 'bronze', name: 'Bronze', minPoints: 0, maxPoints: 100, color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-500' },
  { tier: 'silver', name: 'Silver', minPoints: 101, maxPoints: 500, color: 'text-gray-500', bgColor: 'bg-gray-100', borderColor: 'border-gray-400' },
  { tier: 'gold', name: 'Gold', minPoints: 501, maxPoints: 1500, color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500' },
  { tier: 'platinum', name: 'Platinum', minPoints: 1501, maxPoints: 3000, color: 'text-cyan-500', bgColor: 'bg-cyan-100', borderColor: 'border-cyan-500' },
  { tier: 'diamond', name: 'Diamond', minPoints: 3001, maxPoints: Infinity, color: 'text-blue-400', bgColor: 'bg-blue-100', borderColor: 'border-blue-400' },
];

export const mockAchievements: Achievement[] = [
  // Streak-Based Achievements
  { id: 'streak-3', name: 'Fire Starter', description: 'Complete 3 consecutive days', icon: '🔥', category: 'streak', tier: 'bronze', points: 25, requirement: 3, progress: 3, unlockedAt: '2024-01-10' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Complete 7 consecutive days', icon: '🔥', category: 'streak', tier: 'silver', points: 50, requirement: 7, progress: 7, unlockedAt: '2024-01-14' },
  { id: 'streak-30', name: 'Month Master', description: 'Complete 30 consecutive days', icon: '🔥', category: 'streak', tier: 'gold', points: 150, requirement: 30, progress: 14 },
  { id: 'streak-100', name: 'Century Streak', description: 'Complete 100 consecutive days', icon: '🔥', category: 'streak', tier: 'platinum', points: 500, requirement: 100, progress: 14 },
  { id: 'streak-365', name: 'Legendary Coder', description: 'Complete 365 consecutive days', icon: '🔥', category: 'streak', tier: 'diamond', points: 2000, requirement: 365, progress: 14 },

  // Problem Solving Achievements
  { id: 'solve-1', name: 'First Blood', description: 'Solve your first problem', icon: '💻', category: 'problem_solving', tier: 'bronze', points: 10, requirement: 1, progress: 1, unlockedAt: '2024-01-01' },
  { id: 'solve-50', name: 'Problem Hunter', description: 'Solve 50 problems', icon: '💻', category: 'problem_solving', tier: 'bronze', points: 50, requirement: 50, progress: 50, unlockedAt: '2024-01-20' },
  { id: 'solve-100', name: 'Problem Crusher', description: 'Solve 100 problems', icon: '💻', category: 'problem_solving', tier: 'silver', points: 100, requirement: 100, progress: 100, unlockedAt: '2024-02-15' },
  { id: 'solve-500', name: 'Problem Master', description: 'Solve 500 problems', icon: '💻', category: 'problem_solving', tier: 'gold', points: 300, requirement: 500, progress: 156 },
  { id: 'solve-1000', name: 'Problem Legend', description: 'Solve 1000 problems', icon: '💻', category: 'problem_solving', tier: 'platinum', points: 750, requirement: 1000, progress: 156 },

  // Challenge Participation
  { id: 'challenge-1', name: 'Challenger', description: 'Join your first challenge', icon: '🏆', category: 'challenge', tier: 'bronze', points: 15, requirement: 1, progress: 1, unlockedAt: '2024-01-02' },
  { id: 'challenge-5', name: 'Team Player', description: 'Join 5 challenges', icon: '🏆', category: 'challenge', tier: 'bronze', points: 40, requirement: 5, progress: 3 },
  { id: 'challenge-10', name: 'Challenge Veteran', description: 'Complete 10 challenges', icon: '🏆', category: 'challenge', tier: 'silver', points: 100, requirement: 10, progress: 3 },
  { id: 'challenge-25', name: 'Challenge Master', description: 'Complete 25 challenges', icon: '🏆', category: 'challenge', tier: 'gold', points: 250, requirement: 25, progress: 3 },
  { id: 'challenge-create-1', name: 'Challenge Creator', description: 'Create your first challenge', icon: '🏆', category: 'challenge', tier: 'bronze', points: 25, requirement: 1, progress: 1, unlockedAt: '2024-01-05' },
  { id: 'challenge-create-10', name: 'Community Leader', description: 'Create 10 challenges', icon: '🏆', category: 'challenge', tier: 'silver', points: 100, requirement: 10, progress: 2 },

  // Difficulty-Based Achievements
  { id: 'easy-50', name: 'Easy Peasy', description: 'Solve 50 Easy problems', icon: '🎯', category: 'difficulty', tier: 'bronze', points: 30, requirement: 50, progress: 45 },
  { id: 'medium-50', name: 'Medium Rare', description: 'Solve 50 Medium problems', icon: '🎯', category: 'difficulty', tier: 'silver', points: 75, requirement: 50, progress: 35 },
  { id: 'hard-50', name: 'Hard Core', description: 'Solve 50 Hard problems', icon: '🎯', category: 'difficulty', tier: 'gold', points: 150, requirement: 50, progress: 12 },
  { id: 'all-100', name: 'Difficulty Master', description: 'Solve 100 problems of each difficulty', icon: '🎯', category: 'difficulty', tier: 'platinum', points: 500, requirement: 300, progress: 92 },

  // Social Achievements
  { id: 'invite-3', name: 'Social Butterfly', description: 'Invite 3 friends to join', icon: '👥', category: 'social', tier: 'bronze', points: 30, requirement: 3, progress: 2 },
  { id: 'influence-10', name: 'Influencer', description: 'Have 10 people join your challenges', icon: '👥', category: 'social', tier: 'silver', points: 100, requirement: 10, progress: 5 },
  { id: 'help-50', name: 'Community Hero', description: 'Help 50 members through challenges', icon: '👥', category: 'social', tier: 'gold', points: 200, requirement: 50, progress: 12 },

  // Special Achievements
  { id: 'speed-demon', name: 'Speed Demon', description: 'Solve 10 problems in one day', icon: '⚡', category: 'special', tier: 'silver', points: 75, requirement: 10, progress: 4 },
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete 7 days without missing any target', icon: '⚡', category: 'special', tier: 'silver', points: 100, requirement: 7, progress: 7, unlockedAt: '2024-01-14' },
  { id: 'comeback', name: 'Comeback King', description: 'Recover from a 7-day streak loss', icon: '⚡', category: 'special', tier: 'gold', points: 150, requirement: 1, progress: 0 },
  { id: 'zero-penalty', name: 'Zero Penalty', description: 'Complete a challenge with no penalties', icon: '⚡', category: 'special', tier: 'gold', points: 200, requirement: 1, progress: 0 },
];

export const getUserTier = (points: number): UserTier => {
  if (points >= 3001) return 'diamond';
  if (points >= 1501) return 'platinum';
  if (points >= 501) return 'gold';
  if (points >= 101) return 'silver';
  return 'bronze';
};

export const getTierInfo = (tier: UserTier): TierInfo => {
  return tierConfig.find(t => t.tier === tier) || tierConfig[0];
};

export const calculateUserTierProgress = (points: number): UserTierProgress => {
  const currentTier = getUserTier(points);
  const currentTierInfo = getTierInfo(currentTier);
  const currentTierIndex = tierConfig.findIndex(t => t.tier === currentTier);
  const nextTierInfo = currentTierIndex < tierConfig.length - 1 ? tierConfig[currentTierIndex + 1] : null;

  const pointsInCurrentTier = points - currentTierInfo.minPoints;
  const tierRange = currentTierInfo.maxPoints - currentTierInfo.minPoints;
  const progressPercentage = nextTierInfo ? Math.min(100, (pointsInCurrentTier / tierRange) * 100) : 100;
  const pointsToNextTier = nextTierInfo ? nextTierInfo.minPoints - points : 0;

  return {
    currentTier,
    totalPoints: points,
    currentTierInfo,
    nextTierInfo,
    pointsToNextTier,
    progressPercentage,
  };
};

export const mockUserPoints = 650; // Gold tier

export const mockGamificationStats: GamificationStats = {
  totalPoints: mockUserPoints,
  currentTier: getUserTier(mockUserPoints),
  achievementsUnlocked: mockAchievements.filter(a => a.unlockedAt).length,
  totalAchievements: mockAchievements.length,
  recentAchievements: mockAchievements.filter(a => a.unlockedAt).slice(0, 3),
  nextAchievements: mockAchievements.filter(a => !a.unlockedAt).slice(0, 3),
};
