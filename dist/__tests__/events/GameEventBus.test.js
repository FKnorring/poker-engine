"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEventBus_1 = require("../../events/GameEventBus");
const GameEvents_1 = require("../../events/GameEvents");
describe("GameEventBus", () => {
    beforeEach(() => {
        // Clear all event listeners before each test
        GameEventBus_1.gameEventBus.removeAllListeners();
    });
    test("should be a singleton", () => {
        const instance1 = GameEventBus_1.GameEventBus.getInstance();
        const instance2 = GameEventBus_1.GameEventBus.getInstance();
        expect(instance1).toBe(instance2);
        expect(instance1).toBe(GameEventBus_1.gameEventBus);
    });
    test("should subscribe to and emit game events", () => {
        const handler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.GAME_CREATED, handler);
        const eventData = {
            gameId: "test-game",
            timestamp: Date.now(),
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
        };
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_CREATED, eventData);
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(eventData);
    });
    test("should subscribe to game events once", () => {
        const handler = jest.fn();
        GameEventBus_1.gameEventBus.onceGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, handler);
        const eventData = {
            playerId: "player1",
            player: { id: "player1", name: "Player 1" },
            seatIndex: 0,
            timestamp: Date.now(),
        };
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, eventData);
        expect(handler).toHaveBeenCalledTimes(1);
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, eventData);
        expect(handler).toHaveBeenCalledTimes(1); // Still only called once
    });
    test("should add timestamp if not provided", () => {
        const handler = jest.fn();
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.PLAYER_ACTION, handler);
        const now = Date.now();
        jest.spyOn(Date, "now").mockImplementation(() => now);
        const eventData = {
            playerId: "player1",
            action: { type: "FOLD" },
        }; // Type cast for test simplicity
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_ACTION, eventData);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({
            timestamp: now,
        }));
    });
    test("should emit wildcard events for all game events", () => {
        const wildcardHandler = jest.fn();
        GameEventBus_1.gameEventBus.on("*", wildcardHandler);
        const eventData = {
            gameId: "test-game",
            timestamp: Date.now(),
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
        };
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_CREATED, eventData);
        expect(wildcardHandler).toHaveBeenCalledTimes(1);
        expect(wildcardHandler).toHaveBeenCalledWith({
            type: GameEvents_1.GameEventType.GAME_CREATED,
            data: eventData,
        });
    });
    test("should maintain expected type safety", () => {
        // This test is more about TypeScript compilation than runtime behavior
        // We're testing that the types work correctly
        const gameCreatedHandler = jest.fn();
        const playerJoinedHandler = jest.fn();
        // These should compile without errors if types are correct
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.GAME_CREATED, (data) => {
            // TypeScript should know that data has gameId, maxPlayers, etc.
            const { gameId, maxPlayers, blinds } = data;
            gameCreatedHandler(gameId, maxPlayers, blinds);
        });
        GameEventBus_1.gameEventBus.onGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, (data) => {
            // TypeScript should know that data has playerId, seatIndex, etc.
            const { playerId, seatIndex, player } = data;
            playerJoinedHandler(playerId, seatIndex, player);
        });
        // Emit events to trigger the handlers
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_CREATED, {
            gameId: "game1",
            timestamp: Date.now(),
            maxPlayers: 9,
            blinds: { small: 5, big: 10 },
        });
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, {
            playerId: "player1",
            player: { id: "player1", name: "Player 1" },
            seatIndex: 0,
            timestamp: Date.now(),
        });
        expect(gameCreatedHandler).toHaveBeenCalledTimes(1);
        expect(playerJoinedHandler).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=GameEventBus.test.js.map