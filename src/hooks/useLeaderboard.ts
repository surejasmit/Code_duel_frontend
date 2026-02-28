import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchGlobalLeaderboard } from "@/services/duelService";
import { LeaderboardEntry } from "@/types";

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

export const useLeaderboard = (
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
