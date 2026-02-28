

/**
 * useLeaderboard Hook - React Hook for Dynamic Leaderboard Management
 * 
 * This hook provides a clean interface to the leaderboard engine with:
 * - Automatic sorting and ranking
 * - Memoized computations for performance
 * - Optional search filtering
 * - Optional pagination
 * - Rank change tracking
 * - User position lookup
 * 
 * @example
 * const { rankedEntries, currentUserEntry, topThree } = useLeaderboard(rawUsers);
 */

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  sortUsersByRanking,
  calculateRanks,
  getRankChanges,
  filterUsersByQuery,
  paginateEntries,
  getTotalPages,
  findUserEntry,
  getRankContext,
  sanitizeUsers,
  RankableUser,
  RankedEntry,
} from '@/utils/leaderboardEngine';
import { LeaderboardEntry } from '@/types';

/**
 * Configuration options for the leaderboard hook
 */
export interface UseLeaderboardOptions {
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable pagination */
  enablePagination?: boolean;
  /** Number of entries per page (if pagination enabled) */
  pageSize?: number;
  /** Track rank changes compared to previous data */
  trackChanges?: boolean;
  /** Current user ID for highlighting */
  currentUserId?: string;
  /** Show context around current user */
  showUserContext?: boolean;
  /** Number of users to show above/below current user in context */
  contextSize?: number;
}

/**
 * Return type for useLeaderboard hook
 */
export interface UseLeaderboardResult {
  /** Fully ranked and sorted leaderboard entries */
  rankedEntries: LeaderboardEntry[];
  /** Entries with rank change indicators (if trackChanges enabled) */
  entriesWithChanges: RankedEntry[];
  /** Top 3 entries for podium display */
  topThree: LeaderboardEntry[];
  /** Current user's entry (if currentUserId provided) */
  currentUserEntry: LeaderboardEntry | undefined;
  /** User's rank among all entries */
  currentUserRank: number | undefined;
  /** Total number of entries */
  totalEntries: number;
  /** Search query state */
  searchQuery: string;
  /** Update search query */
  setSearchQuery: (query: string) => void;
  /** Current page (1-indexed) */
  currentPage: number;
  /** Set current page */
  setCurrentPage: (page: number) => void;
  /** Total number of pages */
  totalPages: number;
  /** Paginated entries for current page */
  paginatedEntries: LeaderboardEntry[];
  /** Context entries around current user */
  userContextEntries: LeaderboardEntry[];
  /** Whether data is being processed */
  isProcessing: boolean;
  /** Refresh/recalculate rankings */
  refresh: () => void;
}

/**
 * Custom hook for managing leaderboard state and computations
 * 
 * @param rawUsers - Raw user data (can be from API or state)
 * @param options - Configuration options
 * @returns Comprehensive leaderboard data and controls
 */
