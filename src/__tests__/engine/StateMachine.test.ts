import { StateMachine, GameStateMachine } from "../../engine/StateMachine";
import { GameState } from "../../types";

describe("StateMachine", () => {
  enum TestState {
    A = "A",
    B = "B",
    C = "C",
    D = "D",
  }

  let stateMachine: StateMachine<TestState>;

  beforeEach(() => {
    stateMachine = new StateMachine<TestState>(TestState.A);
  });

  describe("initialization", () => {
    it("should initialize with the correct state", () => {
      expect(stateMachine.getCurrentState()).toBe(TestState.A);
    });
  });

  describe("transitions", () => {
    beforeEach(() => {
      stateMachine.addTransition({ from: TestState.A, to: TestState.B });
      stateMachine.addTransition({ from: TestState.B, to: TestState.C });
      stateMachine.addTransition({ from: TestState.C, to: TestState.D });
    });

    it("should transition to valid next state", () => {
      expect(stateMachine.canTransitionTo(TestState.B)).toBe(true);
      expect(stateMachine.transition(TestState.B)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(TestState.B);
    });

    it("should not transition to invalid next state", () => {
      expect(stateMachine.canTransitionTo(TestState.C)).toBe(false);
      expect(stateMachine.transition(TestState.C)).toBe(false);
      expect(stateMachine.getCurrentState()).toBe(TestState.A);
    });

    it("should follow a sequence of valid transitions", () => {
      expect(stateMachine.transition(TestState.B)).toBe(true);
      expect(stateMachine.transition(TestState.C)).toBe(true);
      expect(stateMachine.transition(TestState.D)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(TestState.D);
    });

    it("should add multiple transitions at once", () => {
      const newStateMachine = new StateMachine<TestState>(TestState.A);
      newStateMachine.addTransitions([
        { from: TestState.A, to: TestState.B },
        { from: TestState.B, to: TestState.C },
      ]);

      expect(newStateMachine.canTransitionTo(TestState.B)).toBe(true);
      expect(newStateMachine.transition(TestState.B)).toBe(true);
      expect(newStateMachine.getCurrentState()).toBe(TestState.B);
      expect(newStateMachine.canTransitionTo(TestState.C)).toBe(true);
    });
  });

  describe("conditional transitions", () => {
    it("should only transition when condition is met", () => {
      let conditionMet = false;

      stateMachine.addTransition({
        from: TestState.A,
        to: TestState.B,
        condition: () => conditionMet,
      });

      expect(stateMachine.canTransitionTo(TestState.B)).toBe(false);
      expect(stateMachine.transition(TestState.B)).toBe(false);

      conditionMet = true;

      expect(stateMachine.canTransitionTo(TestState.B)).toBe(true);
      expect(stateMachine.transition(TestState.B)).toBe(true);
      expect(stateMachine.getCurrentState()).toBe(TestState.B);
    });
  });

  describe("reset", () => {
    it("should reset to the initial state", () => {
      stateMachine.addTransition({ from: TestState.A, to: TestState.B });
      stateMachine.transition(TestState.B);
      expect(stateMachine.getCurrentState()).toBe(TestState.B);

      stateMachine.reset();
      expect(stateMachine.getCurrentState()).toBe(TestState.A);
    });
  });

  describe("state change listeners", () => {
    it("should notify listeners when state changes", () => {
      const listener = jest.fn();

      stateMachine.addStateChangeListener(listener);
      stateMachine.addTransition({ from: TestState.A, to: TestState.B });
      stateMachine.transition(TestState.B);

      expect(listener).toHaveBeenCalledWith(TestState.A, TestState.B);
    });

    it("should remove listeners correctly", () => {
      const listener = jest.fn();

      stateMachine.addStateChangeListener(listener);
      stateMachine.addTransition({ from: TestState.A, to: TestState.B });
      stateMachine.removeStateChangeListener(listener);
      stateMachine.transition(TestState.B);

      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe("GameStateMachine", () => {
  let gameStateMachine: GameStateMachine;

  beforeEach(() => {
    gameStateMachine = new GameStateMachine();
  });

  it("should initialize with WAITING state", () => {
    expect(gameStateMachine.getCurrentState()).toBe(GameState.WAITING);
  });

  it("should follow the standard poker game flow", () => {
    // Start a new game
    expect(gameStateMachine.canTransitionTo(GameState.STARTING)).toBe(true);
    expect(gameStateMachine.transition(GameState.STARTING)).toBe(true);

    // Proceed to PREFLOP
    expect(gameStateMachine.canTransitionTo(GameState.PREFLOP)).toBe(true);
    expect(gameStateMachine.transition(GameState.PREFLOP)).toBe(true);

    // Proceed to FLOP
    expect(gameStateMachine.canTransitionTo(GameState.FLOP)).toBe(true);
    expect(gameStateMachine.transition(GameState.FLOP)).toBe(true);

    // Proceed to TURN
    expect(gameStateMachine.canTransitionTo(GameState.TURN)).toBe(true);
    expect(gameStateMachine.transition(GameState.TURN)).toBe(true);

    // Proceed to RIVER
    expect(gameStateMachine.canTransitionTo(GameState.RIVER)).toBe(true);
    expect(gameStateMachine.transition(GameState.RIVER)).toBe(true);

    // Proceed to SHOWDOWN
    expect(gameStateMachine.canTransitionTo(GameState.SHOWDOWN)).toBe(true);
    expect(gameStateMachine.transition(GameState.SHOWDOWN)).toBe(true);

    // Proceed to FINISHED
    expect(gameStateMachine.canTransitionTo(GameState.FINISHED)).toBe(true);
    expect(gameStateMachine.transition(GameState.FINISHED)).toBe(true);

    // Back to WAITING
    expect(gameStateMachine.canTransitionTo(GameState.WAITING)).toBe(true);
    expect(gameStateMachine.transition(GameState.WAITING)).toBe(true);
  });

  it("should allow skipping from PREFLOP to SHOWDOWN (all-in scenario)", () => {
    gameStateMachine.transition(GameState.STARTING);
    gameStateMachine.transition(GameState.PREFLOP);

    expect(gameStateMachine.canTransitionTo(GameState.SHOWDOWN)).toBe(true);
    expect(gameStateMachine.transition(GameState.SHOWDOWN)).toBe(true);
  });

  it("should allow skipping from FLOP to SHOWDOWN (all-in scenario)", () => {
    gameStateMachine.transition(GameState.STARTING);
    gameStateMachine.transition(GameState.PREFLOP);
    gameStateMachine.transition(GameState.FLOP);

    expect(gameStateMachine.canTransitionTo(GameState.SHOWDOWN)).toBe(true);
    expect(gameStateMachine.transition(GameState.SHOWDOWN)).toBe(true);
  });

  it("should allow skipping from TURN to SHOWDOWN (all-in scenario)", () => {
    gameStateMachine.transition(GameState.STARTING);
    gameStateMachine.transition(GameState.PREFLOP);
    gameStateMachine.transition(GameState.FLOP);
    gameStateMachine.transition(GameState.TURN);

    expect(gameStateMachine.canTransitionTo(GameState.SHOWDOWN)).toBe(true);
    expect(gameStateMachine.transition(GameState.SHOWDOWN)).toBe(true);
  });

  it("should not allow invalid transitions", () => {
    // Try to skip from WAITING to FLOP (invalid)
    expect(gameStateMachine.canTransitionTo(GameState.FLOP)).toBe(false);
    expect(gameStateMachine.transition(GameState.FLOP)).toBe(false);

    // Try to go backward from PREFLOP to STARTING (invalid)
    gameStateMachine.transition(GameState.STARTING);
    gameStateMachine.transition(GameState.PREFLOP);
    expect(gameStateMachine.canTransitionTo(GameState.STARTING)).toBe(false);
    expect(gameStateMachine.transition(GameState.STARTING)).toBe(false);
  });
});
