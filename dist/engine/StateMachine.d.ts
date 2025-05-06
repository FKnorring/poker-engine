import { GameState } from "../types";
/**
 * Generic interface for state transitions
 */
export interface StateTransition<T> {
    from: T;
    to: T;
    condition?: () => boolean;
}
/**
 * Interface for game state machine
 */
export interface IStateMachine<T> {
    getCurrentState(): T;
    canTransitionTo(state: T): boolean;
    transition(state: T): boolean;
    addTransition(transition: StateTransition<T>): void;
    reset(): void;
}
/**
 * Generic state machine implementation
 */
export declare class StateMachine<T> implements IStateMachine<T> {
    private currentState;
    private initialState;
    private transitions;
    private stateChangeListeners;
    /**
     * Creates a new state machine
     * @param initialState The initial state
     */
    constructor(initialState: T);
    /**
     * Get the current state
     */
    getCurrentState(): T;
    /**
     * Check if transition to the given state is possible
     * @param state Target state
     */
    canTransitionTo(state: T): boolean;
    /**
     * Transition to the given state if possible
     * @param state Target state
     * @returns True if transition was successful
     */
    transition(state: T): boolean;
    /**
     * Add a new valid transition
     * @param transition The transition to add
     */
    addTransition(transition: StateTransition<T>): void;
    /**
     * Add multiple transitions at once
     * @param transitions Array of transitions to add
     */
    addTransitions(transitions: StateTransition<T>[]): void;
    /**
     * Reset the state machine to its initial state
     */
    reset(): void;
    /**
     * Add a listener for state changes
     * @param listener Function to call when state changes
     */
    addStateChangeListener(listener: (oldState: T, newState: T) => void): void;
    /**
     * Remove a state change listener
     * @param listener The listener to remove
     */
    removeStateChangeListener(listener: (oldState: T, newState: T) => void): void;
    /**
     * Find a valid transition to the target state
     */
    private findValidTransition;
}
/**
 * Specialized state machine for poker game states
 */
export declare class GameStateMachine extends StateMachine<GameState> {
    constructor();
}
