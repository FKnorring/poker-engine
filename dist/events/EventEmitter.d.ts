/**
 * Type for event handler function
 */
export type EventHandler<T = any> = (data: T) => void;
/**
 * EventEmitter class implementing the publisher/subscriber pattern
 */
export declare class EventEmitter {
    private events;
    /**
     * Subscribe to an event
     * @param eventName Name of the event to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    on<T = any>(eventName: string, handler: EventHandler<T>): () => void;
    /**
     * Subscribe to an event and automatically unsubscribe after it fires once
     * @param eventName Name of the event to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    once<T = any>(eventName: string, handler: EventHandler<T>): () => void;
    /**
     * Unsubscribe from an event
     * @param eventName Name of the event to unsubscribe from
     * @param handler Function to remove
     */
    off(eventName: string, handler: EventHandler): void;
    /**
     * Remove all handlers for a specific event
     * @param eventName Name of the event to clear
     */
    removeAllListeners(eventName?: string): void;
    /**
     * Emit an event
     * @param eventName Name of the event to emit
     * @param data Data to pass to handlers
     */
    emit<T = any>(eventName: string, data?: T): void;
    /**
     * Get the number of listeners for an event
     * @param eventName Name of the event
     * @returns Number of handlers
     */
    listenerCount(eventName: string): number;
}
