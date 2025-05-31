export interface QuickplayMessage {
  type:
    | "status_update"
    | "joined_pool"
    | "left_pool"
    | "match_found"
    | "match_created"
    | "match_failed"
    | "match_error"
    | "timeout"
    | "pong"
    | string;
  [key: string]: any;
}

export class QuickplayWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 2000;
  private pingInterval: NodeJS.Timeout | null = null;
  private eventHandlers = new Map<
    string,
    ((data: QuickplayMessage) => void)[]
  >();

  constructor(private backendUrl: string, private address: string) {}

  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const wsUrl = `${this.backendUrl.replace(
      /^http/,
      "ws"
    )}/api/quickplay?address=${this.address}`;
    this.ws = new WebSocket(wsUrl);

    this.setupEventHandlers();
    this.setupPingInterval();
  }

  disconnect(): void {
    this.clearPingInterval();
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
  }

  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("Quickplay WS not open; cannot send", message);
      return;
    }
    this.ws.send(JSON.stringify(message));
  }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  on(event: string, handler: (data: QuickplayMessage) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: (data: QuickplayMessage) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.triggerEvent("open", { type: "open" });
    };

    this.ws.onmessage = (evt) => {
      try {
        const data: QuickplayMessage = JSON.parse(evt.data);
        // dispatch specific event + catch-all
        if (data.type) this.triggerEvent(data.type, data);
        this.triggerEvent("message", data);
      } catch (err) {
        console.error("Quickplay WS parse error:", err);
      }
    };

    this.ws.onerror = (err) => {
      console.error("Quickplay WS error:", err);
      this.triggerEvent("error", { type: "error", error: err });
    };

    this.ws.onclose = (ev) => {
      this.triggerEvent("close", {
        type: "close",
        code: ev.code,
        reason: ev.reason,
      });
      this.clearPingInterval();

      // auto-reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(
          () => this.connect(),
          this.reconnectInterval * this.reconnectAttempts
        );
      } else {
        console.error("Quickplay WS max reconnects reached");
      }
    };
  }

  /** Heartbeat every 30s */
  private setupPingInterval(): void {
    this.clearPingInterval();
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) this.send({ type: "ping" });
    }, 30000);
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private triggerEvent(event: string, data: QuickplayMessage): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(data);
      } catch (err) {
        console.error(`Error in Quickplay handler for ${event}:`, err);
      }
    }
  }
}
