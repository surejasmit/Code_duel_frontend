export type RealTimeEvent = {
    id: string; // unique event id for deduplication
    type: 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'SUBMISSION_UPDATE' | 'CHALLENGE_STATUS_CHANGED' | 'SYNC';
    payload: unknown;
    timestamp: number;
};

export type ConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'POLLING';

class RealTimeService {
    private ws: WebSocket | null = null;
    private url: string;
    private channel: BroadcastChannel;
    private isLeader: boolean = false;
    private listeners: Set<(event: RealTimeEvent) => void> = new Set();
    private statusListeners: Set<(status: ConnectionStatus) => void> = new Set();
    private status: ConnectionStatus = 'DISCONNECTED';

    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private baseDelay = 1000;
    private reconnectTimeout: number | null = null;

    private processedEvents = new Set<string>(); // Set of event IDs
    private maxProcessedEvents = 1000;

    private topic: string | null = null;

    constructor(url: string) {
        this.url = url;
        this.channel = new BroadcastChannel('realtime_sync');
        this.channel.onmessage = this.handleBroadcastMessage.bind(this);

        // Clean up when this window closes
        window.addEventListener('beforeunload', () => {
            if (this.isLeader) {
                this.channel.postMessage({ type: 'LEADER_EXIT' });
            }
            this.cleanup();
        });

        // Simple leader election
        this.electLeader();
    }

    private electLeader() {
        this.channel.postMessage({ type: 'LEADER_PING', id: Math.random().toString() });

        // We assume leader if we don't get a pong
        setTimeout(() => {
            if (!this.isLeader && this.status === 'DISCONNECTED') {
                this.becomeLeader();
            }
        }, 150);
    }

    private becomeLeader() {
        this.isLeader = true;
        if (this.topic) {
            this.connect();
        }
    }

    private handleBroadcastMessage(event: MessageEvent) {
        const data = event.data;
        if (data.type === 'LEADER_PING') {
            if (this.isLeader) {
                this.channel.postMessage({ type: 'LEADER_PONG' });
            }
        } else if (data.type === 'LEADER_PONG') {
            this.isLeader = false;
        } else if (data.type === 'LEADER_EXIT') {
            // Re-elect leader since old leader left
            if (!this.isLeader) {
                this.electLeader();
            }
        } else if (data.type === 'WS_EVENT') {
            this.handleEvent(data.event);
        } else if (data.type === 'WS_STATUS') {
            this.status = data.status;
            this.statusListeners.forEach(listener => listener(this.status));
        } else if (data.type === 'SUBSCRIBE' && this.isLeader && !this.topic) {
            this.topic = data.topic;
            this.connect();
        }
    }

    public subscribe(topic: string) {
        this.topic = topic;

        if (this.isLeader) {
            this.connect();
        } else {
            this.channel.postMessage({ type: 'SUBSCRIBE', topic });
        }
    }

    public unsubscribe() {
        this.topic = null;
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateStatus('DISCONNECTED');
    }

    private connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.updateStatus('CONNECTING');

        try {
            this.ws = new WebSocket(`${this.url}?topic=${this.topic}`);

            this.ws.onopen = () => {
                this.updateStatus('CONNECTED');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (e) => {
                try {
                    const event: RealTimeEvent = JSON.parse(e.data);
                    this.handleEvent(event);
                    this.channel.postMessage({ type: 'WS_EVENT', event });
                } catch (err) {
                    console.error("Failed to parse websocket message", err);
                }
            };

            this.ws.onclose = () => {
                this.ws = null;
                this.attemptReconnect();
            };

            this.ws.onerror = () => {
                // Will close and trigger onclose
            };
        } catch (error) {
            this.attemptReconnect();
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.updateStatus('POLLING');
            return;
        }

        this.updateStatus('CONNECTING');
        const delay = this.baseDelay * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect();
        }, delay);
    }

    private handleEvent(event: RealTimeEvent) {
        if (!event || !event.id) return;

        // Deduplication
        if (this.processedEvents.has(event.id)) {
            return;
        }

        this.processedEvents.add(event.id);
        if (this.processedEvents.size > this.maxProcessedEvents) {
            const oldest = this.processedEvents.values().next().value;
            if (oldest) this.processedEvents.delete(oldest);
        }

        // Notify listeners
        this.listeners.forEach(listener => listener(event));
    }

    private updateStatus(status: ConnectionStatus) {
        this.status = status;
        this.statusListeners.forEach(listener => listener(status));
        if (this.isLeader) {
            this.channel.postMessage({ type: 'WS_STATUS', status });
        }
    }

    public onEvent(callback: (event: RealTimeEvent) => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    public onStatusChange(callback: (status: ConnectionStatus) => void) {
        this.statusListeners.add(callback);
        callback(this.status);
        return () => this.statusListeners.delete(callback);
    }

    public cleanup() {
        this.unsubscribe();
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.listeners.clear();
        this.statusListeners.clear();
    }
}

// Singleton instance
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/realtime';
export const realTimeService = new RealTimeService(wsUrl);
