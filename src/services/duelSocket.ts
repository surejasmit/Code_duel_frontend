import { useDuelStore } from "@/store/duelStore";
import type { DuelSubmission, OpponentStatus } from "@/types/duel";

// ============================================================================
// Duel Socket Service — Real-time event handler
// Placeholder for WebSocket / Socket.io integration.
// Updates the Zustand store directly so all components auto-sync.
// ============================================================================

/** Configuration for duel socket connection */
interface DuelSocketConfig {
    url?: string;
    duelId: string;
}

/** Simulated socket event types for future integration */
type DuelEvent =
    | { type: "timer_update"; time: number }
    | { type: "opponent_status"; status: OpponentStatus }
    | { type: "submission_received"; submission: DuelSubmission }
    | { type: "duel_ended"; result: string };

/**
 * Handle incoming duel events by updating the global store.
 * This is the single entry point for all real-time updates.
 */
export const handleDuelEvent = (event: DuelEvent): void => {
    const store = useDuelStore.getState();

    switch (event.type) {
        case "timer_update":
            store.updateTimer(event.time);
            break;

        case "opponent_status":
            store.updateOpponent(event.status);
            break;

        case "submission_received":
            store.addSubmission(event.submission);
            break;

        case "duel_ended":
            store.setTimerRunning(false);
            break;

        default:
            break;
    }
};

/**
 * Create a duel socket connection manager.
 *
 * Returns connect/disconnect functions for use in useEffect cleanup.
 *
 * NOTE: This is a placeholder. Replace the internals with actual
 * WebSocket / Socket.io logic when the backend supports it.
 *
 * Usage in a component:
 * ```
 * useEffect(() => {
 *   const socket = createDuelSocket({ duelId });
 *   socket.connect();
 *   return () => socket.disconnect();
 * }, [duelId]);
 * ```
 */
export const createDuelSocket = (_config: DuelSocketConfig) => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
        // Placeholder: In production, connect to WebSocket here
        // socket = io(config.url, { query: { duelId: config.duelId } });
        // socket.on("timer_update", (time) => handleDuelEvent({ type: "timer_update", time }));
        // socket.on("opponent_status", (status) => handleDuelEvent({ type: "opponent_status", status }));

        // For now, we can use this for local timer countdown
        const store = useDuelStore.getState();
        if (store.isTimerRunning && store.timer > 0) {
            intervalId = setInterval(() => {
                const current = useDuelStore.getState();
                if (current.timer > 0 && current.isTimerRunning) {
                    handleDuelEvent({
                        type: "timer_update",
                        time: current.timer - 1,
                    });
                } else if (current.timer <= 0) {
                    handleDuelEvent({ type: "duel_ended", result: "timeout" });
                    if (intervalId) clearInterval(intervalId);
                }
            }, 1000);
        }
    };

    const disconnect = () => {
        // Placeholder: In production, disconnect WebSocket here
        // socket?.disconnect();
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    };

    return { connect, disconnect };
};
