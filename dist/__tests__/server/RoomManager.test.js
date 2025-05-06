"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RoomManager_1 = require("../../server/RoomManager");
const WebSocketService_1 = require("../../server/WebSocketService");
const GameEventBus_1 = require("../../events/GameEventBus");
const GameEvents_1 = require("../../events/GameEvents");
// Mock WebSocketService
jest.mock("../../server/WebSocketService");
// Create mock WebSocketClient
const createMockClient = (id) => {
    return {
        id,
        send: jest.fn(),
        close: jest.fn(),
    };
};
describe("RoomManager", () => {
    let roomManager;
    let wsService;
    beforeEach(() => {
        // Clear mocks
        jest.clearAllMocks();
        // Reset event listeners
        GameEventBus_1.gameEventBus.removeAllListeners();
        // Create mock WebSocketService
        wsService = new WebSocketService_1.WebSocketService();
        // Create RoomManager with mock WebSocketService
        roomManager = new RoomManager_1.RoomManager(wsService);
    });
    test("should create a new room", () => {
        // Create a game event handler to verify events
        const gameCreatedHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.GAME_CREATED, gameCreatedHandler);
        // Create a room config
        const config = {
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        };
        // Create the room
        const room = roomManager.createRoom(config);
        // Verify room properties
        expect(room.id).toBeDefined();
        expect(room.config).toEqual(config);
        expect(room.players.size).toBe(0);
        expect(room.isActive).toBe(false);
        // Verify game created event
        expect(gameCreatedHandler).toHaveBeenCalledTimes(1);
        expect(gameCreatedHandler).toHaveBeenCalledWith(expect.objectContaining({
            gameId: room.id,
            maxPlayers: config.maxPlayers,
            blinds: config.blinds,
        }));
    });
    test("should add a player to a room", () => {
        // Create event handlers
        const playerJoinedHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, playerJoinedHandler);
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add a player
        const result = roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        // Verify result
        expect(result).toBe(true);
        // Verify player was added to room
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.players.size).toBe(1);
        expect(updatedRoom?.players.get("player1")).toEqual({
            id: "player1",
            name: "Player 1",
            stack: 200,
        });
        // Verify events
        expect(playerJoinedHandler).toHaveBeenCalledTimes(1);
        expect(playerJoinedHandler).toHaveBeenCalledWith(expect.objectContaining({
            playerId: "player1",
            seatIndex: 0,
        }));
        // Verify WebSocketService was called
        expect(wsService.joinRoom).toHaveBeenCalledWith("player1", room.id);
    });
    test("should not add a player if buy-in is invalid", () => {
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Try to add a player with too small buy-in
        const result1 = roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 50 // Below min
        );
        // Try to add a player with too large buy-in
        const result2 = roomManager.addPlayerToRoom(room.id, "player2", "Player 2", 600 // Above max
        );
        // Verify results
        expect(result1).toBe(false);
        expect(result2).toBe(false);
        // Verify no players were added
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.players.size).toBe(0);
    });
    test("should remove a player from a room", () => {
        // Create event handlers
        const playerLeftHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.PLAYER_LEFT, playerLeftHandler);
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add two players
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        roomManager.addPlayerToRoom(room.id, "player2", "Player 2", 300);
        // Remove a player
        const result = roomManager.removePlayerFromRoom(room.id, "player1");
        // Verify result
        expect(result).toBe(true);
        // Verify player was removed
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.players.size).toBe(1);
        expect(updatedRoom?.players.has("player1")).toBe(false);
        expect(updatedRoom?.players.has("player2")).toBe(true);
        // Verify events
        expect(playerLeftHandler).toHaveBeenCalledTimes(1);
        expect(playerLeftHandler).toHaveBeenCalledWith(expect.objectContaining({
            playerId: "player1",
            seatIndex: 0,
        }));
        // Verify WebSocketService was called
        expect(wsService.leaveRoom).toHaveBeenCalledWith("player1", room.id);
    });
    test("should start a game", () => {
        // Create event handlers
        const gameStartedHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.GAME_STARTED, gameStartedHandler);
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add players
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        roomManager.addPlayerToRoom(room.id, "player2", "Player 2", 300);
        // Start the game
        const result = roomManager.startGame(room.id);
        // Verify result
        expect(result).toBe(true);
        // Verify room is active
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.isActive).toBe(true);
        // Verify events
        expect(gameStartedHandler).toHaveBeenCalledTimes(1);
        expect(gameStartedHandler).toHaveBeenCalledWith(expect.objectContaining({
            gameId: room.id,
            dealerPosition: 0,
        }));
    });
    test("should not start a game with fewer than 2 players", () => {
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add only one player
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        // Try to start the game
        const result = roomManager.startGame(room.id);
        // Verify result
        expect(result).toBe(false);
        // Verify room is not active
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.isActive).toBe(false);
    });
    test("should end a game", () => {
        // Create event handlers
        const gameEndedHandler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.GAME_ENDED, gameEndedHandler);
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add players and start game
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        roomManager.addPlayerToRoom(room.id, "player2", "Player 2", 300);
        roomManager.startGame(room.id);
        // End the game
        const result = roomManager.endGame(room.id);
        // Verify result
        expect(result).toBe(true);
        // Verify room is not active
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.isActive).toBe(false);
        // Verify events
        expect(gameEndedHandler).toHaveBeenCalledTimes(1);
        expect(gameEndedHandler).toHaveBeenCalledWith(expect.objectContaining({
            gameId: room.id,
            duration: expect.any(Number),
        }));
    });
    test("should get active rooms", () => {
        // Create three rooms
        const room1 = roomManager.createRoom({
            name: "Room 1",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        const room2 = roomManager.createRoom({
            name: "Room 2",
            maxPlayers: 6,
            blinds: { small: 10, big: 20 },
            buyIn: { min: 200, max: 1000 },
        });
        const room3 = roomManager.createRoom({
            name: "Room 3",
            maxPlayers: 4,
            blinds: { small: 25, big: 50 },
            buyIn: { min: 500, max: 2000 },
        });
        // Add players to rooms
        roomManager.addPlayerToRoom(room1.id, "player1", "Player 1", 200);
        roomManager.addPlayerToRoom(room1.id, "player2", "Player 2", 300);
        roomManager.addPlayerToRoom(room2.id, "player3", "Player 3", 500);
        roomManager.addPlayerToRoom(room2.id, "player4", "Player 4", 600);
        roomManager.addPlayerToRoom(room3.id, "player5", "Player 5", 1000);
        roomManager.addPlayerToRoom(room3.id, "player6", "Player 6", 1500);
        // Start only two games
        roomManager.startGame(room1.id);
        roomManager.startGame(room3.id);
        // Get active rooms
        const activeRooms = roomManager.getActiveRooms();
        // Verify active rooms
        expect(activeRooms.length).toBe(2);
        expect(activeRooms.map((room) => room.id)).toContain(room1.id);
        expect(activeRooms.map((room) => room.id)).toContain(room3.id);
        expect(activeRooms.map((room) => room.id)).not.toContain(room2.id);
    });
    test("should remove empty rooms", () => {
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add a player
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        // Verify room exists
        expect(roomManager.getRoom(room.id)).toBeDefined();
        // Remove the player
        roomManager.removePlayerFromRoom(room.id, "player1");
        // Verify room was removed
        expect(roomManager.getRoom(room.id)).toBeUndefined();
    });
    test("should handle WebSocket disconnections", () => {
        // Create a room
        const room = roomManager.createRoom({
            name: "Test Room",
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
            buyIn: { min: 100, max: 500 },
        });
        // Add players
        roomManager.addPlayerToRoom(room.id, "player1", "Player 1", 200);
        roomManager.addPlayerToRoom(room.id, "player2", "Player 2", 300);
        // Get the client:disconnected event handler
        const disconnectHandlers = wsService.on.mock.calls.filter((call) => call[0] === "client:disconnected");
        expect(disconnectHandlers.length).toBe(1);
        const disconnectHandler = disconnectHandlers[0][1];
        // Simulate client disconnection
        disconnectHandler({ clientId: "player1" });
        // Verify player was removed
        const updatedRoom = roomManager.getRoom(room.id);
        expect(updatedRoom?.players.size).toBe(1);
        expect(updatedRoom?.players.has("player1")).toBe(false);
    });
});
//# sourceMappingURL=RoomManager.test.js.map