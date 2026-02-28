import { challengeApi, dashboardApi } from "@/lib/api";
import type { CreateChallengePayload } from "@/types/duel";

// ============================================================================
// Duel Service — Centralized API call layer
// All duel-related API interactions go through here.
// React Query hooks (src/hooks/) call these functions as queryFn / mutationFn.
// ============================================================================

/**
 * Fetch all challenges the user can see.
 */
export const fetchChallenges = async (params?: {
    status?: string;
    owned?: boolean;
}) => {
    const response = await challengeApi.getAll(params);
    if (response.success && response.data) {
        return response.data;
    }
    throw new Error(response.message || "Failed to fetch challenges");
};

/**
 * Fetch a single challenge by ID.
 */
export const fetchChallenge = async (id: string) => {
    const response = await challengeApi.getById(id);
    if (response.success && response.data) {
        return response.data;
    }
    throw new Error(response.message || "Failed to fetch challenge");
};

/**
 * Fetch leaderboard for a specific challenge.
 */
export const fetchChallengeLeaderboard = async (challengeId: string) => {
    const response = await dashboardApi.getChallengeLeaderboard(challengeId);
    if (response.success && response.data) {
        return response.data;
    }
    throw new Error(response.message || "Failed to fetch leaderboard");
};

/**
 * Join a challenge.
 */
export const joinChallenge = async (id: string) => {
    const response = await challengeApi.join(id);
    if (response.success) {
        return response;
    }
    throw new Error(response.message || "Failed to join challenge");
};

/**
 * Create a new challenge.
 */
export const createChallenge = async (data: CreateChallengePayload) => {
    const response = await challengeApi.create(data);
    if (response.success) {
        return response.data;
    }
    throw new Error(response.message || "Failed to create challenge");
};

/**
 * Update challenge status (activate, complete, etc.).
 */
export const updateChallengeStatus = async (
    id: string,
    status: string
) => {
    const response = await challengeApi.updateStatus(id, status);
    if (response.success) {
        return response.data;
    }
    throw new Error(response.message || "Failed to update challenge status");
};

/**
 * Fetch dashboard overview, today status, and stats in parallel.
 */
export const fetchDashboardStats = async () => {
    const [dashboardResponse, todayResponse, statsResponse] =
        await Promise.all([
            dashboardApi.getOverview(),
            dashboardApi.getTodayStatus(),
            dashboardApi.getStats(),
        ]);

    const statsData = statsResponse.success ? statsResponse.data : null;
    const todaySummary = todayResponse?.data?.summary;
    const dashboardSummary = dashboardResponse?.data?.summary;

    return {
        todayStatus:
            todaySummary?.completed === todaySummary?.totalChallenges
                ? ("completed" as const)
                : ("pending" as const),
        todaySolved: todaySummary?.completed || 0,
        todayTarget: todaySummary?.totalChallenges || 0,
        currentStreak: statsData?.currentStreak || 0,
        longestStreak: statsData?.longestStreak || 0,
        totalPenalties: statsData?.totalPenalties || 0,
        activeChallenges: dashboardSummary?.activeChallenges || 0,
        totalSolved: statsData?.totalSubmissions || 0,
    };
};

/**
 * Fetch activity heatmap data.
 */
export const fetchActivityHeatmap = async () => {
    const response = await dashboardApi.getActivityHeatmap();
    if (response.success && response.data) {
        return response.data;
    }
    return [];
};

/**
 * Fetch submission chart data.
 */
export const fetchSubmissionChart = async () => {
    const response = await dashboardApi.getSubmissionChart();
    if (response.success && response.data) {
        return response.data;
    }
    return [];
};

/**
 * Fetch global leaderboard.
 */
export const fetchGlobalLeaderboard = async () => {
    const response = await dashboardApi.getGlobalLeaderboard();
    if (response.success && response.data) {
        return response.data;
    }
    throw new Error(response.message || "Failed to fetch leaderboard data");
};
