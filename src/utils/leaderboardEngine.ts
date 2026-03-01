/**
 * Leaderboard Engine - Dynamic Client-Side Ranking System
 * 
 * This module provides scalable, optimized ranking logic for the leaderboard.
 * It handles sorting, rank calculation, tie-breaking, and rank change detection.
 * 
 * Ranking Criteria (Priority Order):
 * 1. Current Streak (primary)
 * 2. Total Problems Solved (secondary)
 * 3. Longest Streak (tertiary, optional)
 * 4. Username (alphabetical - stable fallback)
 */

import { LeaderboardEntry } from '@/types';

/**
 * User data required for ranking (without pre-calculated rank)
 */
export interface RankableUser {
  userId: string;
  userName: string;
  avatar?: string;
  totalSolved: number;
  currentStreak: number;
  longestStreak?: number;
  missedDays: number;
  penaltyAmount: number;
}

/**
 * Ranked entry with position and optional change indicator
 */
export interface RankedEntry extends LeaderboardEntry {
  rankChange?: 'up' | 'down' | 'same' | 'new';
  previousRank?: number;
}

/**
 * Comparison result for tie-breaking
 */
type ComparisonResult = -1 | 0 | 1;

/**
 * Compare two users based on ranking criteria
 * Returns negative if a should rank higher, positive if b should rank higher, 0 if equal
 * 
 * Priority:
 * 1. Higher current streak wins
 * 2. If equal → Higher total solved wins
 * 3. If equal → Higher longest streak wins (if available)
 * 4. If equal → Alphabetical order (stable sorting)
 */
const compareUsers = (a: RankableUser, b: RankableUser): ComparisonResult => {
  // Primary: Current Streak (descending - higher is better)
  if (b.currentStreak !== a.currentStreak) {
    return (b.currentStreak - a.currentStreak) as ComparisonResult;
  }

  // Secondary: Total Solved (descending - higher is better)
  if (b.totalSolved !== a.totalSolved) {
    return (b.totalSolved - a.totalSolved) as ComparisonResult;
  }

  // Tertiary: Longest Streak (descending - higher is better)
  const aLongest = a.longestStreak ?? 0;
  const bLongest = b.longestStreak ?? 0;
  if (bLongest !== aLongest) {
    return (bLongest - aLongest) as ComparisonResult;
  }

  // Fallback: Alphabetical by username (ascending - stable sort)
  return a.userName.localeCompare(b.userName) as ComparisonResult;
};

/**
 * Sort users by ranking criteria
 * Returns a new sorted array without mutating the original
 * 
 * @param users - Array of users to rank
 * @returns Sorted array of users (does not mutate original)
 */
export const sortUsersByRanking = (users: RankableUser[]): RankableUser[] => {
  // Create shallow copy to avoid mutating original array
  return [...users].sort(compareUsers);
};

/**
 * Calculate ranks for sorted users
 * Assigns rank positions (1, 2, 3, etc.)
 * 
 * Uses standard competition ranking:
 * - Users with identical metrics get the same rank
 * - Next rank skips accordingly (e.g., if two users tie for rank 2, next is rank 4)
 * 
 * @param sortedUsers - Pre-sorted array of users
 * @returns Array of users with rank property assigned
 */
export const calculateRanks = (sortedUsers: RankableUser[]): LeaderboardEntry[] => {
  if (sortedUsers.length === 0) return [];

  const rankedUsers: LeaderboardEntry[] = [];
  let currentRank = 1;

  sortedUsers.forEach((user, index) => {
    // Check if current user has same metrics as previous user (tie)
    if (index > 0) {
      const prev = sortedUsers[index - 1];
      const isTied =
        user.currentStreak === prev.currentStreak &&
        user.totalSolved === prev.totalSolved &&
        (user.longestStreak ?? 0) === (prev.longestStreak ?? 0);

      if (!isTied) {
        currentRank = index + 1;
      }
    }

    rankedUsers.push({
      rank: currentRank,
      userId: user.userId,
      userName: user.userName,
      avatar: user.avatar,
      totalSolved: user.totalSolved,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      missedDays: user.missedDays,
      penaltyAmount: user.penaltyAmount,
    });
  });

  return rankedUsers;
};

/**
 * Apply tie-breaking logic and calculate ranks
 * This is a convenience function that combines sorting and rank calculation
 * 
 * @param users - Unsorted array of users
 * @returns Ranked and sorted leaderboard entries
 */
export const applyTieBreaking = (users: RankableUser[]): LeaderboardEntry[] => {
  const sorted = sortUsersByRanking(users);
  return calculateRanks(sorted);
};

