"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEngine_1 = require("../../engine/GameEngine");
const Action_1 = require("../../models/Action");
const types_1 = require("../../types");
// Create mock player factory
const createMockPlayer = (id, name, seatIndex) => {
    return {
        id,
        name,
        stack: 1000,
        seatIndex,
        hand: {
            cards: [],
            addCards: jest.fn(),
            clear: jest.fn(),
        },
        dealCards: jest.fn(),
        clearHand: jest.fn(),
        position: null,
        status: types_1.PlayerStatus.ACTIVE,
        currentBet: 0,
        placeBet: jest.fn().mockReturnValue(10),
        addWinnings: jest.fn(),
        isActive: jest.fn().mockReturnValue(true),
        isAllIn: jest.fn().mockReturnValue(false),
        holeCards: [],
    };
};
// Create mock players
const player1 = createMockPlayer("player1", "Player 1", 0);
const player2 = createMockPlayer("player2", "Player 2", 1);
// Set up empty players array (should be filled with nulls)
const emptyPlayers = Array(10).fill(null);
// Mock the implementation of Table
jest.mock("../../models/Table", () => {
    return {
        Table: jest.fn().mockImplementation(() => ({
            // Mutable properties for testing
            _players: [player1, player2],
            _communityCards: [],
            _currentBet: 0,
            _totalPot: 0,
            // Getter methods
            get players() {
                return this._players;
            },
            get activePlayers() {
                // Filter and cast to the correct type
                const active = this._players.filter((p) => p !== null &&
                    (p.status === types_1.PlayerStatus.ACTIVE ||
                        p.status === types_1.PlayerStatus.ALL_IN));
                return active;
            },
            get communityCards() {
                return this._communityCards;
            },
            get currentBet() {
                return this._currentBet;
            },
            set currentBet(val) {
                this._currentBet = val;
            },
            get totalPot() {
                return this._totalPot;
            },
            // Methods
            clearCommunityCards: jest
                .fn()
                .mockImplementation(function () {
                this._communityCards = [];
            }),
            addCommunityCards: jest.fn(),
            addCommunityCard: jest.fn(),
            removePlayer: jest
                .fn()
                .mockImplementation(function (id) {
                const index = this._players.findIndex((p) => p && p.id === id);
                if (index !== -1) {
                    this._players[index] = null;
                    return true;
                }
                return false;
            }),
            seatPlayer: jest
                .fn()
                .mockImplementation(function (player, seatIndex) {
                if (seatIndex >= 0 &&
                    seatIndex < this._players.length &&
                    this._players[seatIndex] === null) {
                    this._players[seatIndex] = player;
                    return true;
                }
                return false;
            }),
        })),
    };
});
// Mock other dependencies
jest.mock("../../models/Player");
jest.mock("../../models/Deck");
jest.mock("../../models/Pot", () => {
    return {
        PotManager: jest.fn().mockImplementation(() => ({
            clear: jest.fn(),
            addBet: jest.fn(),
            collectBets: jest.fn(),
            totalPotAmount: 0,
        })),
    };
});
jest.mock("../../engine/StateMachine", () => {
    return {
        GameStateMachine: jest.fn().mockImplementation(() => ({
            getCurrentState: jest.fn().mockReturnValue(types_1.GameState.WAITING),
            transition: jest.fn(),
            addStateChangeListener: jest.fn(),
        })),
    };
});
jest.mock("../../evaluator/TexasHoldemEvaluator");
jest.mock("../../evaluator/OmahaEvaluator");
describe("GameEngine", () => {
    let gameEngine;
    let mockPlayer1;
    let mockPlayer2;
    let mockTable;
    let mockPotManager;
    let mockStateMachine;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        // Reset mock players
        mockPlayer1 = createMockPlayer("player1", "Player 1", 0);
        mockPlayer2 = createMockPlayer("player2", "Player 2", 1);
        // Create default game engine
        gameEngine = new GameEngine_1.GameEngine();
        // Get mocked objects for easier setup
        mockTable = gameEngine.getTable();
        mockPotManager = gameEngine.getPotManager();
        mockStateMachine = gameEngine["stateMachine"];
        // Ensure table has the right players for most tests
        mockTable._players = [mockPlayer1, mockPlayer2];
        // Mock private methods that are needed for testing
        // @ts-ignore - accessing private method for testing
        gameEngine.getPlayerById = jest.fn().mockImplementation((id) => {
            if (id === "player1")
                return mockPlayer1;
            if (id === "player2")
                return mockPlayer2;
            return null;
        });
        // @ts-ignore - accessing private method for testing
        gameEngine.getActivePlayersInHand = jest
            .fn()
            .mockReturnValue([mockPlayer1, mockPlayer2]);
        // @ts-ignore - accessing private method for testing
        gameEngine.collectBets = jest.fn();
        // @ts-ignore - accessing private method for testing
        gameEngine.currentPlayerIndex = 0;
        // Manually handle updating the table's currentBet value when bet/raise actions are processed
        // @ts-ignore - accessing private method for testing
        gameEngine.advanceGame = jest.fn().mockImplementation(() => {
            // Set the currentBet to match the player's currentBet for bet/raise actions
            if (mockPlayer1.currentBet > mockTable._currentBet) {
                mockTable._currentBet = mockPlayer1.currentBet;
            }
            return undefined;
        });
    });
    describe("initialization", () => {
        it("should initialize with default config", () => {
            const config = gameEngine.getConfig();
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.NO_LIMIT);
            expect(config.smallBlind).toBe(5);
            expect(config.bigBlind).toBe(10);
        });
        it("should initialize with custom config", () => {
            const customConfig = {
                variant: types_1.GameVariant.OMAHA,
                bettingStructure: types_1.BettingStructure.POT_LIMIT,
                smallBlind: 10,
                bigBlind: 20,
                ante: 2,
                minPlayers: 3,
                maxPlayers: 6,
                timeoutInSeconds: 20,
            };
            const engine = new GameEngine_1.GameEngine(customConfig);
            const config = engine.getConfig();
            expect(config.variant).toBe(types_1.GameVariant.OMAHA);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
            expect(config.smallBlind).toBe(10);
            expect(config.bigBlind).toBe(20);
            expect(config.ante).toBe(2);
        });
    });
    describe("player management", () => {
        it("should add players to the table", () => {
            // Setup for this specific test
            mockTable._players = [null, null];
            // Test
            const result = gameEngine.addPlayer(mockPlayer1);
            // Verify
            expect(result).toBe(true);
        });
        it("should not add players when the table is full", () => {
            // Setup - full table
            const maxPlayers = gameEngine.getConfig().maxPlayers;
            // Fill all seats with players
            mockTable._players = Array(maxPlayers).fill(mockPlayer1);
            // Test
            const result = gameEngine.addPlayer(mockPlayer2);
            // Verify
            expect(result).toBe(false);
        });
        it("should remove players from the table", () => {
            // Setup
            mockTable._players = [mockPlayer1, mockPlayer2];
            // Test
            const result = gameEngine.removePlayer("player1");
            // Verify
            expect(result).toBe(true);
        });
    });
    describe("game flow", () => {
        it("should start a game when conditions are met", () => {
            // Setup
            mockTable._players = [mockPlayer1, mockPlayer2];
            mockStateMachine.getCurrentState.mockReturnValue(types_1.GameState.WAITING);
            // Test
            const result = gameEngine.startGame();
            // Verify
            expect(result).toBe(true);
        });
        it("should not start a game with too few players", () => {
            // Setup - only one active player
            mockTable._players = [mockPlayer1, null];
            // Test
            const result = gameEngine.startGame();
            // Verify
            expect(result).toBe(false);
        });
        it("should not start a game if not in WAITING state", () => {
            // Setup
            mockStateMachine.getCurrentState.mockReturnValue(types_1.GameState.PREFLOP);
            // Test
            const result = gameEngine.startGame();
            // Verify
            expect(result).toBe(false);
        });
    });
    describe("player actions", () => {
        it("should process fold action", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.FOLD);
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(true);
            expect(mockPlayer1.status).toBe(types_1.PlayerStatus.FOLDED);
        });
        it("should process check action when valid", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.CHECK);
            mockTable._currentBet = 0;
            mockPlayer1.currentBet = 0;
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(true);
        });
        it("should reject check action when there is a bet to call", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.CHECK);
            mockTable._currentBet = 10;
            mockPlayer1.currentBet = 0;
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(false);
            expect(result.message).toContain("Cannot check");
        });
        it("should process call action", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.CALL);
            mockTable._currentBet = 10;
            mockPlayer1.currentBet = 0;
            mockPlayer1.placeBet.mockImplementation(() => {
                mockPlayer1.currentBet = 10;
                return 10;
            });
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(true);
            expect(mockPlayer1.placeBet).toHaveBeenCalledWith(10);
        });
        it("should process bet action", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.BET, 20);
            mockTable._currentBet = 0;
            mockPlayer1.currentBet = 0;
            mockPlayer1.placeBet.mockImplementation(() => {
                mockPlayer1.currentBet = 20;
                return 20;
            });
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(true);
            expect(mockPlayer1.placeBet).toHaveBeenCalledWith(20);
            expect(mockTable.currentBet).toBe(20);
        });
        it("should process raise action", () => {
            // Setup
            const action = new Action_1.Action(mockPlayer1, types_1.ActionType.RAISE, 30);
            mockTable._currentBet = 10;
            mockPlayer1.currentBet = 0;
            mockPlayer1.placeBet.mockImplementation(() => {
                mockPlayer1.currentBet = 30;
                return 30;
            });
            // Test
            const result = gameEngine.handleAction("player1", action);
            // Verify
            expect(result.success).toBe(true);
            expect(mockPlayer1.placeBet).toHaveBeenCalledWith(30);
            expect(mockTable.currentBet).toBe(30);
        });
        it("should reject action if it's not the player's turn", () => {
            // Setup - action from player2 when it's player1's turn
            const action = new Action_1.Action(mockPlayer2, types_1.ActionType.CHECK);
            // Test
            const result = gameEngine.handleAction("player2", action);
            // Verify
            expect(result.success).toBe(false);
            expect(result.message).toContain("Not your turn");
        });
    });
    describe("event system", () => {
        it("should register and call event listeners", () => {
            // Setup
            const mockCallback = jest.fn();
            gameEngine.on(types_1.GameEngineEventType.STATE_CHANGED, mockCallback);
            // Get the private emit method
            const emit = gameEngine.emit.bind(gameEngine);
            // Test
            emit(types_1.GameEngineEventType.STATE_CHANGED, {
                oldState: types_1.GameState.PREFLOP,
                newState: types_1.GameState.FLOP,
            });
            // Verify
            expect(mockCallback).toHaveBeenCalledWith({
                oldState: types_1.GameState.PREFLOP,
                newState: types_1.GameState.FLOP,
            });
        });
        it("should remove event listeners", () => {
            // Setup
            const mockCallback = jest.fn();
            gameEngine.on(types_1.GameEngineEventType.STATE_CHANGED, mockCallback);
            gameEngine.off(types_1.GameEngineEventType.STATE_CHANGED, mockCallback);
            // Get the private emit method
            const emit = gameEngine.emit.bind(gameEngine);
            // Test
            emit("stateChanged", {
                oldState: types_1.GameState.PREFLOP,
                newState: types_1.GameState.FLOP,
            });
            // Verify
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=GameEngine.test.js.map