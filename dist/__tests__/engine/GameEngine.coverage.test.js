"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEngine_1 = require("../../engine/GameEngine");
const Player_1 = require("../../models/Player");
const Card_1 = require("../../models/Card");
const Action_1 = require("../../models/Action");
const types_1 = require("../../types");
// We'll create more focused tests to improve coverage of specific methods
describe("GameEngine Coverage Improvement Tests", () => {
    let gameEngine;
    let players;
    let mockStateMachine;
    let mockHandEvaluator;
    let mockDealer;
    let mockTable;
    let mockPotManager;
    let mockPlayerManager;
    beforeEach(() => {
        // Setup mock players
        players = [];
        for (let i = 0; i < 4; i++) {
            const player = new Player_1.Player(`player${i}`, `Player ${i}`, 1000, i);
            player.status = types_1.PlayerStatus.ACTIVE;
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
            getCurrentState: jest.fn().mockReturnValue(types_1.GameState.WAITING),
            transition: jest.fn(),
            addStateChangeListener: jest.fn(),
            canTransitionTo: jest.fn().mockReturnValue(true),
        };
        mockHandEvaluator = {
            evaluate: jest.fn().mockReturnValue({
                rank: 1,
                rankValue: 100,
                bestCards: [],
                description: "High Card",
            }),
            compareHands: jest.fn().mockReturnValue(1),
        };
        mockDealer = {
            reset: jest.fn(),
            dealHoleCards: jest.fn().mockReturnValue(new Map()),
            dealFlop: jest.fn().mockReturnValue([]),
            dealTurn: jest.fn().mockReturnValue(new Card_1.Card(types_1.Suit.CLUBS, types_1.Rank.ACE)),
            dealRiver: jest.fn().mockReturnValue(new Card_1.Card(types_1.Suit.DIAMONDS, types_1.Rank.KING)),
        };
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
        };
        mockPotManager = {
            clear: jest.fn(),
            addBet: jest.fn(),
            collectBets: jest.fn(),
            get totalPotAmount() {
                return this._mockPotAmount;
            },
            _mockPotAmount: 0,
            mainPot: {},
            sidePots: [],
        };
        mockPlayerManager = {
            registerTable: jest.fn(),
            updatePlayerActivity: jest.fn(),
            getPlayerSession: jest.fn().mockReturnValue({
                currentTableId: "test-table",
                seatIndex: 0,
                isActive: true,
            }),
            updatePlayerStats: jest.fn(),
        };
        // Create GameEngine instance with our mocks
        gameEngine = new GameEngine_1.GameEngine();
        // Replace internal properties with our mocks
        gameEngine.stateMachine = mockStateMachine;
        gameEngine.table = mockTable;
        gameEngine.dealer = mockDealer;
        gameEngine.potManager = mockPotManager;
        gameEngine.handEvaluator = mockHandEvaluator;
        gameEngine.playerManager = mockPlayerManager;
        // Mock other methods
        jest.spyOn(gameEngine, "emit").mockImplementation();
        jest.spyOn(gameEngine, "advanceGame").mockImplementation();
        jest.spyOn(gameEngine, "notifyPlayerTurn").mockImplementation();
    });
    describe("Dealer Integration Tests", () => {
        test("should deal hole cards via dealer", () => {
            // Setup
            gameEngine.getActivePlayersInHand = jest
                .fn()
                .mockReturnValue(players);
            // Call private method directly
            gameEngine.dealHoleCards();
            // Verify dealer was called with active players
            expect(mockDealer.dealHoleCards).toHaveBeenCalledWith(players, 2);
            // Verify event was emitted
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", expect.objectContaining({
                oldState: types_1.GameState.STARTING,
                newState: types_1.GameState.PREFLOP,
            }));
        });
        test("should deal flop via dealer", () => {
            // Call private method directly
            gameEngine.dealFlop();
            // Verify dealer was called
            expect(mockDealer.dealFlop).toHaveBeenCalledWith(mockTable);
            // Verify event was emitted
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", expect.objectContaining({
                oldState: types_1.GameState.PREFLOP,
                newState: types_1.GameState.FLOP,
            }));
        });
        test("should deal turn via dealer", () => {
            // Setup mock to return a card
            const mockCard = new Card_1.Card(types_1.Suit.HEARTS, types_1.Rank.ACE);
            mockDealer.dealTurn.mockReturnValue(mockCard);
            // Call private method directly
            gameEngine.dealTurn();
            // Verify dealer was called
            expect(mockDealer.dealTurn).toHaveBeenCalledWith(mockTable);
            // Verify event was emitted with the card
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", expect.objectContaining({
                oldState: types_1.GameState.FLOP,
                newState: types_1.GameState.TURN,
                cards: [mockCard],
            }));
        });
        test("should deal river via dealer", () => {
            // Setup mock to return a card
            const mockCard = new Card_1.Card(types_1.Suit.SPADES, types_1.Rank.KING);
            mockDealer.dealRiver.mockReturnValue(mockCard);
            // Call private method directly
            gameEngine.dealRiver();
            // Verify dealer was called
            expect(mockDealer.dealRiver).toHaveBeenCalledWith(mockTable);
            // Verify event was emitted with the card
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", expect.objectContaining({
                oldState: types_1.GameState.TURN,
                newState: types_1.GameState.RIVER,
                cards: [mockCard],
            }));
        });
    });
    describe("Game State Transitions", () => {
        test("should handle state changes and reset bet amounts", () => {
            // Setup
            const oldState = types_1.GameState.PREFLOP;
            const newState = types_1.GameState.FLOP;
            // Mock the setFirstPlayerToAct method
            gameEngine.setFirstPlayerToAct = jest.fn();
            // Call the handler directly
            gameEngine.handleStateChange(oldState, newState);
            // Verify bet was reset for new betting round
            expect(mockTable.currentBet).toBe(0);
            expect(gameEngine.setFirstPlayerToAct).toHaveBeenCalled();
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", {
                oldState,
                newState,
            });
        });
        test("should handle transition to FINISHED state", () => {
            // Setup
            const oldState = types_1.GameState.SHOWDOWN;
            const newState = types_1.GameState.FINISHED;
            // Call the handler directly
            gameEngine.handleStateChange(oldState, newState);
            // Verify cleanup actions were taken
            expect(mockPotManager.clear).toHaveBeenCalled();
            expect(gameEngine.emit).toHaveBeenCalledWith("stateChanged", {
                oldState,
                newState,
            });
        });
    });
    describe("Hand Resolution Tests", () => {
        test("should resolve hand with one remaining player", () => {
            // Setup - only one active player
            const winner = players[0];
            gameEngine.getActivePlayersInHand = jest
                .fn()
                .mockReturnValue([winner]);
            // Set up the table mock with proper totalPot value
            mockTable = {
                ...mockTable,
                totalPot: 100,
            };
            // Update the game engine's table reference
            gameEngine.table = mockTable;
            // Call resolveHand directly
            const winners = gameEngine.resolveHand();
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
            gameEngine.getActivePlayersInHand = jest
                .fn()
                .mockReturnValue(players);
            // Set up the table mock with proper totalPot value
            mockTable = {
                ...mockTable,
                totalPot: 200,
            };
            // Update the game engine's table reference
            gameEngine.table = mockTable;
            // Create custom hand evaluation results
            const handResults = players.map((player) => ({
                player, // Associate each result with a player
                rank: 1,
                rankValue: player === players[1] ? 200 : 100, // Player 1 has the best hand
                bestCards: [],
                description: "High Card",
            }));
            // Mock the evaluate function to return the prepared results
            gameEngine.handEvaluator.evaluate = jest
                .fn()
                .mockImplementation((hand) => {
                // Find the player who owns this hand
                const player = players.find((p) => p.hand === hand);
                // Return the corresponding hand result
                return handResults.find((result) => result.player === player);
            });
            // Mock the hand comparison to make player[1] always win
            gameEngine.handEvaluator.compareHands = jest
                .fn()
                .mockImplementation((hand1, hand2) => {
                if (hand1.rankValue > hand2.rankValue)
                    return 1;
                if (hand1.rankValue < hand2.rankValue)
                    return -1;
                return 0;
            });
            // Call resolveHand directly
            const winners = gameEngine.resolveHand();
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
            const newPlayer = new Player_1.Player("new", "New Player", 1000, 5);
            // Create a completely new table mock with empty seats
            const emptySeatsTable = {
                ...mockTable,
                players: Array(6).fill(null),
                seatPlayer: jest.fn().mockReturnValue(true),
            };
            // Replace the game engine's table
            gameEngine.table = emptySeatsTable;
            // Act
            const result = gameEngine.addPlayer(newPlayer);
            // Assert
            expect(result).toBe(true);
            expect(emptySeatsTable.seatPlayer).toHaveBeenCalledWith(newPlayer, expect.any(Number));
            expect(mockPlayerManager.updatePlayerActivity).toHaveBeenCalledWith(newPlayer.id);
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
            const action = new Action_1.Action(player, types_1.ActionType.FOLD);
            // Mock to ensure it's the player's turn
            gameEngine.getPlayerById = jest.fn().mockReturnValue(player);
            gameEngine.getActivePlayersInHand = jest
                .fn()
                .mockReturnValue(players);
            gameEngine.currentPlayerIndex = 0; // First player's turn
            // Act
            const result = gameEngine.handleAction(player.id, action);
            // Assert
            expect(result.success).toBe(true);
            expect(player.status).toBe(types_1.PlayerStatus.FOLDED);
            expect(gameEngine.advanceGame).toHaveBeenCalled();
        });
        test("should handle bet/raise action", () => {
            // Setup
            const player = players[0];
            const action = new Action_1.Action(player, types_1.ActionType.BET, 50);
            // Mock to ensure it's the player's turn
            gameEngine.getPlayerById = jest.fn().mockReturnValue(player);
            gameEngine.getActivePlayersInHand = jest
                .fn()
                .mockReturnValue(players);
            gameEngine.currentPlayerIndex = 0; // First player's turn
            gameEngine.clearActionTimeout = jest.fn();
            mockTable.currentBet = 0;
            // Act
            const result = gameEngine.handleAction(player.id, action);
            // Assert
            expect(result.success).toBe(true);
            expect(player.placeBet).toHaveBeenCalledWith(50);
            expect(gameEngine.emit).toHaveBeenCalledWith("playerAction", expect.objectContaining({
                player,
                action,
            }));
        });
    });
    describe("Pot Management Tests", () => {
        test("should collect bets into pot", () => {
            // Setup - players have bets
            players.forEach((p) => (p.currentBet = 20));
            // Act
            gameEngine.collectBets();
            // Assert
            expect(mockPotManager.addBet).toHaveBeenCalledTimes(players.length);
            expect(mockPotManager.collectBets).toHaveBeenCalled();
            players.forEach((p) => expect(p.currentBet).toBe(0));
        });
    });
});
//# sourceMappingURL=GameEngine.coverage.test.js.map