export const useLeaderboard = (
  rawUsers: Partial<RankableUser>[],
  options: UseLeaderboardOptions = {}
): UseLeaderboardResult => {
  const {
    enableSearch = false,
    enablePagination = false,
    pageSize = 10,
    trackChanges = false,
    currentUserId,
    showUserContext = false,
    contextSize = 2,
  } = options;

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Store previous rankings for change detection
  const previousRankingsRef = useRef<LeaderboardEntry[]>([]);

  // Sanitize and validate input data
  // Memoized to avoid reprocessing on every render
  const validatedUsers = useMemo(() => {
    return sanitizeUsers(rawUsers);
  }, [rawUsers]);

  // Apply search filter if enabled
  // Memoized to avoid unnecessary filtering
  const filteredUsers = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) {
      return validatedUsers;
    }
    return filterUsersByQuery(validatedUsers, searchQuery);
  }, [validatedUsers, searchQuery, enableSearch]);

  // Sort and rank users
  // This is the core computation, heavily memoized
  const rankedEntries = useMemo(() => {
    setIsProcessing(true);
    
    // Perform sorting
    const sorted = sortUsersByRanking(filteredUsers);
    
    // Calculate ranks
    const ranked = calculateRanks(sorted);
    
    setIsProcessing(false);
    return ranked;
  }, [filteredUsers, refreshKey]); // refreshKey allows manual recalculation

  // Track rank changes if enabled
  const entriesWithChanges = useMemo(() => {
    if (!trackChanges) {
      return rankedEntries as RankedEntry[];
    }

    const withChanges = getRankChanges(
      rankedEntries,
      previousRankingsRef.current
    );

    // Update previous rankings for next comparison
    previousRankingsRef.current = rankedEntries;

    return withChanges;
  }, [rankedEntries, trackChanges]);

  // Get top 3 entries for podium
  const topThree = useMemo(() => {
    return rankedEntries.slice(0, 3);
  }, [rankedEntries]);

  // Find current user's entry
  const currentUserEntry = useMemo(() => {
    if (!currentUserId) return undefined;
    return findUserEntry(rankedEntries, currentUserId);
  }, [rankedEntries, currentUserId]);

  // Get current user's rank
  const currentUserRank = useMemo(() => {
    return currentUserEntry?.rank;
  }, [currentUserEntry]);

  // Get context entries around current user
  const userContextEntries = useMemo(() => {
    if (!showUserContext || !currentUserRank) {
      return [];
    }
    return getRankContext(rankedEntries, currentUserRank, contextSize);
  }, [rankedEntries, currentUserRank, showUserContext, contextSize]);

  // Pagination calculations
  const totalEntries = rankedEntries.length;
  const totalPages = useMemo(() => {
    if (!enablePagination) return 1;
    return getTotalPages(totalEntries, pageSize);
  }, [totalEntries, pageSize, enablePagination]);

  // Get paginated entries
  const paginatedEntries = useMemo(() => {
    if (!enablePagination) {
      return rankedEntries;
    }
    return paginateEntries(rankedEntries, currentPage, pageSize);
  }, [rankedEntries, currentPage, pageSize, enablePagination]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    if (enableSearch) {
      setCurrentPage(1);
    }
  }, [searchQuery, enableSearch]);

  // Ensure current page is valid when data changes
  useEffect(() => {
    if (enablePagination && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, enablePagination]);

  // Refresh function to force recalculation
  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    rankedEntries,
    entriesWithChanges,
    topThree,
    currentUserEntry,
    currentUserRank,
    totalEntries,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedEntries,
    userContextEntries,
    isProcessing,
    refresh,
  };
};

/**
 * Simplified version of useLeaderboard for basic use cases
 * Just handles sorting and ranking without extra features
 * 
 * @param rawUsers - Raw user data
 * @param currentUserId - Optional current user ID
 * @returns Basic leaderboard data
 */
export const useSimpleLeaderboard = (
  rawUsers: Partial<RankableUser>[],
  currentUserId?: string
) => {
  return useLeaderboard(rawUsers, {
    currentUserId,
    enableSearch: false,
    enablePagination: false,
    trackChanges: false,
  });
};

/**
 * Advanced version with all features enabled
 * 
 * @param rawUsers - Raw user data
 * @param currentUserId - Optional current user ID
 * @param pageSize - Entries per page
 * @returns Full-featured leaderboard data
 */
export const useAdvancedLeaderboard = (
  rawUsers: Partial<RankableUser>[],
  currentUserId?: string,
  pageSize: number = 10
) => {
  return useLeaderboard(rawUsers, {
    currentUserId,
    enableSearch: true,
    enablePagination: true,
    pageSize,
    trackChanges: true,
    showUserContext: true,
    contextSize: 2,
  });
};

export default useLeaderboard;

import { useQuery } from "@tanstack/react-query";
import { fetchGlobalLeaderboard } from "@/services/duelService";

// ============================================================================
// Leaderboard React Query Hook
// Replaces Leaderboard.tsx's loadLeaderboard() with a cached query.
// ============================================================================

/** Query keys for cache management */
export const leaderboardKeys = {
  global: ["leaderboard", "global"] as const,
};

/**
 * Fetch global leaderboard with extended cache.
 * Leaderboard data changes less frequently than other duel data.
 */
export const useGlobalLeaderboard = () => {
  return useQuery({
    queryKey: leaderboardKeys.global,
    queryFn: fetchGlobalLeaderboard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Client-side filtering, sorting, and ranking for leaderboard entries.
 * Works with data from useGlobalLeaderboard or any LeaderboardEntry[].
 */
type SortKey = "rank" | "totalSolved" | "currentStreak" | "penaltyAmount";

export const useClientLeaderboard = (
  data: LeaderboardEntry[],
  searchQuery: string,
  sortKey: SortKey,
  sortOrder: "asc" | "desc"
) => {
  const processedData = useMemo(() => {
    const filtered = data.filter((entry) =>
      entry.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey] ?? 0;
      const bValue = b[sortKey] ?? 0;

      return sortOrder === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [data, searchQuery, sortKey, sortOrder]);

  return processedData;
};
