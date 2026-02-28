import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchChallenges,
    fetchChallenge,
    fetchChallengeLeaderboard,
    joinChallenge,
    createChallenge,
    updateChallengeStatus,
} from "@/services/duelService";
import type { CreateChallengePayload } from "@/types/duel";

// ============================================================================
// Challenge React Query Hooks
// Replaces ChallengePage.tsx + Dashboard.tsx + CreateChallenge.tsx API patterns.
// ============================================================================

/** Query keys for cache management */
export const challengeKeys = {
    all: ["challenges"] as const,
    detail: (id: string) => ["challenge", id] as const,
    leaderboard: (id: string) => ["challenge", id, "leaderboard"] as const,
};

/**
 * Fetch all challenges with optional filters.
 * Used by Dashboard to show active challenges list.
 */
export const useChallenges = (params?: {
    status?: string;
    owned?: boolean;
}) => {
    return useQuery({
        queryKey: [...challengeKeys.all, params],
        queryFn: () => fetchChallenges(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

/**
 * Fetch a single challenge by ID.
 * Used by ChallengePage.
 */
export const useChallenge = (id: string | undefined) => {
    return useQuery({
        queryKey: challengeKeys.detail(id!),
        queryFn: () => fetchChallenge(id!),
        enabled: !!id,
    });
};

/**
 * Fetch leaderboard data for a specific challenge.
 */
export const useChallengeLeaderboard = (id: string | undefined) => {
    return useQuery({
        queryKey: challengeKeys.leaderboard(id!),
        queryFn: () => fetchChallengeLeaderboard(id!),
        enabled: !!id,
    });
};

/**
 * Mutation: Join a challenge.
 * On success, invalidates the challenge detail and challenges list cache.
 */
export const useJoinChallenge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => joinChallenge(id),
        onSuccess: (_data, id) => {
            // Invalidate related caches so UI auto-updates
            queryClient.invalidateQueries({ queryKey: challengeKeys.detail(id) });
            queryClient.invalidateQueries({
                queryKey: challengeKeys.leaderboard(id),
            });
            queryClient.invalidateQueries({ queryKey: challengeKeys.all });
        },
    });
};

/**
 * Mutation: Create a new challenge.
 * On success, invalidates the challenges list cache.
 */
export const useCreateChallenge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateChallengePayload) => createChallenge(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: challengeKeys.all });
        },
    });
};

/**
 * Mutation: Activate/update a challenge status.
 * On success, invalidates challenge detail and list caches.
 */
export const useActivateChallenge = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateChallengeStatus(id, status),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: challengeKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: challengeKeys.all });
        },
    });
};
