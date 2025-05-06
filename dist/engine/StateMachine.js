"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStateMachine = exports.StateMachine = void 0;
const types_1 = require("../types");
/**
 * Generic state machine implementation
 */
class StateMachine {
    /**
     * Creates a new state machine
     * @param initialState The initial state
     */
    constructor(initialState) {
        this.transitions = [];
        this.stateChangeListeners = [];
        this.currentState = initialState;
        this.initialState = initialState;
    }
    /**
     * Get the current state
     */
    getCurrentState() {
        return this.currentState;
    }
    /**
     * Check if transition to the given state is possible
     * @param state Target state
     */
    canTransitionTo(state) {
        return this.findValidTransition(state) !== undefined;
    }
    /**
     * Transition to the given state if possible
     * @param state Target state
     * @returns True if transition was successful
     */
    transition(state) {
        const transition = this.findValidTransition(state);
        if (!transition) {
            return false;
        }
        const oldState = this.currentState;
        this.currentState = state;
        // Notify listeners
        this.stateChangeListeners.forEach((listener) => listener(oldState, this.currentState));
        return true;
    }
    /**
     * Add a new valid transition
     * @param transition The transition to add
     */
    addTransition(transition) {
        this.transitions.push(transition);
    }
    /**
     * Add multiple transitions at once
     * @param transitions Array of transitions to add
     */
    addTransitions(transitions) {
        this.transitions.push(...transitions);
    }
    /**
     * Reset the state machine to its initial state
     */
    reset() {
        this.currentState = this.initialState;
    }
    /**
     * Add a listener for state changes
     * @param listener Function to call when state changes
     */
    addStateChangeListener(listener) {
        this.stateChangeListeners.push(listener);
    }
    /**
     * Remove a state change listener
     * @param listener The listener to remove
     */
    removeStateChangeListener(listener) {
        const index = this.stateChangeListeners.indexOf(listener);
        if (index !== -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }
    /**
     * Find a valid transition to the target state
     */
    findValidTransition(targetState) {
        return this.transitions.find((transition) => transition.from === this.currentState &&
            transition.to === targetState &&
            (transition.condition === undefined || transition.condition()));
    }
}
exports.StateMachine = StateMachine;
/**
 * Specialized state machine for poker game states
 */
class GameStateMachine extends StateMachine {
    constructor() {
        super(types_1.GameState.WAITING);
        // Define standard poker game transitions
        this.addTransitions([
            { from: types_1.GameState.WAITING, to: types_1.GameState.STARTING },
            { from: types_1.GameState.STARTING, to: types_1.GameState.PREFLOP },
            { from: types_1.GameState.PREFLOP, to: types_1.GameState.FLOP },
            { from: types_1.GameState.PREFLOP, to: types_1.GameState.SHOWDOWN }, // All-in scenario
            { from: types_1.GameState.FLOP, to: types_1.GameState.TURN },
            { from: types_1.GameState.FLOP, to: types_1.GameState.SHOWDOWN }, // All-in scenario
            { from: types_1.GameState.TURN, to: types_1.GameState.RIVER },
            { from: types_1.GameState.TURN, to: types_1.GameState.SHOWDOWN }, // All-in scenario
            { from: types_1.GameState.RIVER, to: types_1.GameState.SHOWDOWN },
            { from: types_1.GameState.SHOWDOWN, to: types_1.GameState.FINISHED },
            { from: types_1.GameState.FINISHED, to: types_1.GameState.WAITING }, // Start a new game
        ]);
    }
}
exports.GameStateMachine = GameStateMachine;
//# sourceMappingURL=StateMachine.js.map