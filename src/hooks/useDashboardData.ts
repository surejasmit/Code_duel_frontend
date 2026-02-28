import { useQuery } from "@tanstack/react-query";
import {
    fetchDashboardStats,
    fetchActivityHeatmap,
    fetchSubmissionChart,
} from "@/services/duelService";

// ============================================================================
// Dashboard React Query Hooks
// Replaces Dashboard.tsx's loadDashboardData() with cached, auto-refreshing queries.
// ============================================================================

/** Query keys for cache management */
export const dashboardKeys = {
    stats: ["dashboard", "stats"] as const,
    activity: ["dashboard", "activity"] as const,
    chart: ["dashboard", "chart"] as const,
};

/**
 * Fetch dashboard stats (overview + today status + stats) as a single cached query.
 * Combines 3 API calls into one query with parallel fetching inside the service.
 */
export const useDashboardStats = () => {
    return useQuery({
        queryKey: dashboardKeys.stats,
        queryFn: fetchDashboardStats,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: true,
    });
};

/**
 * Fetch activity heatmap data with longer cache (changes infrequently).
 */
export const useActivityHeatmap = () => {
    return useQuery({
        queryKey: dashboardKeys.activity,
        queryFn: fetchActivityHeatmap,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Fetch submission chart data.
 */
export const useSubmissionChart = () => {
    return useQuery({
        queryKey: dashboardKeys.chart,
        queryFn: fetchSubmissionChart,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};
