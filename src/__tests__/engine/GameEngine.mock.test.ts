import { GameEngine, GameEngineConfig } from "../../engine/GameEngine";
import { Player } from "../../models/Player";
import { Action } from "../../models/Action";
import {
  GameState,
  PlayerStatus,
  GameVariant,
  BettingStructure,
  ActionType,
  GameEngineEventType,
} from "../../types";
import { PotManager } from "../../models/Pot";

// Mock all dependencies
jest.mock("../../models/Table");
jest.mock("../../models/Player");
jest.mock("../../models/Deck");
jest.mock("../../models/Card");
jest.mock("../../models/Pot");
jest.mock("../../engine/StateMachine");
jest.mock("../../evaluator/HandEvaluator");
jest.mock("../../evaluator/TexasHoldemEvaluator");
jest.mock("../../evaluator/OmahaEvaluator");
jest.mock("../../engine/PlayerManager");

describe("GameEngine Mock Tests", () => {
  // We'll use complete mocking to improve test coverage
  let gameEngine: GameEngine;
  let mockPlayers: Player[];

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock players
    mockPlayers = Array(3)
      .fill(null)
      .map(
        (_, index) =>
          ({
            id: `player${index}`,
            name: `Player ${index}`,
            stack: 1000,
            currentBet: 0,
            hand: { cards: [] },
            status: PlayerStatus.ACTIVE,
            placeBet: jest.fn().mockReturnValue(10),
            addWinnings: jest.fn(),
            clearHand: jest.fn(),
            dealCards: jest.fn(),
          } as unknown as Player)
      );

    // Create a game engine with default config
    gameEngine = new GameEngine();

    // Override config for testing
    gameEngine["config"] = {
      variant: GameVariant.TEXAS_HOLDEM,
      bettingStructure: BettingStructure.NO_LIMIT,
      smallBlind: 5,
      bigBlind: 10,
      ante: 0,
      minPlayers: 2, // Important for testing
      maxPlayers: 6,
      timeoutInSeconds: 30,
    };

    // Mock private properties and methods for testing
    // This allows us to handle private members directly
    gameEngine["stateMachine"] = {
      getCurrentState: jest.fn().mockReturnValue(GameState.WAITING),
      transition: jest.fn(),
      addStateChangeListener: jest.fn(),
    } as any;

    gameEngine["potManager"] = {
      clear: jest.fn(),
      addBet: jest.fn(),
      collectBets: jest.fn(),
      pots: [],
      totalPotAmount: 100,
    } as unknown as PotManager;

    // Create a more complete table mock to satisfy TypeScript
    gameEngine["table"] = {
      players: mockPlayers.map((player) => player),
      activePlayers: mockPlayers,
      communityCards: [],
      currentBet: 0,
      totalPot: 100,
      clearCommunityCards: jest.fn(),
      addCommunityCards: jest.fn(),
      addCommunityCard: jest.fn(),
      removePlayer: jest.fn().mockReturnValue(true),
      seatPlayer: jest.fn().mockReturnValue(true),
      // Add missing properties needed for TypeScript
      id: "test-table",
      name: "Test Table",
      maxPlayers: 6,
      smallBlind: 5,
      bigBlind: 10,
      minBuyIn: 100,
      maxBuyIn: 1000,
      gameVariant: GameVariant.TEXAS_HOLDEM,
      bettingStructure: BettingStructure.NO_LIMIT,
    } as any;

    // Mock event emission
    gameEngine["emit"] = jest.fn();

    // Mock internal methods
    gameEngine["getPlayerById"] = jest.fn().mockImplementation((id) => {
      return mockPlayers.find((p) => p.id === id) || null;
    });

    gameEngine["handleStateChange"] = jest.fn();
    gameEngine["getActivePlayersInHand"] = jest
      .fn()
      .mockReturnValue(mockPlayers);
    gameEngine["currentPlayerIndex"] = 0;
    gameEngine["dealerPosition"] = 0;
    gameEngine["advanceGame"] = jest.fn().mockReturnValue(GameState.PREFLOP);
    gameEngine["isRoundComplete"] = jest.fn().mockReturnValue(false);
    gameEngine["collectBets"] = jest.fn();
    gameEngine["resetTable"] = jest.fn();
    gameEngine["createHandEvaluator"] = jest.fn();
    gameEngine["notifyPlayerTurn"] = jest.fn();
    gameEngine["moveToNextPlayer"] = jest.fn();
  });

  describe("Game Flow Tests", () => {
    test("should start a game successfully", () => {
      // Arrange
      (gameEngine["stateMachine"].getCurrentState as jest.Mock).mockReturnValue(
        GameState.WAITING
      );
      gameEngine["resetTable"] = jest.fn();
      gameEngine["moveDealerButton"] = jest.fn();
      gameEngine["postBlindsAndAntes"] = jest.fn();

      // Act
      const result = gameEngine.startGame();

      // Assert
      expect(result).toBe(true);
      expect(gameEngine["stateMachine"].transition).toHaveBeenCalledWith(
        GameState.STARTING
      );
      expect(gameEngine["resetTable"]).toHaveBeenCalled();
      expect(gameEngine["moveDealerButton"]).toHaveBeenCalled();
      expect(gameEngine["postBlindsAndAntes"]).toHaveBeenCalled();
    });

    test("should not start game if not enough players", () => {
      // Arrange - important: we need to make sure that the right array is used in the check
      const notEnoughPlayers: Player[] = [mockPlayers[0]]; // Only one player

      // Create a new table with only one player but keep all other properties
      gameEngine["table"] = {
        ...gameEngine["table"],
        players: notEnoughPlayers,
        activePlayers: notEnoughPlayers,
      } as any; // Use 'as any' to bypass TypeScript strict checking for the test

      // Also, ensure the config has the right minPlayers value
      gameEngine["config"].minPlayers = 2;

      // Act
      const result = gameEngine.startGame();

      // Assert
      expect(result).toBe(false);
      expect(gameEngine["stateMachine"].transition).not.toHaveBeenCalled();
    });

    test("should not start game if not in WAITING state", () => {
      // Arrange
      (gameEngine["stateMachine"].getCurrentState as jest.Mock).mockReturnValue(
        GameState.PREFLOP
      );

      // Act
      const result = gameEngine.startGame();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("Player Action Tests", () => {
    beforeEach(() => {
      // Important: Mock the active players for the current player check to work
      gameEngine["getActivePlayersInHand"] = jest
        .fn()
        .mockReturnValue(mockPlayers);
    });

    test("should handle fold action", () => {
      // Arrange
      const player = mockPlayers[0];
      const action = new Action(player, ActionType.FOLD);

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(gameEngine["advanceGame"]).toHaveBeenCalled();
    });

    test("should handle check action", () => {
      // Arrange
      const player = mockPlayers[0];
      const action = new Action(player, ActionType.CHECK);

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(gameEngine["advanceGame"]).toHaveBeenCalled();
    });

    test("should handle call action", () => {
      // Arrange
      const player = mockPlayers[0];
      const action = new Action(player, ActionType.CALL);
      gameEngine["table"].currentBet = 10;

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(player.placeBet).toHaveBeenCalled();
      expect(gameEngine["advanceGame"]).toHaveBeenCalled();
    });

    test("should handle bet action", () => {
      // Arrange
      const player = mockPlayers[0];
      const action = new Action(player, ActionType.BET, 20);
      gameEngine["table"].currentBet = 0;
      gameEngine["config"].bigBlind = 10;

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(player.placeBet).toHaveBeenCalled();
      expect(gameEngine["advanceGame"]).toHaveBeenCalled();
    });

    test("should handle all-in action", () => {
      // Arrange
      const player = mockPlayers[0];
      player.stack = 100;
      const action = new Action(player, ActionType.ALL_IN);

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(player.placeBet).toHaveBeenCalled();
      expect(gameEngine["advanceGame"]).toHaveBeenCalled();
    });

    test("should not allow check if there's a bet to call", () => {
      // Arrange
      const player = mockPlayers[0];
      const action = new Action(player, ActionType.CHECK);
      gameEngine["table"].currentBet = 20;
      player.currentBet = 0;

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("Cannot check");
    });

    test("should not allow action if not player's turn", () => {
      // Arrange
      const player = mockPlayers[1]; // Not the current player
      const action = new Action(player, ActionType.CHECK);
      gameEngine["currentPlayerIndex"] = 0; // First player's turn

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("Not your turn");
    });

    test("should handle player not found", () => {
      // Arrange
      gameEngine["getPlayerById"] = jest.fn().mockReturnValue(null);
      const action = new Action({} as Player, ActionType.CHECK);

      // Act
      const result = gameEngine.handleAction("nonexistent", action);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain("Player not found");
    });
  });

  describe("Event System Tests", () => {
    test("should add event listener", () => {
      // Arrange
      const callback = jest.fn();

      // Act
      gameEngine.on(GameEngineEventType.GAME_STARTED, callback);

      // Assert
      expect(
        gameEngine["eventListeners"].get(GameEngineEventType.GAME_STARTED)
      ).toContain(callback);
    });

    test("should remove event listener", () => {
      // Arrange
      const callback = jest.fn();
      gameEngine.on(GameEngineEventType.GAME_STARTED, callback);

      // Act
      gameEngine.off(GameEngineEventType.GAME_STARTED, callback);

      // Assert
      const listeners =
        gameEngine["eventListeners"].get(GameEngineEventType.GAME_STARTED) ||
        [];
      expect(listeners).not.toContain(callback);
    });
  });
});
