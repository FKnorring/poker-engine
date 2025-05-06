"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const EventEmitter_1 = require("../events/EventEmitter");
const GameEvents_1 = require("../events/GameEvents");
const GameEventBus_1 = require("../events/GameEventBus");
/**
 * Generic WebSocket service that handles connections and message routing
 * This is a placeholder that would be implemented with a real WebSocket library in production
 */
class WebSocketService extends EventEmitter_1.EventEmitter {
    constructor() {
        super();
        this.clients = new Map();
        this.rooms = new Map();
        this.setupGameEventListeners();
    }
    /**
     * Add a new client connection
     * @param client The WebSocket client
     */
    addClient(client) {
        this.clients.set(client.id, client);
        this.emit("client:connected", { clientId: client.id });
    }
    /**
     * Remove a client connection
     * @param clientId ID of the client to remove
     */
    removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            // Remove from all rooms
            this.rooms.forEach((clients, roomId) => {
                if (clients.has(clientId)) {
                    this.leaveRoom(clientId, roomId);
                }
            });
            // Delete the client
            this.clients.delete(clientId);
            this.emit("client:disconnected", { clientId });
        }
    }
    /**
     * Add a client to a room
     * @param clientId ID of the client
     * @param roomId ID of the room
     */
    joinRoom(clientId, roomId) {
        if (!this.clients.has(clientId)) {
            return;
        }
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(clientId);
        this.emit("room:joined", { clientId, roomId });
    }
    /**
     * Remove a client from a room
     * @param clientId ID of the client
     * @param roomId ID of the room
     */
    leaveRoom(clientId, roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.has(clientId)) {
            room.delete(clientId);
            // Clean up empty rooms
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
            this.emit("room:left", { clientId, roomId });
        }
    }
    /**
     * Send a message to a specific client
     * @param clientId ID of the client
     * @param message Message to send
     */
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (client) {
            client.send(message);
        }
    }
    /**
     * Send a message to all clients in a room
     * @param roomId ID of the room
     * @param message Message to send
     */
    sendToRoom(roomId, message) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.forEach((clientId) => {
                this.sendToClient(clientId, message);
            });
        }
    }
    /**
     * Send a message to all connected clients
     * @param message Message to send
     */
    broadcast(message) {
        this.clients.forEach((client) => {
            client.send(message);
        });
    }
    /**
     * Handle an incoming message from a client
     * @param clientId ID of the client
     * @param message The message received
     */
    handleMessage(clientId, message) {
        this.emit("message", { clientId, message });
        // Route message to appropriate handler
        switch (message.type) {
            case "join:room":
                // First, emit the custom event with full payload
                this.emit(message.type, {
                    clientId,
                    payload: message.payload,
                });
                // Then handle the basic room joining logic
                this.joinRoom(clientId, message.payload.roomId);
                break;
            case "leave:room":
                this.leaveRoom(clientId, message.payload.roomId);
                break;
            case "game:action":
                // Forward game actions to the game event bus
                GameEventBus_1.gameEventBus.emit(message.payload.action, {
                    playerId: clientId,
                    ...message.payload.data,
                });
                break;
            default:
                // Forward unknown messages as custom events
                this.emit(message.type, {
                    clientId,
                    payload: message.payload,
                });
        }
    }
    /**
     * Set up listeners for game events to forward to WebSocket clients
     */
    setupGameEventListeners() {
        // Listen for all game events and forward to relevant rooms
        GameEventBus_1.gameEventBus.on("*", ({ type, data }) => {
            // Most game events include a gameId which we can use to identify the room
            if (data && data.gameId) {
                this.sendToRoom(data.gameId, {
                    type,
                    payload: this.sanitizeEventData(type, data),
                });
            }
        });
    }
    /**
     * Sanitize event data before sending to clients
     * @param eventType Type of the event
     * @param data Event data
     * @returns Sanitized data safe for sending to clients
     */
    sanitizeEventData(eventType, data) {
        // Create a copy of the data to avoid modifying the original
        const sanitized = { ...data };
        // Remove sensitive information based on event type
        // For hand deals, only include cards for the target player
        if (eventType === GameEvents_1.GameEventType.HAND_DEALT) {
            // Keep hole cards only for the target player
            delete sanitized.holeCards;
        }
        return sanitized;
    }
}
exports.WebSocketService = WebSocketService;
//# sourceMappingURL=WebSocketService.js.map