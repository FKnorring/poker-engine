import { EventEmitter } from "../events/EventEmitter";
export interface WebSocketMessage {
    type: string;
    payload: any;
}
export interface WebSocketClient {
    id: string;
    send: (message: WebSocketMessage) => void;
    close: () => void;
}
/**
 * Generic WebSocket service that handles connections and message routing
 * This is a placeholder that would be implemented with a real WebSocket library in production
 */
export declare class WebSocketService extends EventEmitter {
    private clients;
    private rooms;
    constructor();
    /**
     * Add a new client connection
     * @param client The WebSocket client
     */
    addClient(client: WebSocketClient): void;
    /**
     * Remove a client connection
     * @param clientId ID of the client to remove
     */
    removeClient(clientId: string): void;
    /**
     * Add a client to a room
     * @param clientId ID of the client
     * @param roomId ID of the room
     */
    joinRoom(clientId: string, roomId: string): void;
    /**
     * Remove a client from a room
     * @param clientId ID of the client
     * @param roomId ID of the room
     */
    leaveRoom(clientId: string, roomId: string): void;
    /**
     * Send a message to a specific client
     * @param clientId ID of the client
     * @param message Message to send
     */
    sendToClient(clientId: string, message: WebSocketMessage): void;
    /**
     * Send a message to all clients in a room
     * @param roomId ID of the room
     * @param message Message to send
     */
    sendToRoom(roomId: string, message: WebSocketMessage): void;
    /**
     * Send a message to all connected clients
     * @param message Message to send
     */
    broadcast(message: WebSocketMessage): void;
    /**
     * Handle an incoming message from a client
     * @param clientId ID of the client
     * @param message The message received
     */
    handleMessage(clientId: string, message: WebSocketMessage): void;
    /**
     * Set up listeners for game events to forward to WebSocket clients
     */
    private setupGameEventListeners;
    /**
     * Sanitize event data before sending to clients
     * @param eventType Type of the event
     * @param data Event data
     * @returns Sanitized data safe for sending to clients
     */
    private sanitizeEventData;
}
