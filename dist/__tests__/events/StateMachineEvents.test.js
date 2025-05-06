"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateMachine_1 = require("../../engine/StateMachine");
const GameEventBus_1 = require("../../events/GameEventBus");
const GameEvents_1 = require("../../events/GameEvents");
const types_1 = require("../../types");
describe("StateMachine Events Integration", () => {
    let stateMachine;
    beforeEach(() => {
        stateMachine = new StateMachine_1.GameStateMachine();
        GameEventBus_1.gameEventBus.removeAllListeners();
    });
    test("should emit state change events when transitioning", () => {
        // Set up a state change listener on the event bus
        const stateChangeHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, stateChangeHandler);
        // Create a state change listener for the state machine
        const listener = (previousState, currentState) => {
            GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, {
                previousState,
                currentState,
                timestamp: Date.now(),
            });
        };
        // Add the listener to the state machine
        stateMachine.addStateChangeListener(listener);
        // Perform state transitions
        stateMachine.transition(types_1.GameState.STARTING);
        stateMachine.transition(types_1.GameState.PREFLOP);
        stateMachine.transition(types_1.GameState.FLOP);
        // Verify that events were emitted
        expect(stateChangeHandler).toHaveBeenCalledTimes(3);
        // Verify first call
        expect(stateChangeHandler.mock.calls[0][0]).toEqual(expect.objectContaining({
            previousState: types_1.GameState.WAITING,
            currentState: types_1.GameState.STARTING,
        }));
        // Verify second call
        expect(stateChangeHandler.mock.calls[1][0]).toEqual(expect.objectContaining({
            previousState: types_1.GameState.STARTING,
            currentState: types_1.GameState.PREFLOP,
        }));
        // Verify third call
        expect(stateChangeHandler.mock.calls[2][0]).toEqual(expect.objectContaining({
            previousState: types_1.GameState.PREFLOP,
            currentState: types_1.GameState.FLOP,
        }));
    });
    test("should not emit events for invalid transitions", () => {
        const stateChangeHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, stateChangeHandler);
        const listener = (previousState, currentState) => {
            GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, {
                previousState,
                currentState,
                timestamp: Date.now(),
            });
        };
        stateMachine.addStateChangeListener(listener);
        // Try an invalid transition
        const result = stateMachine.transition(types_1.GameState.RIVER);
        // Should return false and not emit event
        expect(result).toBe(false);
        expect(stateChangeHandler).not.toHaveBeenCalled();
    });
    test("should handle multiple listeners and unsubscribing", () => {
        const stateChangeHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, stateChangeHandler);
        const listener1 = (previousState, currentState) => {
            GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.STATE_CHANGED, {
                previousState,
                currentState,
                timestamp: Date.now(),
            });
        };
        const listener2 = jest.fn();
        // Add both listeners
        stateMachine.addStateChangeListener(listener1);
        stateMachine.addStateChangeListener(listener2);
        // First transition should trigger both listeners
        stateMachine.transition(types_1.GameState.STARTING);
        expect(stateChangeHandler).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);
        // Remove the first listener
        stateMachine.removeStateChangeListener(listener1);
        // Second transition should only trigger the second listener
        stateMachine.transition(types_1.GameState.PREFLOP);
        expect(stateChangeHandler).toHaveBeenCalledTimes(1); // Still just 1
        expect(listener2).toHaveBeenCalledTimes(2);
    });
});
//# sourceMappingURL=StateMachineEvents.test.js.map