import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  User,
  Challenge,
  Stats,
  ActivityData,
  ChartData,
  ChallengeInvite,
  UserSearchResult,
  LeaderboardEntry,
  LeetCodeProfile,
} from "@/types";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    leetcodeUsername: string;
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse extends LoginResponse {}

export interface DashboardResponse {
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    totalPenalties: number;
  };
  activeChallenges: Challenge[];
  recentActivity: Record<string, unknown>[];
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

// AUTH APIs
export const authApi = {
  login: async (emailOrUsername: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>("/api/auth/login", {
      emailOrUsername,
      password,
    });
    return res.data;
  },

  register: async (
    email: string,
    username: string,
    password: string,
    leetcodeUsername: string
  ) => {
    const res = await api.post<ApiResponse<RegisterResponse>>(
      "/api/auth/register",
      { email, username, password, leetcodeUsername }
    );
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>("/api/auth/profile");
    return res.data;
  },

  updateProfile: async (data: { leetcodeUsername?: string }) => {
    const res = await api.put<ApiResponse<User>>("/api/auth/profile", data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>(
      "/api/auth/forgot-password",
      { email }
    );
    return res.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await api.post<ApiResponse<{ message: string }>>(
      "/api/auth/reset-password",
      { token, newPassword }
    );
    return res.data;
  },
};

// CHALLENGE APIs
export const challengeApi = {
  create: async (data: {
    name: string;
    description: string;
    minSubmissionsPerDay: number;
    difficultyFilter: string[];
    uniqueProblemConstraint: boolean;
    penaltyAmount: number;
    startDate: string;
    endDate: string;
    visibility: string;
  }) => {
    const res = await api.post<ApiResponse<Challenge>>("/api/challenges", data);
    return res.data;
  },

  getAll: async (
    signal?: AbortSignal,
    params?: { status?: string; owned?: boolean }
  ) => {
    const res = await api.get<ApiResponse<Challenge[]>>("/api/challenges", {
      params,
      signal,
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<Challenge>>(
      `/api/challenges/${id}`
    );
    return res.data;
  },

  join: async (id: string) => {
    const res = await api.post<ApiResponse<Challenge>>(
      `/api/challenges/${id}/join`
    );
    return res.data;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Challenge>>(
      `/api/challenges/${id}/status`,
      { status }
    );
    return res.data;
  },

  generateInvite: async (
    challengeId: string,
    data: { expiresInHours: number; maxUses: number }
  ) => {
    const res = await api.post<ApiResponse<any>>(
      `/api/challenges/${challengeId}/invite`,
      data
    );
    return res.data;
  },

  joinByCode: async (code: string) => {
    const res = await api.post<ApiResponse<any>>(
      "/api/challenges/join-by-code",
      { code }
    );
    return res.data;
  },
};

// INVITE APIs
export const inviteApi = {
  sendInvite: async (challengeId: string, userId: string) => {
    const res = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite`,
      { userId }
    );
    return res.data;
  },

  getMyInvites: async () => {
    const res = await api.get<ApiResponse<ChallengeInvite[]>>("/api/invites");
    return res.data;
  },

  acceptInvite: async (challengeId: string) => {
    const res = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite/accept`
    );
    return res.data;
  },

  rejectInvite: async (challengeId: string) => {
    const res = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite/reject`
    );
    return res.data;
  },
};

// USER APIs
export const userApi = {
  searchUsers: async (query: string, signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<UserSearchResult[]>>(
      "/api/users/search",
      { params: { q: query }, signal }
    );
    return res.data;
  },
};

// DASHBOARD APIs
export const dashboardApi = {
  getOverview: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<DashboardResponse>>(
      "/api/dashboard",
      { signal }
    );
    return res.data;
  },

  getTodayStatus: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<TodayStatusResponse>>(
      "/api/dashboard/today",
      { signal }
    );
    return res.data;
  },

  getChallengeProgress: async (challengeId: string, signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}`,
      { signal }
    );
    return res.data;
  },

  getChallengeLeaderboard: async (challengeId: string, signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}/leaderboard`,
      { signal }
    );
    return res.data;
  },

  getActivityHeatmap: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<ActivityData[]>>(
      "/api/dashboard/activity-heatmap",
      { signal }
    );
    return res.data;
  },

  getStats: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<DashboardStats>>(
      "/api/dashboard/stats",
      { signal }
    );
    return res.data;
  },

  getSubmissionChart: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<ChartData[]>>(
      "/api/dashboard/submission-chart",
      { signal }
    );
    return res.data;
  },

  getGlobalLeaderboard: async (signal?: AbortSignal) => {
    const res = await api.get<ApiResponse<LeaderboardEntry[]>>(
      "/api/dashboard/leaderboard",
      { signal }
    );
    return res.data;
  },
};

// LEETCODE APIs
export const leetcodeApi = {
  storeSession: async (
    cookie: string,
    csrfToken: string,
    expiresAt: string
  ) => {
    const res = await api.post<ApiResponse<unknown>>(
      "/api/leetcode/session",
      { cookie, csrfToken, expiresAt }
    );
    return res.data;
  },

  getSessionStatus: async () => {
    const res = await api.get<ApiResponse<SessionStatus>>(
      "/api/leetcode/session"
    );
    return res.data;
  },

  invalidateSession: async () => {
    const res = await api.delete<ApiResponse<null>>(
      "/api/leetcode/session"
    );
    return res.data;
  },

  getProfile: async (username: string) => {
    const res = await api.get<ApiResponse<LeetCodeProfile>>(
      `/api/leetcode/profile/${username}`
    );
    return res.data;
  },
};

// GAMIFICATION APIs
export const gamificationApi = {
  getAllAchievements: async () => {
    const res = await api.get<ApiResponse<any[]>>("/api/achievements");
    return res.data;
  },

  getUserAchievements: async (userId?: string) => {
    const url = userId
      ? `/api/achievements/user/${userId}`
      : "/api/achievements/user";
    const res = await api.get<ApiResponse<any[]>>(url);
    return res.data;
  },

  unlockAchievement: async (achievementId: string) => {
    const res = await api.post<ApiResponse<any>>("/api/achievements/unlock", {
      achievementId,
    });
    return res.data;
  },

  getCurrentTier: async () => {
    const res = await api.get<ApiResponse<any>>("/api/tiers/current");
    return res.data;
  },

  getTierProgress: async () => {
    const res = await api.get<ApiResponse<any>>("/api/tiers/progress");
    return res.data;
  },

  getGamificationStats: async () => {
    const res = await api.get<ApiResponse<any>>("/api/gamification/stats");
    return res.data;
  },
};

export default api;
