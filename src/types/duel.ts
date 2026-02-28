// ============================================================================
// Centralized Duel Types
// ============================================================================

/** Lifecycle status of a duel / challenge */
export type DuelStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

/** Opponent real-time status during a live duel */
export type OpponentStatus = "waiting" | "coding" | "submitted" | "disconnected";

/** A single submission entry in the duel store */
export interface DuelSubmission {
    id: string;
    challengeId: string;
    userId: string;
    code: string;
    language: string;
    status: "pending" | "accepted" | "rejected";
    submittedAt: string;
}

/** Shape of the challenge data returned by the API */
export interface DuelChallenge {
    id: string;
    name: string;
    description: string;
    minSubmissionsPerDay: number;
    difficultyFilter: string[] | null;
    uniqueProblemConstraint: boolean;
    penaltyAmount: number;
    startDate: string;
    endDate: string;
    status: DuelStatus;
    ownerId: string;
    createdAt: string;
    members?: DuelLeaderboardEntry[];
}

/** A member/participant on a challenge leaderboard */
export interface DuelLeaderboardEntry {
    userId: string;
    userName?: string;
    username?: string;
    avatar?: string;
    totalSolved?: number;
    currentStreak?: number;
    missedDays?: number;
    penaltyAmount?: number;
    rank?: number;
}

/** Dashboard stats bundle */
export interface DashboardStatsBundle {
    todayStatus: "completed" | "failed" | "pending";
    todaySolved: number;
    todayTarget: number;
    currentStreak: number;
    longestStreak: number;
    totalPenalties: number;
    activeChallenges: number;
    totalSolved: number;
}

/** Create challenge form payload */
export interface CreateChallengePayload {
    name: string;
    description: string;
    minSubmissionsPerDay: number;
    difficultyFilter: string[];
    uniqueProblemConstraint: boolean;
    penaltyAmount: number;
    startDate: string;
    endDate: string;
    visibility: string;
}
