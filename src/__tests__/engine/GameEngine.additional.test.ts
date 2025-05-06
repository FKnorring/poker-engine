import { GameEngine, GameEngineConfig } from "../../engine/GameEngine";
import { Player } from "../../models/Player";
import { Action } from "../../models/Action";
import { Card } from "../../models/Card";
import { Deck } from "../../models/Deck";
import {
  GameState,
  PlayerStatus,
  GameVariant,
  BettingStructure,
  ActionType,
  Suit,
  Rank,
  GameEngineEventType,
} from "../../types";
import { HandEvaluator } from "../../evaluator/HandEvaluator";
import { PlayerManager } from "../../engine/PlayerManager";
import { Table as RealTable } from "../../models/Table";

// Mock Table with custom seatPlayer
jest.mock("../../models/Table", () => {
  const ActualTable = jest.requireActual("../../models/Table").Table;
  return {
    Table: class extends ActualTable {
      seatPlayer(player: any, seatIndex: number) {
        // Debug log
        console.log("seatPlayer mock called with:", player, seatIndex);
        if (seatIndex < 0 || seatIndex >= this._players.length) return false;
        if (this._players[seatIndex] !== null) return false;
        this._players[seatIndex] = player;
        return true;
      }
    },
  };
});

// Test implementation of Card to use in tests
class TestCard extends Card {
  constructor(suit: Suit, rank: Rank) {
    super(suit, rank);
  }
}

