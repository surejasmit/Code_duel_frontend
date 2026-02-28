import { useQuery } from "@tanstack/react-query";
import { authApi, leetcodeApi } from "@/lib/api";

// ============================================================================
// LeetCode Profile React Query Hooks
// Replaces Leetcode.tsx's loadProfile() with cached queries.
// ============================================================================

/** Query keys for cache management */
export const leetcodeKeys = {
    profile: (username: string) => ["leetcode", "profile", username] as const,
    submissions: (username: string) =>
        ["leetcode", "submissions", username] as const,
    userProfile: ["user", "profile"] as const,
};

/**
 * Fetch LeetCode profile data.
 * Enabled only when a username is provided.
 */
export const useLeetcodeProfile = (username: string | undefined) => {
    return useQuery({
        queryKey: leetcodeKeys.profile(username || ""),
        queryFn: async () => {
            const response = await leetcodeApi.getProfile(username!);
            if (response.success) {
                return response.data;
            }
            throw new Error("Failed to load LeetCode profile");
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Fetch recent LeetCode submissions via the test endpoint.
 * Enabled only when a username is provided.
 */
export const useLeetcodeSubmissions = (username: string | undefined) => {
    return useQuery({
        queryKey: leetcodeKeys.submissions(username || ""),
        queryFn: async () => {
            const response = await leetcodeApi.testConnection(username!);
            if (response.success && response.data?.submissions) {
                return response.data.submissions;
            }
            return [];
        },
        enabled: !!username,
        staleTime: 5 * 60 * 1000,
    });
};

/**
 * Fetch the authenticated user's profile.
 */
export const useUserProfile = () => {
    return useQuery({
        queryKey: leetcodeKeys.userProfile,
        queryFn: async () => {
            const response = await authApi.getProfile();
            if (response.success) {
                return response.data;
            }
            throw new Error("Failed to load user profile");
        },
        staleTime: 10 * 60 * 1000, // 10 minutes — user profile rarely changes
    });
};
