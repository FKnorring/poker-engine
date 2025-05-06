"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEmitter = void 0;
/**
 * EventEmitter class implementing the publisher/subscriber pattern
 */
class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    /**
     * Subscribe to an event
     * @param eventName Name of the event to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    on(eventName, handler) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        const handlers = this.events.get(eventName);
        handlers.add(handler);
        // Return a function to remove this handler
        return () => {
            this.off(eventName, handler);
        };
    }
    /**
     * Subscribe to an event and automatically unsubscribe after it fires once
     * @param eventName Name of the event to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    once(eventName, handler) {
        const onceHandler = (data) => {
            this.off(eventName, onceHandler);
            handler(data);
        };
        return this.on(eventName, onceHandler);
    }
    /**
     * Unsubscribe from an event
     * @param eventName Name of the event to unsubscribe from
     * @param handler Function to remove
     */
    off(eventName, handler) {
        const handlers = this.events.get(eventName);
        if (handlers) {
            handlers.delete(handler);
            // Clean up if no handlers left
            if (handlers.size === 0) {
                this.events.delete(eventName);
            }
        }
    }
    /**
     * Remove all handlers for a specific event
     * @param eventName Name of the event to clear
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
        }
        else {
            this.events.clear();
        }
    }
    /**
     * Emit an event
     * @param eventName Name of the event to emit
     * @param data Data to pass to handlers
     */
    emit(eventName, data) {
        const handlers = this.events.get(eventName);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(data);
                }
                catch (error) {
                    console.error(`Error in event handler for ${eventName}:`, error);
                }
            });
        }
    }
    /**
     * Get the number of listeners for an event
     * @param eventName Name of the event
     * @returns Number of handlers
     */
    listenerCount(eventName) {
        const handlers = this.events.get(eventName);
        return handlers ? handlers.size : 0;
    }
}
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=EventEmitter.js.map