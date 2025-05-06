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
export class StateMachine<T> implements IStateMachine<T> {
  private currentState: T;
  private initialState: T;
  private transitions: StateTransition<T>[] = [];
  private stateChangeListeners: ((oldState: T, newState: T) => void)[] = [];

  /**
   * Creates a new state machine
   * @param initialState The initial state
   */
  constructor(initialState: T) {
    this.currentState = initialState;
    this.initialState = initialState;
  }

  /**
   * Get the current state
   */
  getCurrentState(): T {
    return this.currentState;
  }

  /**
   * Check if transition to the given state is possible
   * @param state Target state
   */
  canTransitionTo(state: T): boolean {
    return this.findValidTransition(state) !== undefined;
  }

  /**
   * Transition to the given state if possible
   * @param state Target state
   * @returns True if transition was successful
   */
  transition(state: T): boolean {
    const transition = this.findValidTransition(state);

    if (!transition) {
      return false;
    }

    const oldState = this.currentState;
    this.currentState = state;

    // Notify listeners
    this.stateChangeListeners.forEach((listener) =>
      listener(oldState, this.currentState)
    );

    return true;
  }

  /**
   * Add a new valid transition
   * @param transition The transition to add
   */
  addTransition(transition: StateTransition<T>): void {
    this.transitions.push(transition);
  }

  /**
   * Add multiple transitions at once
   * @param transitions Array of transitions to add
   */
  addTransitions(transitions: StateTransition<T>[]): void {
    this.transitions.push(...transitions);
  }

  /**
   * Reset the state machine to its initial state
   */
  reset(): void {
    this.currentState = this.initialState;
  }

  /**
   * Add a listener for state changes
   * @param listener Function to call when state changes
   */
  addStateChangeListener(listener: (oldState: T, newState: T) => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove a state change listener
   * @param listener The listener to remove
   */
  removeStateChangeListener(
    listener: (oldState: T, newState: T) => void
  ): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index !== -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Find a valid transition to the target state
   */
  private findValidTransition(targetState: T): StateTransition<T> | undefined {
    return this.transitions.find(
      (transition) =>
        transition.from === this.currentState &&
        transition.to === targetState &&
        (transition.condition === undefined || transition.condition())
    );
  }
}

/**
 * Specialized state machine for poker game states
 */
export class GameStateMachine extends StateMachine<GameState> {
  constructor() {
    super(GameState.WAITING);

    // Define standard poker game transitions
    this.addTransitions([
      { from: GameState.WAITING, to: GameState.STARTING },
      { from: GameState.STARTING, to: GameState.PREFLOP },
      { from: GameState.PREFLOP, to: GameState.FLOP },
      { from: GameState.PREFLOP, to: GameState.SHOWDOWN }, // All-in scenario
      { from: GameState.FLOP, to: GameState.TURN },
      { from: GameState.FLOP, to: GameState.SHOWDOWN }, // All-in scenario
      { from: GameState.TURN, to: GameState.RIVER },
      { from: GameState.TURN, to: GameState.SHOWDOWN }, // All-in scenario
      { from: GameState.RIVER, to: GameState.SHOWDOWN },
      { from: GameState.SHOWDOWN, to: GameState.FINISHED },
      { from: GameState.FINISHED, to: GameState.WAITING }, // Start a new game
    ]);
  }
}
