import { EventEmitter, EventHandler } from "./EventEmitter";
import { GameEventType, GameEventData } from "./GameEvents";
/**
 * GameEventBus is a central hub for all game-related events
 * It extends the basic EventEmitter with type-safe methods for game events
 */
export declare class GameEventBus extends EventEmitter {
    private static instance;
    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): GameEventBus;
    /**
     * Type-safe method to subscribe to a specific game event
     * @param eventType The game event type to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    onGameEvent<T extends GameEventType>(eventType: T, handler: EventHandler<GameEventData[T]>): () => void;
    /**
     * Type-safe method to subscribe to a specific game event once
     * @param eventType The game event type to subscribe to
     * @param handler Function to call when the event is emitted
     * @returns Function to unsubscribe from the event
     */
    onceGameEvent<T extends GameEventType>(eventType: T, handler: EventHandler<GameEventData[T]>): () => void;
    /**
     * Type-safe method to emit a game event
     * @param eventType The game event type to emit
     * @param data Data to pass to event handlers
     */
    emitGameEvent<T extends GameEventType>(eventType: T, data: GameEventData[T]): void;
}
export declare const gameEventBus: GameEventBus;
