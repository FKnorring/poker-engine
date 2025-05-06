"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameEventBus = exports.GameEventBus = void 0;
const EventEmitter_1 = require("./EventEmitter");
/**
 * GameEventBus is a central hub for all game-related events
 * It extends the basic EventEmitter with type-safe methods for game events
 */
class GameEventBus extends EventEmitter_1.EventEmitter {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        super();
    }
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!GameEventBus.instance) {
            GameEventBus.instance = new GameEventBus();
        }
        return GameEventBus.instance;
    }
    /**
     * Type-safe method to subscribe to a specific game event
     * @param eventType The game event type to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    onGameEvent(eventType, handler) {
        return this.on(eventType, handler);
    }
    /**
     * Type-safe method to subscribe to a specific game event once
     * @param eventType The game event type to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    onceGameEvent(eventType, handler) {
        return this.once(eventType, handler);
    }
    /**
     * Type-safe method to emit a game event
     * @param eventType The game event type to emit
     * @param data Data to pass to event handlers
     */
    emitGameEvent(eventType, data) {
        // Add timestamp if not present
        if (!("timestamp" in data)) {
            data.timestamp = Date.now();
        }
        // Emit the event
        this.emit(eventType, data);
        // Also emit a generic "any" event that can be used to listen to all events
        this.emit("*", { type: eventType, data });
    }
}
exports.GameEventBus = GameEventBus;
// Export a pre-created singleton instance for convenience
exports.gameEventBus = GameEventBus.getInstance();
//# sourceMappingURL=GameEventBus.js.map