import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  User,
  Challenge,
  Stats,
  ActivityData,
  ChartData,
  ChallengeInvite,
  UserSearchResult,
} from "@/types";

// API Base URL - Change this to your backend URL
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
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

export interface RegisterResponse extends LoginResponse { }

export interface DashboardResponse {
  summary: {
    totalChallenges: number;
    activeChallenges: number;
    completedChallenges: number;
    totalPenalties: number;
  };
  activeChallenges: Challenge[];
  recentActivity: any[];
}

export interface TodayStatusResponse {
  date: string;
  challenges: any[];
  summary: {
    totalChallenges: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

// ============================================================================
// AUTH APIs
// ============================================================================// API implementations
export const authApi = {
  login: async (emailOrUsername: string, password: string) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/api/auth/login",
      {
        emailOrUsername,
        password,
      }
    );
    return response.data;
  },

  register: async (
    email: string,
    username: string,
    password: string,
    leetcodeUsername: string
  ) => {
    const response = await api.post<ApiResponse<RegisterResponse>>(
      "/api/auth/register",
      {
        email,
        username,
        password,
        leetcodeUsername,
      }
    );
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<any>>("/api/auth/profile");
    return response.data;
  },

  updateProfile: async (data: { leetcodeUsername?: string }) => {
    const response = await api.put<ApiResponse<any>>("/api/auth/profile", data);
    return response.data;
  },
};

// ============================================================================
// CHALLENGE APIs
// ============================================================================
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
    const response = await api.post<ApiResponse<Challenge>>(
      "/api/challenges",
      data
    );
    return response.data;
  },

  getAll: async (signal?: AbortSignal, params?: { status?: string; owned?: boolean }) => {
    const response = await api.get<ApiResponse<Challenge[]>>(
      "/api/challenges",
      { params, signal }
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Challenge>>(
      `/api/challenges/${id}`
    );
    return response.data;
  },

  join: async (id: string) => {
    const response = await api.post<ApiResponse<any>>(
      `/api/challenges/${id}/join`
    );
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<ApiResponse<Challenge>>(
      `/api/challenges/${id}/status`,
      {
        status,
      }
    );
    return response.data;
  },
};

// ============================================================================
// INVITE APIs
// NOTE: These endpoints are pending backend implementation.
// Backend spec (challenge.routes.js) does not yet include invite routes.
// The UI is ready; calls will gracefully fail (try/catch) until the backend
// adds: POST /api/challenges/:id/invite, GET /api/invites,
//        POST /api/challenges/:id/invite/accept|reject
//        GET  /api/users/search
// ============================================================================
export const inviteApi = {
  // POST /api/challenge/:id/invite
  sendInvite: async (challengeId: string, userId: string) => {
    const response = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite`,
      { userId }
    );
    return response.data;
  },

  getMyInvites: async () => {
    const response = await api.get<ApiResponse<ChallengeInvite[]>>("/api/invites");
    return response.data;
  },

  // POST /api/challenge/:id/invite/accept
  acceptInvite: async (challengeId: string) => {
    const response = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite/accept`
    );
    return response.data;
  },

  // POST /api/challenge/:id/invite/reject
  rejectInvite: async (challengeId: string) => {
    const response = await api.post<ApiResponse<ChallengeInvite>>(
      `/api/challenge/${challengeId}/invite/reject`
    );
    return response.data;
  },
};

// ============================================================================
// USER APIs
// ============================================================================
export const userApi = {
  searchUsers: async (query: string, signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<UserSearchResult[]>>("/api/users/search", {
      params: { q: query },
      signal,
    });
    return response.data;
  },
};

// ============================================================================
// DASHBOARD APIs
// ============================================================================
export const dashboardApi = {
  getOverview: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<DashboardResponse>>(
      "/api/dashboard",
      { signal }
    );
    return response.data;
  },

  getTodayStatus: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<TodayStatusResponse>>(
      "/api/dashboard/today",
      { signal }
    );
    return response.data;
  },

  getChallengeProgress: async (challengeId: string, signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}`,
      { signal }
    );
    return response.data;
  },

  getChallengeLeaderboard: async (challengeId: string, signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/dashboard/challenge/${challengeId}/leaderboard`,
      { signal }
    );
    return response.data;
  },

  getActivityHeatmap: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/dashboard/activity-heatmap",
      { signal }
    );
    return response.data;
  },

  getStats: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any>>("/api/dashboard/stats", { signal });
    return response.data;
  },

  getSubmissionChart: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any>>(
      "/api/dashboard/submission-chart",
      { signal }
    );
    return response.data;
  },

  getGlobalLeaderboard: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResponse<any[]>>(
      "/api/dashboard/leaderboard",
      { signal }
    );
    return response.data;
  },
};

// ============================================================================
// LEETCODE APIs
// ============================================================================
export const leetcodeApi = {
  storeSession: async (
    cookie: string,
    csrfToken: string,
    expiresAt: string
  ) => {
    const response = await api.post<ApiResponse<any>>("/api/leetcode/session", {
      cookie,
      csrfToken,
      expiresAt,
    });
    return response.data;
  },

  getSessionStatus: async () => {
    const response = await api.get<ApiResponse<any>>("/api/leetcode/session");
    return response.data;
  },

  invalidateSession: async () => {
    const response = await api.delete<ApiResponse<any>>(
      "/api/leetcode/session"
    );
    return response.data;
  },

  getProfile: async (username: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/profile/${username}`
    );
    return response.data;
  },

  testConnection: async (username: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/test/${username}`
    );
    return response.data;
  },

  getProblemMetadata: async (titleSlug: string) => {
    const response = await api.get<ApiResponse<any>>(
      `/api/leetcode/problem/${titleSlug}`
    );
    return response.data;
  },
};

export default api;
