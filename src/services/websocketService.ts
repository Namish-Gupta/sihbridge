import { WsConnectionState } from '../types/shm';

type MessageCallback = (data: unknown) => void;
type StateCallback = (state: WsConnectionState) => void;

/**
 * WebSocket service for connecting to the FastAPI bridge data endpoint.
 *
 * Responsibilities:
 * - Connect / disconnect
 * - Automatic reconnection with exponential backoff
 * - JSON parse with error handling for malformed payloads
 * - Expose current connection state
 * - Guard against duplicate connections
 * - Graceful handling of server unavailable / Wi-Fi drop
 */
class WebSocketService {
    private ws: WebSocket | null = null;
    private url: string = '';
    private state: WsConnectionState = 'DISCONNECTED';
    private messageCallbacks: Set<MessageCallback> = new Set();
    private stateCallbacks: Set<StateCallback> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempt: number = 0;
    private intentionalClose: boolean = false;

    /** Maximum reconnection delay in ms */
    private static readonly MAX_RECONNECT_DELAY = 30_000;
    /** Base reconnection delay in ms */
    private static readonly BASE_RECONNECT_DELAY = 1_000;

    /**
     * Connect to the WebSocket endpoint.
     * If already connected or connecting, this is a no-op.
     */
    connect(url: string): void {
        // Guard against duplicate connections
        if (this.ws && (this.state === 'CONNECTED' || this.state === 'CONNECTING')) {
            return;
        }

        this.url = url;
        this.intentionalClose = false;
        this.createConnection();
    }

    /** Disconnect and stop reconnection attempts. */
    disconnect(): void {
        this.intentionalClose = true;
        this.clearReconnectTimer();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.setState('DISCONNECTED');
    }

    /** Register a callback for incoming parsed messages. */
    onMessage(cb: MessageCallback): () => void {
        this.messageCallbacks.add(cb);
        return () => this.messageCallbacks.delete(cb);
    }

    /** Register a callback for connection state changes. */
    onStateChange(cb: StateCallback): () => void {
        this.stateCallbacks.add(cb);
        return () => this.stateCallbacks.delete(cb);
    }

    /** Get current connection state. */
    getState(): WsConnectionState {
        return this.state;
    }

    // ------- Private -------

    private createConnection(): void {
        this.setState('CONNECTING');

        try {
            this.ws = new WebSocket(this.url);
        } catch {
            this.setState('ERROR');
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            this.reconnectAttempt = 0;
            this.setState('CONNECTED');
        };

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                this.messageCallbacks.forEach((cb) => {
                    try {
                        cb(data);
                    } catch (err) {
                        console.error('[WebSocketService] Error in message callback:', err);
                    }
                });
            } catch {
                console.warn('[WebSocketService] Received malformed JSON, ignoring:', event.data);
            }
        };

        this.ws.onclose = () => {
            this.ws = null;
            if (!this.intentionalClose) {
                this.scheduleReconnect();
            } else {
                this.setState('DISCONNECTED');
            }
        };

        this.ws.onerror = () => {
            // onclose will fire after onerror, so we just update state here
            this.setState('ERROR');
        };
    }

    private scheduleReconnect(): void {
        this.clearReconnectTimer();
        this.setState('RECONNECTING');

        // Exponential backoff: 1s, 2s, 4s, 8s, ... capped at 30s
        const delay = Math.min(
            WebSocketService.BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempt),
            WebSocketService.MAX_RECONNECT_DELAY
        );
        this.reconnectAttempt++;

        this.reconnectTimer = setTimeout(() => {
            this.createConnection();
        }, delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer !== null) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private setState(newState: WsConnectionState): void {
        if (this.state === newState) return;
        this.state = newState;
        this.stateCallbacks.forEach((cb) => {
            try {
                cb(newState);
            } catch (err) {
                console.error('[WebSocketService] Error in state callback:', err);
            }
        });
    }
}

/** Singleton WebSocket service instance */
export const websocketService = new WebSocketService();
