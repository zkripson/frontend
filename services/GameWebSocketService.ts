/**
 * GameWebSocketService
 * 
 * A service for managing WebSocket connections to the game backend.
 * Handles connection establishment, reconnection, message handling, and event dispatching.
 */

export class GameWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000; // 2 seconds
  private eventHandlers = new Map<string, ((data: any) => void)[]>();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(
    private backendUrl: string,
    private sessionId: string,
    private playerAddress: string
  ) {}

  /**
   * Establishes a WebSocket connection to the game server
   */
  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket connection already exists');
      return;
    }

    const wsUrl = `${this.backendUrl.replace('http', 'ws')}/api/game-updates?sessionId=${this.sessionId}&address=${this.playerAddress}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.setupEventHandlers();
    this.setupPingInterval();
  }

  /**
   * Sets up event handlers for the WebSocket connection
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;

      // Trigger any registered open handlers
      this.triggerEvent('open', {});
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);

        // Trigger type-specific event handlers
        if (data.type) {
          this.triggerEvent(data.type, data);
        }

        // Also trigger general message handler
        this.triggerEvent('message', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.triggerEvent('error', error);
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      this.triggerEvent('close', event);

      // Clean up ping interval
      this.clearPingInterval();

      // Attempt to reconnect if not closed intentionally
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        setTimeout(() => {
          this.connect();
        }, this.reconnectInterval * this.reconnectAttempts);
      } else {
        console.error('Maximum reconnect attempts reached');
      }
    };
  }

  /**
   * Sets up a ping interval to keep the connection alive
   */
  private setupPingInterval(): void {
    // Clear any existing interval first
    this.clearPingInterval();
    
    // Set up a ping interval (every 30 seconds)
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });
      }
    }, 30000);
  }

  /**
   * Clears the ping interval
   */
  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    this.clearPingInterval();
    
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnection');
      this.ws = null;
    }
  }

  /**
   * Registers an event handler for a specific event type
   * @param event The event type to listen for
   * @param handler The handler function to call when the event occurs
   */
  on(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }

    this.eventHandlers.get(event)?.push(handler);
  }

  /**
   * Removes an event handler for a specific event type
   * @param event The event type to remove the handler from
   * @param handler The handler function to remove
   */
  off(event: string, handler: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;
    
    const index = handlers.indexOf(handler);

    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Triggers all registered handlers for a specific event type
   * @param event The event type to trigger
   * @param data The data to pass to the handlers
   */
  private triggerEvent(event: string, data: any): void {
    if (!this.eventHandlers.has(event)) return;

    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    }
  }

  /**
   * Sends a message to the server
   * @param message The message to send
   */
  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket is not connected');
      return;
    }

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Checks if the connection is currently open
   * @returns True if the connection is open, false otherwise
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}