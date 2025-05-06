import { GameEngine, ActionResult, HandWinner } from "../../engine/GameEngine";
import { Player } from "../../models/Player";
import { Card } from "../../models/Card";
import { Action } from "../../models/Action";
import { Pot, PotManager } from "../../models/Pot";
import { Table } from "../../models/Table";
import { PlayerManager } from "../../engine/PlayerManager";
import { GameStateMachine } from "../../engine/StateMachine";
import { Dealer } from "../../engine/Dealer";
import { HandEvaluator } from "../../evaluator/HandEvaluator";
import {
  GameState,
  PlayerStatus,
  ActionType,
  GameVariant,
  BettingStructure,
  Rank,
  Suit,
} from "../../types";
import { TexasHoldemEvaluator } from "../../evaluator/TexasHoldemEvaluator";

// We'll create more focused tests to improve coverage of specific methods
describe("GameEngine Coverage Improvement Tests", () => {
  let gameEngine: GameEngine;
  let players: Player[];
  let mockStateMachine: jest.Mocked<GameStateMachine>;
  let mockHandEvaluator: jest.Mocked<HandEvaluator>;
  let mockDealer: jest.Mocked<Dealer>;
  let mockTable: jest.Mocked<Table>;
  let mockPotManager: jest.Mocked<PotManager>;
  let mockPlayerManager: jest.Mocked<PlayerManager>;

  beforeEach(() => {
    // Setup mock players
    players = [];
    for (let i = 0; i < 4; i++) {
      const player = new Player(`player${i}`, `Player ${i}`, 1000, i);
      player.status = PlayerStatus.ACTIVE;

      // Mock some methods for testing
      jest.spyOn(player, "isActive").mockReturnValue(true);
      jest.spyOn(player, "placeBet").mockImplementation((amount) => {
        const actualBet = Math.min(amount, player.stack);
        player.stack -= actualBet;
        player.currentBet += actualBet;
        return actualBet;
      });

      jest.spyOn(player, "addWinnings").mockImplementation((amount) => {
        player.stack += amount;
      });

      players.push(player);
    }

    // Create mocks for dependencies
    mockStateMachine = {
      getCurrentState: jest.fn().mockReturnValue(GameState.WAITING),
      transition: jest.fn(),
      addStateChangeListener: jest.fn(),
      canTransitionTo: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<GameStateMachine>;

    mockHandEvaluator = {
      evaluate: jest.fn().mockReturnValue({
        rank: 1,
        rankValue: 100,
        bestCards: [],
        description: "High Card",
      }),
      compareHands: jest.fn().mockReturnValue(1),
    } as unknown as jest.Mocked<HandEvaluator>;

    mockDealer = {
      reset: jest.fn(),
      dealHoleCards: jest.fn().mockReturnValue(new Map()),
      dealFlop: jest.fn().mockReturnValue([]),
      dealTurn: jest.fn().mockReturnValue(new Card(Suit.CLUBS, Rank.ACE)),
      dealRiver: jest.fn().mockReturnValue(new Card(Suit.DIAMONDS, Rank.KING)),
    } as unknown as jest.Mocked<Dealer>;

    mockTable = {
      id: "test-table",
      name: "Test Table",
      players: players,
      activePlayers: players,
      clearCommunityCards: jest.fn(),
      addCommunityCards: jest.fn(),
      communityCards: [],
      currentBet: 0,
      minRaise: 20,
      totalPot: 0,
      seatPlayer: jest.fn().mockReturnValue(true),
      removePlayer: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<Table>;

    mockPotManager = {
      clear: jest.fn(),
      addBet: jest.fn(),
      collectBets: jest.fn(),
      get totalPotAmount() {
        return this._mockPotAmount;
      },
      _mockPotAmount: 0,
      mainPot: {} as Pot,
      sidePots: [],
    } as any;

    mockPlayerManager = {
      registerTable: jest.fn(),
      updatePlayerActivity: jest.fn(),
      getPlayerSession: jest.fn().mockReturnValue({
        currentTableId: "test-table",
        seatIndex: 0,
        isActive: true,
      }),
      updatePlayerStats: jest.fn(),
    } as unknown as jest.Mocked<PlayerManager>;

    // Create GameEngine instance with our mocks
    gameEngine = new GameEngine();

    // Replace internal properties with our mocks
    (gameEngine as any).stateMachine = mockStateMachine;
    (gameEngine as any).table = mockTable;
    (gameEngine as any).dealer = mockDealer;
    (gameEngine as any).potManager = mockPotManager;
    (gameEngine as any).handEvaluator = mockHandEvaluator;
    (gameEngine as any).playerManager = mockPlayerManager;

    // Mock other methods
    jest.spyOn(gameEngine as any, "emit").mockImplementation();
    jest.spyOn(gameEngine as any, "advanceGame").mockImplementation();
    jest.spyOn(gameEngine as any, "notifyPlayerTurn").mockImplementation();
  });

  describe("Dealer Integration Tests", () => {
    test("should deal hole cards via dealer", () => {
      // Setup
      (gameEngine as any).getActivePlayersInHand = jest
        .fn()
        .mockReturnValue(players);

      // Call private method directly
      (gameEngine as any).dealHoleCards();

      // Verify dealer was called with active players
      expect(mockDealer.dealHoleCards).toHaveBeenCalledWith(players, 2);

      // Verify event was emitted
      expect((gameEngine as any).emit).toHaveBeenCalledWith(
        "stateChanged",
        expect.objectContaining({
          oldState: GameState.STARTING,
          newState: GameState.PREFLOP,
        })
      );
    });

    test("should deal flop via dealer", () => {
      // Call private method directly
      (gameEngine as any).dealFlop();

      // Verify dealer was called
      expect(mockDealer.dealFlop).toHaveBeenCalledWith(mockTable);

      // Verify event was emitted
      expect((gameEngine as any).emit).toHaveBeenCalledWith(
        "stateChanged",
        expect.objectContaining({
          oldState: GameState.PREFLOP,
          newState: GameState.FLOP,
        })
      );
    });

    test("should deal turn via dealer", () => {
      // Setup mock to return a card
      const mockCard = new Card(Suit.HEARTS, Rank.ACE);
      mockDealer.dealTurn.mockReturnValue(mockCard);

      // Call private method directly
      (gameEngine as any).dealTurn();

      // Verify dealer was called
      expect(mockDealer.dealTurn).toHaveBeenCalledWith(mockTable);

      // Verify event was emitted with the card
      expect((gameEngine as any).emit).toHaveBeenCalledWith(
        "stateChanged",
        expect.objectContaining({
          oldState: GameState.FLOP,
          newState: GameState.TURN,
          cards: [mockCard],
        })
      );
    });

    test("should deal river via dealer", () => {
      // Setup mock to return a card
      const mockCard = new Card(Suit.SPADES, Rank.KING);
      mockDealer.dealRiver.mockReturnValue(mockCard);

      // Call private method directly
      (gameEngine as any).dealRiver();

      // Verify dealer was called
      expect(mockDealer.dealRiver).toHaveBeenCalledWith(mockTable);

      // Verify event was emitted with the card
      expect((gameEngine as any).emit).toHaveBeenCalledWith(
        "stateChanged",
        expect.objectContaining({
          oldState: GameState.TURN,
          newState: GameState.RIVER,
          cards: [mockCard],
        })
      );
    });
  });

  describe("Game State Transitions", () => {
    test("should handle state changes and reset bet amounts", () => {
      // Setup
      const oldState = GameState.PREFLOP;
      const newState = GameState.FLOP;

      // Mock the setFirstPlayerToAct method
      (gameEngine as any).setFirstPlayerToAct = jest.fn();

      // Call the handler directly
      (gameEngine as any).handleStateChange(oldState, newState);

      // Verify bet was reset for new betting round
      expect(mockTable.currentBet).toBe(0);
      expect((gameEngine as any).setFirstPlayerToAct).toHaveBeenCalled();
      expect((gameEngine as any).emit).toHaveBeenCalledWith("stateChanged", {
        oldState,
        newState,
      });
    });

    test("should handle transition to FINISHED state", () => {
      // Setup
      const oldState = GameState.SHOWDOWN;
      const newState = GameState.FINISHED;

      // Call the handler directly
      (gameEngine as any).handleStateChange(oldState, newState);

      // Verify cleanup actions were taken
      expect(mockPotManager.clear).toHaveBeenCalled();
      expect((gameEngine as any).emit).toHaveBeenCalledWith("stateChanged", {
        oldState,
        newState,
      });
    });
  });

  describe("Hand Resolution Tests", () => {
    test("should resolve hand with one remaining player", () => {
      // Setup - only one active player
      const winner = players[0];
      (gameEngine as any).getActivePlayersInHand = jest
        .fn()
        .mockReturnValue([winner]);

      // Set up the table mock with proper totalPot value
      mockTable = {
        ...mockTable,
        totalPot: 100,
      } as any;

      // Update the game engine's table reference
      (gameEngine as any).table = mockTable;

      // Call resolveHand directly
      const winners = (gameEngine as any).resolveHand();

      // Verify winner gets the pot
      expect(winners.length).toBe(1);
      expect(winners[0].player).toBe(winner);
      expect(winners[0].potAmount).toBe(100);
      expect(winner.addWinnings).toHaveBeenCalledWith(100);
      expect(mockPotManager.clear).toHaveBeenCalled();
      expect(mockPlayerManager.updatePlayerStats).toHaveBeenCalled();
    });

    test("should determine winner with hand evaluation", () => {
      // Setup multiple active players
      (gameEngine as any).getActivePlayersInHand = jest
        .fn()
        .mockReturnValue(players);

      // Set up the table mock with proper totalPot value
      mockTable = {
        ...mockTable,
        totalPot: 200,
      } as any;

      // Update the game engine's table reference
      (gameEngine as any).table = mockTable;

      // Create custom hand evaluation results
      const handResults = players.map((player) => ({
        player, // Associate each result with a player
        rank: 1,
        rankValue: player === players[1] ? 200 : 100, // Player 1 has the best hand
        bestCards: [],
        description: "High Card",
      }));

      // Mock the evaluate function to return the prepared results
      (gameEngine as any).handEvaluator.evaluate = jest
        .fn()
        .mockImplementation((hand) => {
          // Find the player who owns this hand
          const player = players.find((p) => p.hand === hand);
          // Return the corresponding hand result
          return handResults.find((result) => result.player === player);
        });

      // Mock the hand comparison to make player[1] always win
      (gameEngine as any).handEvaluator.compareHands = jest
        .fn()
        .mockImplementation((hand1, hand2) => {
          if (hand1.rankValue > hand2.rankValue) return 1;
          if (hand1.rankValue < hand2.rankValue) return -1;
          return 0;
        });

      // Call resolveHand directly
      const winners = (gameEngine as any).resolveHand();

      // Verify the right player won
      expect(winners.length).toBe(1);
      expect(winners[0].player).toBe(players[1]);
      expect(winners[0].potAmount).toBe(200);
      expect(players[1].addWinnings).toHaveBeenCalledWith(200);
      expect(mockPotManager.clear).toHaveBeenCalled();
    });
  });

  describe("Player Management Tests", () => {
    test("should add player successfully", () => {
      // Setup
      const newPlayer = new Player("new", "New Player", 1000, 5);

      // Create a completely new table mock with empty seats
      const emptySeatsTable = {
        ...mockTable,
        players: Array(6).fill(null),
        seatPlayer: jest.fn().mockReturnValue(true),
      } as any;

      // Replace the game engine's table
      (gameEngine as any).table = emptySeatsTable;

      // Act
      const result = gameEngine.addPlayer(newPlayer);

      // Assert
      expect(result).toBe(true);
      expect(emptySeatsTable.seatPlayer).toHaveBeenCalledWith(
        newPlayer,
        expect.any(Number)
      );
      expect(mockPlayerManager.updatePlayerActivity).toHaveBeenCalledWith(
        newPlayer.id
      );
    });

    test("should remove player successfully", () => {
      // Setup
      const playerId = players[0].id;

      // Act
      const result = gameEngine.removePlayer(playerId);

      // Assert
      expect(result).toBe(true);
      expect(mockTable.removePlayer).toHaveBeenCalledWith(playerId);
      expect(mockPlayerManager.getPlayerSession).toHaveBeenCalledWith(playerId);
    });
  });

  describe("Player Action Processing Tests", () => {
    test("should handle fold action", () => {
      // Setup
      const player = players[0];
      const action = new Action(player, ActionType.FOLD);

      // Mock to ensure it's the player's turn
      (gameEngine as any).getPlayerById = jest.fn().mockReturnValue(player);
      (gameEngine as any).getActivePlayersInHand = jest
        .fn()
        .mockReturnValue(players);
      (gameEngine as any).currentPlayerIndex = 0; // First player's turn

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(player.status).toBe(PlayerStatus.FOLDED);
      expect((gameEngine as any).advanceGame).toHaveBeenCalled();
    });

    test("should handle bet/raise action", () => {
      // Setup
      const player = players[0];
      const action = new Action(player, ActionType.BET, 50);

      // Mock to ensure it's the player's turn
      (gameEngine as any).getPlayerById = jest.fn().mockReturnValue(player);
      (gameEngine as any).getActivePlayersInHand = jest
        .fn()
        .mockReturnValue(players);
      (gameEngine as any).currentPlayerIndex = 0; // First player's turn
      (gameEngine as any).clearActionTimeout = jest.fn();
      mockTable.currentBet = 0;

      // Act
      const result = gameEngine.handleAction(player.id, action);

      // Assert
      expect(result.success).toBe(true);
      expect(player.placeBet).toHaveBeenCalledWith(50);
      expect((gameEngine as any).emit).toHaveBeenCalledWith(
        "playerAction",
        expect.objectContaining({
          player,
          action,
        })
      );
    });
  });

  describe("Pot Management Tests", () => {
    test("should collect bets into pot", () => {
      // Setup - players have bets
      players.forEach((p) => (p.currentBet = 20));

      // Act
      (gameEngine as any).collectBets();

      // Assert
      expect(mockPotManager.addBet).toHaveBeenCalledTimes(players.length);
      expect(mockPotManager.collectBets).toHaveBeenCalled();
      players.forEach((p) => expect(p.currentBet).toBe(0));
    });
  });
});