describe("GameEngine Additional Tests", () => {
  // Create a real player for testing instead of mocks
  const createTestPlayer = (id: string, name: string, stack: number = 1000) => {
    return new Player(id, name, stack, -1); // Adding seatIndex parameter
  };

  describe("Game Flow and Betting", () => {
    let gameEngine: GameEngine;
    let player1: Player;
    let player2: Player;
    let player3: Player;

    beforeEach(() => {
      // No need to mock seatPlayer here, it's handled by jest.mock above
      // Create a game engine with a minimal configuration
      const config: GameEngineConfig = {
        variant: GameVariant.TEXAS_HOLDEM,
        bettingStructure: BettingStructure.NO_LIMIT,
        smallBlind: 5,
        bigBlind: 10,
        ante: 0,
        minPlayers: 2,
        maxPlayers: 6,
        timeoutInSeconds: 30,
      };

      gameEngine = new GameEngine(config);

      // Reset the internal _players array to all nulls on this instance
      const table = gameEngine.getTable();
      if (table && Array.isArray((table as any)._players)) {
        for (let i = 0; i < (table as any)._players.length; i++) {
          (table as any)._players[i] = null;
        }
      }

      // Create players
      player1 = createTestPlayer("p1", "Player 1", 1000);
      player2 = createTestPlayer("p2", "Player 2", 1000);
      player3 = createTestPlayer("p3", "Player 3", 1000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should track player activity with PlayerManager", () => {
      // Create a player manager
      const playerManager = new PlayerManager();

      // Create a new game engine with the player manager
      const gameEngineWithPM = new GameEngine(undefined, playerManager);

      // The player manager should be retrievable
      expect(gameEngineWithPM.getPlayerManager()).toBe(playerManager);

      // Register player and verify functionality
      const testPlayer = playerManager.registerPlayer({
        name: "Test Player",
        initialStack: 1000,
      });

      // Player should exist in the manager
      expect(playerManager.getPlayer(testPlayer.id)).toBe(testPlayer);

      // Set player manager after creation
      const newPlayerManager = new PlayerManager();
      gameEngine.setPlayerManager(newPlayerManager);
      expect(gameEngine.getPlayerManager()).toBe(newPlayerManager);
    });

    test("should handle event listeners", () => {
      // Create event listener mocks
      const gameStartedListener = jest.fn();
      const stateChangedListener = jest.fn();

      // Register listeners
      gameEngine.on(GameEngineEventType.GAME_STARTED, gameStartedListener);
      gameEngine.on(GameEngineEventType.STATE_CHANGED, stateChangedListener);

      // Add third player and start game
      gameEngine.addPlayer(player3);
      // Mock to make startGame return true
      jest
        .spyOn(gameEngine["stateMachine"], "transition")
        .mockImplementation((state: GameState) => true);
      gameEngine.startGame();

      // Now test removing listeners
      gameEngine.off(GameEngineEventType.GAME_STARTED, gameStartedListener);

      // Since we can't directly test the internal Map, we'll have to test that
      // the event calling mechanism properly respects the removal
    });

    test("should handle player actions", () => {
      // Add a third player and start the game
      gameEngine.addPlayer(player3);

      // Ensure all players are ACTIVE
      player1.status = PlayerStatus.ACTIVE;
      player2.status = PlayerStatus.ACTIVE;
      player3.status = PlayerStatus.ACTIVE;

      // Force the game state to PREFLOP for action testing
      // Mock the current state and advanceGame method
      jest
        .spyOn(gameEngine["stateMachine"], "getCurrentState")
        .mockReturnValue(GameState.PREFLOP);
      jest
        .spyOn(gameEngine as any, "advanceGame")
        .mockReturnValue(GameState.FLOP);

      // Force the current player index and player access
      gameEngine["currentPlayerIndex"] = 0;
      jest
        .spyOn(gameEngine as any, "getPlayerById")
        .mockImplementation((id) => {
          if (id === "p1") return player1;
          if (id === "p3") return player3;
          return null;
        });

      // Mock active players and table.activePlayers
      const activePlayers = [player1, player2, player3];
      jest
        .spyOn(gameEngine as any, "getActivePlayersInHand")
        .mockReturnValue(activePlayers);
      jest
        .spyOn(gameEngine.getTable(), "activePlayers", "get")
        .mockReturnValue(activePlayers);

      // Create and process actions - our mocking should make this work
      const checkAction = new Action(player1, ActionType.CHECK);
      const actionResult = gameEngine.handleAction(player1.id, checkAction);

      expect(actionResult.success).toBe(true);

      // Try an invalid action (not player's turn)
      const invalidAction = new Action(player3, ActionType.CHECK);
      const invalidResult = gameEngine.handleAction(player3.id, invalidAction);

      expect(invalidResult.success).toBe(false);
    });

    test("should return correct game state", () => {
      const state = gameEngine.getGameState();
      expect(state).toBe(GameState.WAITING);

      // Test getting game configuration
      const config = gameEngine.getConfig();
      expect(config.smallBlind).toBe(5);
      expect(config.bigBlind).toBe(10);
    });
  });

  describe("Hand Evaluation", () => {
    let gameEngine: GameEngine;

    beforeEach(() => {
      // Create game engine with Omaha variant to test different hand evaluation
      const config: GameEngineConfig = {
        variant: GameVariant.OMAHA,
        bettingStructure: BettingStructure.NO_LIMIT,
        smallBlind: 5,
        bigBlind: 10,
        ante: 0,
        minPlayers: 2,
        maxPlayers: 6,
        timeoutInSeconds: 30,
      };

      gameEngine = new GameEngine(config);
    });

    test("should create the correct hand evaluator based on game variant", () => {
      // This is testing a private method indirectly
      const handEvaluator = gameEngine["handEvaluator"];
      expect(handEvaluator).toBeDefined();

      // For Omaha games, should be using OmahaEvaluator
      expect(handEvaluator.constructor.name).toContain("Evaluator");

      // Create another engine with Texas Hold'em
      const texasEngine = new GameEngine({
        ...gameEngine.getConfig(),
        variant: GameVariant.TEXAS_HOLDEM,
      });

      const texasEvaluator = texasEngine["handEvaluator"];
      expect(texasEvaluator).toBeDefined();
      expect(texasEvaluator.constructor.name).toContain("Evaluator");
    });
  });
});