/**
 * Detect rank changes by comparing current rankings with previous rankings
 * Useful for showing up/down arrows or highlighting changes
 * 
 * @param currentRankings - New calculated rankings
 * @param previousRankings - Previous rankings to compare against
 * @returns Rankings with rank change indicators
 */
export const getRankChanges = (
  currentRankings: LeaderboardEntry[],
  previousRankings: LeaderboardEntry[]
): RankedEntry[] => {
  // Create a map of previous ranks for quick lookup
  const previousRankMap = new Map<string, number>();
  previousRankings.forEach((entry) => {
    previousRankMap.set(entry.userId, entry.rank);
  });

  return currentRankings.map((entry) => {
    const prevRank = previousRankMap.get(entry.userId);

    if (prevRank === undefined) {
      // User wasn't in previous rankings
      return { ...entry, rankChange: 'new' as const };
    }

    if (entry.rank < prevRank) {
      // Rank improved (lower number = better)
      return { ...entry, rankChange: 'up' as const, previousRank: prevRank };
    }

    if (entry.rank > prevRank) {
      // Rank decreased
      return { ...entry, rankChange: 'down' as const, previousRank: prevRank };
    }

    // Rank unchanged
    return { ...entry, rankChange: 'same' as const, previousRank: prevRank };
  });
};

/**
 * Filter users by search query
 * Searches in userName field (case-insensitive)
 * 
 * @param users - Array of users to filter
 * @param query - Search query string
 * @returns Filtered array of users
 */
export const filterUsersByQuery = (
  users: RankableUser[],
  query: string
): RankableUser[] => {
  if (!query.trim()) return users;

  const lowerQuery = query.toLowerCase();
  return users.filter((user) =>
    user.userName.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Paginate leaderboard entries
 * 
 * @param entries - Full array of entries
 * @param page - Current page (1-indexed)
 * @param pageSize - Number of entries per page
 * @returns Paginated slice of entries
 */
export const paginateEntries = (
  entries: LeaderboardEntry[],
  page: number,
  pageSize: number
): LeaderboardEntry[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return entries.slice(startIndex, endIndex);
};

/**
 * Get total number of pages for pagination
 * 
 * @param totalEntries - Total number of entries
 * @param pageSize - Number of entries per page
 * @returns Total number of pages
 */
export const getTotalPages = (totalEntries: number, pageSize: number): number => {
  return Math.ceil(totalEntries / pageSize);
};

/**
 * Find a specific user's entry in the leaderboard
 * 
 * @param entries - Leaderboard entries
 * @param userId - User ID to find
 * @returns User's leaderboard entry or undefined
 */
export const findUserEntry = (
  entries: LeaderboardEntry[],
  userId: string
): LeaderboardEntry | undefined => {
  return entries.find((entry) => entry.userId === userId);
};

/**
 * Get users around a specific rank (context view)
 * Useful for showing users near the current user's position
 * 
 * @param entries - Full leaderboard entries
 * @param targetRank - Rank to center around
 * @param contextSize - Number of entries to show above and below
 * @returns Slice of entries around the target rank
 */
export const getRankContext = (
  entries: LeaderboardEntry[],
  targetRank: number,
  contextSize: number = 2
): LeaderboardEntry[] => {
  const targetIndex = entries.findIndex((entry) => entry.rank === targetRank);
  if (targetIndex === -1) return [];

  const startIndex = Math.max(0, targetIndex - contextSize);
  const endIndex = Math.min(entries.length, targetIndex + contextSize + 1);

  return entries.slice(startIndex, endIndex);
};

/**
 * Validate user data for ranking
 * Ensures all required fields are present and valid
 * 
 * @param user - User to validate
 * @returns true if valid, false otherwise
 */
export const isValidRankableUser = (user: Partial<RankableUser>): user is RankableUser => {
  return (
    typeof user.userId === 'string' &&
    typeof user.userName === 'string' &&
    typeof user.totalSolved === 'number' &&
    typeof user.currentStreak === 'number' &&
    typeof user.missedDays === 'number' &&
    typeof user.penaltyAmount === 'number' &&
    user.userId.length > 0 &&
    user.userName.length > 0 &&
    user.totalSolved >= 0 &&
    user.currentStreak >= 0 &&
    user.missedDays >= 0 &&
    user.penaltyAmount >= 0
  );
};

/**
 * Sanitize and validate an array of users for ranking
 * Filters out invalid entries and returns clean data
 * 
 * @param users - Array of potentially incomplete user data
 * @returns Array of validated rankable users
 */
export const sanitizeUsers = (users: Partial<RankableUser>[]): RankableUser[] => {
  return users.filter(isValidRankableUser);
};
