import { create } from "zustand";
import type { DuelSubmission, OpponentStatus } from "@/types/duel";

// ============================================================================
// Duel Store — Zustand
// Client-side real-time duel state (timer, opponent, submissions).
// For server-state (API data, caching), see React Query hooks in src/hooks/.
// ============================================================================

interface DuelState {
    // --- Active duel session ---
    duelId: string | null;
    timer: number;
    isTimerRunning: boolean;
    opponentStatus: OpponentStatus;
    submissions: DuelSubmission[];

    // --- Code editor state ---
    currentCode: string;
    currentLanguage: string;

    // --- Actions ---
    setDuel: (id: string) => void;
    clearDuel: () => void;
    updateTimer: (time: number) => void;
    setTimerRunning: (running: boolean) => void;
    updateOpponent: (status: OpponentStatus) => void;
    addSubmission: (submission: DuelSubmission) => void;
    clearSubmissions: () => void;
    setCode: (code: string) => void;
    setLanguage: (language: string) => void;
}

const initialState = {
    duelId: null,
    timer: 0,
    isTimerRunning: false,
    opponentStatus: "waiting" as OpponentStatus,
    submissions: [],
    currentCode: "// Start coding here...",
    currentLanguage: "javascript",
};

export const useDuelStore = create<DuelState>((set) => ({
    ...initialState,

    // Set active duel ID
    setDuel: (id) => set({ duelId: id }),

    // Reset all duel state when leaving a duel
    clearDuel: () => set({ ...initialState }),

    // Update timer value (from server tick or local countdown)
    updateTimer: (time) => set({ timer: time }),

    // Start/stop the timer
    setTimerRunning: (running) => set({ isTimerRunning: running }),

    // Update opponent's real-time status
    updateOpponent: (status) => set({ opponentStatus: status }),

    // Add a submission using functional update to prevent race conditions
    addSubmission: (submission) =>
        set((state) => ({
            submissions: [...state.submissions, submission],
        })),

    // Clear all submissions (e.g., when starting a new duel)
    clearSubmissions: () => set({ submissions: [] }),

    // Code editor state
    setCode: (code) => set({ currentCode: code }),
    setLanguage: (language) => set({ currentLanguage: language }),
}));
