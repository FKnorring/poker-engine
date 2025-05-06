"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketService_1 = require("../../server/WebSocketService");
const GameEventBus_1 = require("../../events/GameEventBus");
const GameEvents_1 = require("../../events/GameEvents");
// Mock WebSocket client
const createMockClient = (id) => {
    return {
        id,
        send: jest.fn(),
        close: jest.fn(),
    };
};
// Mock the gameEventBus
jest.mock("../../events/GameEventBus", () => {
    const original = jest.requireActual("../../events/GameEventBus");
    return {
        ...original,
        gameEventBus: {
            on: jest.fn(),
            once: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            removeAllListeners: jest.fn(),
        },
    };
});
describe("WebSocketService", () => {
    let wsService;
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        // Create a new service
        wsService = new WebSocketService_1.WebSocketService();
    });
    test("should add and remove clients", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        // Register connection handler
        const connectionHandler = jest.fn();
        const disconnectionHandler = jest.fn();
        wsService.on("client:connected", connectionHandler);
        wsService.on("client:disconnected", disconnectionHandler);
        // Add clients
        wsService.addClient(client1);
        wsService.addClient(client2);
        expect(connectionHandler).toHaveBeenCalledTimes(2);
        // Remove a client
        wsService.removeClient("client1");
        expect(disconnectionHandler).toHaveBeenCalledTimes(1);
        expect(disconnectionHandler).toHaveBeenCalledWith({ clientId: "client1" });
    });
    test("should manage room memberships", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        const client3 = createMockClient("client3");
        wsService.addClient(client1);
        wsService.addClient(client2);
        wsService.addClient(client3);
        // Register room event handlers
        const joinHandler = jest.fn();
        const leaveHandler = jest.fn();
        wsService.on("room:joined", joinHandler);
        wsService.on("room:left", leaveHandler);
        // Join rooms
        wsService.joinRoom("client1", "room1");
        wsService.joinRoom("client2", "room1");
        wsService.joinRoom("client3", "room2");
        expect(joinHandler).toHaveBeenCalledTimes(3);
        // Leave a room
        wsService.leaveRoom("client1", "room1");
        expect(leaveHandler).toHaveBeenCalledTimes(1);
        expect(leaveHandler).toHaveBeenCalledWith({
            clientId: "client1",
            roomId: "room1",
        });
        // Remove a client should remove from all rooms
        wsService.joinRoom("client3", "room1");
        wsService.removeClient("client3");
        expect(leaveHandler).toHaveBeenCalledTimes(3);
    });
    test("should send messages to specific clients", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        wsService.addClient(client1);
        wsService.addClient(client2);
        const message = {
            type: "test",
            payload: { data: "test-data" },
        };
        wsService.sendToClient("client1", message);
        expect(client1.send).toHaveBeenCalledTimes(1);
        expect(client1.send).toHaveBeenCalledWith(message);
        expect(client2.send).not.toHaveBeenCalled();
    });
    test("should send messages to rooms", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        const client3 = createMockClient("client3");
        wsService.addClient(client1);
        wsService.addClient(client2);
        wsService.addClient(client3);
        wsService.joinRoom("client1", "room1");
        wsService.joinRoom("client2", "room1");
        wsService.joinRoom("client3", "room2");
        const message = {
            type: "test",
            payload: { roomMessage: true },
        };
        wsService.sendToRoom("room1", message);
        expect(client1.send).toHaveBeenCalledTimes(1);
        expect(client2.send).toHaveBeenCalledTimes(1);
        expect(client3.send).not.toHaveBeenCalled();
    });
    test("should broadcast messages to all clients", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        wsService.addClient(client1);
        wsService.addClient(client2);
        const message = {
            type: "broadcast",
            payload: { broadcastMessage: true },
        };
        wsService.broadcast(message);
        expect(client1.send).toHaveBeenCalledTimes(1);
        expect(client2.send).toHaveBeenCalledTimes(1);
    });
    test("should handle incoming messages", () => {
        const client = createMockClient("client1");
        wsService.addClient(client);
        // Setup message handler
        const messageHandler = jest.fn();
        wsService.on("message", messageHandler);
        // Setup custom event handler
        const customHandler = jest.fn();
        wsService.on("custom:event", customHandler);
        // Handle a regular message
        const message = {
            type: "custom:event",
            payload: { data: "custom-data" },
        };
        wsService.handleMessage("client1", message);
        expect(messageHandler).toHaveBeenCalledTimes(1);
        expect(customHandler).toHaveBeenCalledTimes(1);
        expect(customHandler).toHaveBeenCalledWith({
            clientId: "client1",
            payload: { data: "custom-data" },
        });
    });
    test("should handle join room messages", () => {
        const client = createMockClient("client1");
        wsService.addClient(client);
        // Setup join handler
        const joinHandler = jest.fn();
        wsService.on("room:joined", joinHandler);
        // Handle join room message
        const message = {
            type: "join:room",
            payload: { roomId: "room1" },
        };
        wsService.handleMessage("client1", message);
        expect(joinHandler).toHaveBeenCalledTimes(1);
        expect(joinHandler).toHaveBeenCalledWith({
            clientId: "client1",
            roomId: "room1",
        });
    });
    test("should handle game action messages", () => {
        const client = createMockClient("client1");
        wsService.addClient(client);
        // Handle game action message
        const message = {
            type: "game:action",
            payload: {
                action: "FOLD",
                data: { tableId: "table1" },
            },
        };
        wsService.handleMessage("client1", message);
        // Verify that emit was called on gameEventBus
        expect(GameEventBus_1.gameEventBus.emit).toHaveBeenCalledWith("FOLD", {
            playerId: "client1",
            tableId: "table1",
        });
    });
    test("should process data through the sendToRoom method", () => {
        const client1 = createMockClient("client1");
        const client2 = createMockClient("client2");
        wsService.addClient(client1);
        wsService.addClient(client2);
        wsService.joinRoom("client1", "game123");
        wsService.joinRoom("client2", "game123");
        // Create game data
        const gameData = {
            gameId: "game123",
            timestamp: Date.now(),
            players: [],
            dealerPosition: 0,
        };
        // Manually call the method that would be called by the event handler
        wsService.sendToRoom("game123", {
            type: GameEvents_1.GameEventType.GAME_STARTED,
            payload: gameData,
        });
        // Both clients should receive the event
        expect(client1.send).toHaveBeenCalledTimes(1);
        expect(client2.send).toHaveBeenCalledTimes(1);
        // Verify message format
        const message = client1.send.mock.calls[0][0];
        expect(message.type).toBe(GameEvents_1.GameEventType.GAME_STARTED);
        expect(message.payload.gameId).toBe("game123");
    });
    test("should sanitize sensitive data when sending to clients", () => {
        // Test the private sanitizeEventData method directly by accessing it as any
        const sanitizeData = wsService.sanitizeEventData.bind(wsService);
        // Create hand dealt data
        const handDealtData = {
            gameId: "game123",
            playerId: "player1",
            holeCards: [
                { suit: "HEARTS", rank: "A" },
                { suit: "SPADES", rank: "A" },
            ],
            timestamp: Date.now(),
        };
        // Call the sanitize method with the data
        const sanitizedData = sanitizeData(GameEvents_1.GameEventType.HAND_DEALT, handDealtData);
        // Verify the sanitized data
        expect(sanitizedData.gameId).toBe("game123");
        expect(sanitizedData.playerId).toBe("player1");
        expect(sanitizedData.timestamp).toBe(handDealtData.timestamp);
        // The most important check - holeCards should be removed
        expect(sanitizedData.holeCards).toBeUndefined();
    });
});
//# sourceMappingURL=WebSocketService.test.js.map