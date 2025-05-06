"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerManager_1 = require("../../engine/PlayerManager");
const Player_1 = require("../../models/Player");
const Table_1 = require("../../models/Table");
const types_1 = require("../../types");
describe("PlayerManager", () => {
    let playerManager;
    let mockTable;
    beforeEach(() => {
        playerManager = new PlayerManager_1.PlayerManager();
        // Create a mock table
        mockTable = new Table_1.Table({
            id: "table-1",
            name: "Test Table",
            maxPlayers: 9,
            smallBlind: 5,
            bigBlind: 10,
            minBuyIn: 100,
            maxBuyIn: 1000,
            gameVariant: types_1.GameVariant.TEXAS_HOLDEM,
            bettingStructure: types_1.BettingStructure.NO_LIMIT,
        });
        // Register the table
        playerManager.registerTable(mockTable);
    });
    describe("registerPlayer", () => {
        it("should create and register a new player", () => {
            const options = {
                name: "Test Player",
                initialStack: 200,
            };
            const player = playerManager.registerPlayer(options);
            expect(player).toBeInstanceOf(Player_1.Player);
            expect(player.name).toBe(options.name);
            expect(player.stack).toBe(options.initialStack);
            // Player should be retrievable
            const retrievedPlayer = playerManager.getPlayer(player.id);
            expect(retrievedPlayer).toBe(player);
            // Player should have stats initialized
            const stats = playerManager.getPlayerStats(player.id);
            expect(stats).toBeDefined();
            expect(stats?.handsPlayed).toBe(0);
            expect(stats?.handsWon).toBe(0);
            // Player should have a session
            const session = playerManager.getPlayerSession(player.id);
            expect(session).toBeDefined();
            expect(session?.currentTableId).toBeNull();
            expect(session?.isActive).toBe(false);
        });
    });
    describe("table management", () => {
        it("should register and unregister tables", () => {
            const newTable = new Table_1.Table({
                id: "table-2",
                name: "Another Table",
                maxPlayers: 6,
                smallBlind: 10,
                bigBlind: 20,
                minBuyIn: 200,
                maxBuyIn: 2000,
                gameVariant: types_1.GameVariant.TEXAS_HOLDEM,
                bettingStructure: types_1.BettingStructure.NO_LIMIT,
            });
            playerManager.registerTable(newTable);
            // Register a player and seat them at the table
            const player = playerManager.registerPlayer({
                name: "Table Test Player",
                initialStack: 500,
            });
            const seated = playerManager.seatPlayerAtTable(player.id, newTable.id, 3);
            expect(seated).toBe(true);
            // Verify player is at the table
            const session = playerManager.getPlayerSession(player.id);
            expect(session?.currentTableId).toBe(newTable.id);
            expect(session?.seatIndex).toBe(3);
            // Unregister the table
            playerManager.unregisterTable(newTable.id);
            // Player should still exist but not be at any table
            const playerAfterUnregister = playerManager.getPlayer(player.id);
            expect(playerAfterUnregister).toBeDefined();
        });
        it("should seat and remove players from tables", () => {
            const player = playerManager.registerPlayer({
                name: "Seat Test Player",
                initialStack: 300,
            });
            // Seat player
            const seated = playerManager.seatPlayerAtTable(player.id, mockTable.id, 2);
            expect(seated).toBe(true);
            // Player should be seated
            expect(playerManager.isPlayerSeated(player.id)).toBe(true);
            // Table should have the player
            const tablePlayerAtIndex = mockTable.players[2];
            expect(tablePlayerAtIndex).toBe(player);
            // Remove player from table
            const removed = playerManager.removePlayerFromTable(player.id);
            expect(removed).toBe(true);
            // Player should not be seated
            expect(playerManager.isPlayerSeated(player.id)).toBe(false);
            // Table should not have the player
            const tablePlayerAfterRemoval = mockTable.players[2];
            expect(tablePlayerAfterRemoval).toBeNull();
        });
        it("should handle a player changing tables", () => {
            const newTable = new Table_1.Table({
                id: "table-3",
                name: "Table 3",
                maxPlayers: 6,
                smallBlind: 25,
                bigBlind: 50,
                minBuyIn: 500,
                maxBuyIn: 5000,
                gameVariant: types_1.GameVariant.TEXAS_HOLDEM,
                bettingStructure: types_1.BettingStructure.NO_LIMIT,
            });
            playerManager.registerTable(newTable);
            const player = playerManager.registerPlayer({
                name: "Table Hopper",
                initialStack: 1000,
            });
            // Seat at first table
            playerManager.seatPlayerAtTable(player.id, mockTable.id, 1);
            // Verify seated at first table
            expect(mockTable.players[1]).toBe(player);
            // Move to second table
            playerManager.seatPlayerAtTable(player.id, newTable.id, 0);
            // Should be removed from first table
            expect(mockTable.players[1]).toBeNull();
            // Should be seated at second table
            expect(newTable.players[0]).toBe(player);
            // Session should be updated
            const session = playerManager.getPlayerSession(player.id);
            expect(session?.currentTableId).toBe(newTable.id);
            expect(session?.seatIndex).toBe(0);
        });
    });
    describe("player statistics", () => {
        it("should track player statistics correctly", () => {
            const player = playerManager.registerPlayer({
                name: "Stats Player",
                initialStack: 500,
            });
            // Update stats for winning a hand
            playerManager.updatePlayerStats(player.id, true, 100, 200);
            let stats = playerManager.getPlayerStats(player.id);
            expect(stats?.handsPlayed).toBe(1);
            expect(stats?.handsWon).toBe(1);
            expect(stats?.totalWinnings).toBe(100);
            expect(stats?.biggestPot).toBe(200);
            // Update stats for losing a hand
            playerManager.updatePlayerStats(player.id, false, -50, 150);
            stats = playerManager.getPlayerStats(player.id);
            expect(stats?.handsPlayed).toBe(2);
            expect(stats?.handsWon).toBe(1);
            expect(stats?.totalWinnings).toBe(100);
            expect(stats?.totalLosses).toBe(50);
            expect(stats?.biggestPot).toBe(200); // Still the biggest pot
            // Win a bigger pot
            playerManager.updatePlayerStats(player.id, true, 300, 500);
            stats = playerManager.getPlayerStats(player.id);
            expect(stats?.handsPlayed).toBe(3);
            expect(stats?.handsWon).toBe(2);
            expect(stats?.totalWinnings).toBe(400);
            expect(stats?.biggestPot).toBe(500); // Updated biggest pot
        });
    });
    describe("player activity", () => {
        beforeEach(() => {
            // Use fake timers for this test suite
            jest.useFakeTimers();
        });
        afterEach(() => {
            // Clean up fake timers
            jest.useRealTimers();
        });
        it("should track player activity", () => {
            const player = playerManager.registerPlayer({
                name: "Active Player",
                initialStack: 400,
            });
            // Get initial last action time
            const initialSession = playerManager.getPlayerSession(player.id);
            const initialActionTime = new Date(initialSession.lastAction).getTime();
            // Advance fake timers by 1 second
            jest.advanceTimersByTime(1000);
            // Update player activity
            playerManager.updatePlayerActivity(player.id);
            // Check if last action time was updated
            const updatedSession = playerManager.getPlayerSession(player.id);
            const updatedActionTime = new Date(updatedSession.lastAction).getTime();
            expect(updatedActionTime).toBeGreaterThan(initialActionTime);
            // Stats should also be updated
            const stats = playerManager.getPlayerStats(player.id);
            const statsLastActive = new Date(stats.lastActive).getTime();
            expect(statsLastActive).toBeGreaterThanOrEqual(initialActionTime);
        });
    });
    describe("player buy-in and cash-out", () => {
        it("should handle buy-in operations", () => {
            const player = playerManager.registerPlayer({
                name: "Chip Player",
                initialStack: 100,
            });
            // Buy in more chips
            const buyInSuccess = playerManager.playerBuyIn(player.id, 200);
            expect(buyInSuccess).toBe(true);
            // Stack should be updated
            const updatedPlayer = playerManager.getPlayer(player.id);
            expect(updatedPlayer?.stack).toBe(300);
            // Try invalid buy-in (negative amount)
            const invalidBuyIn = playerManager.playerBuyIn(player.id, -50);
            expect(invalidBuyIn).toBe(false);
            // Stack should remain unchanged
            expect(playerManager.getPlayer(player.id)?.stack).toBe(300);
        });
        it("should handle cash-out operations", () => {
            const player = playerManager.registerPlayer({
                name: "Leaving Player",
                initialStack: 500,
            });
            // Seat player at table
            playerManager.seatPlayerAtTable(player.id, mockTable.id, 4);
            // Cash out
            const cashedOutAmount = playerManager.playerCashOut(player.id);
            expect(cashedOutAmount).toBe(500);
            // Player should have zero stack
            expect(playerManager.getPlayer(player.id)?.stack).toBe(0);
            // Player should be removed from table
            expect(playerManager.isPlayerSeated(player.id)).toBe(false);
            expect(mockTable.players[4]).toBeNull();
        });
    });
    describe("player and table queries", () => {
        it("should get all players", () => {
            playerManager.registerPlayer({ name: "Player 1", initialStack: 100 });
            playerManager.registerPlayer({ name: "Player 2", initialStack: 200 });
            playerManager.registerPlayer({ name: "Player 3", initialStack: 300 });
            const allPlayers = playerManager.getAllPlayers();
            expect(allPlayers.length).toBe(3);
        });
        it("should get players at a table", () => {
            const player1 = playerManager.registerPlayer({
                name: "Table Player 1",
                initialStack: 100,
            });
            const player2 = playerManager.registerPlayer({
                name: "Table Player 2",
                initialStack: 200,
            });
            const player3 = playerManager.registerPlayer({
                name: "Not Seated",
                initialStack: 300,
            });
            // Seat two players
            playerManager.seatPlayerAtTable(player1.id, mockTable.id, 0);
            playerManager.seatPlayerAtTable(player2.id, mockTable.id, 1);
            const tablePlayers = playerManager.getPlayersAtTable(mockTable.id);
            expect(tablePlayers.length).toBe(2);
            expect(tablePlayers).toContain(player1);
            expect(tablePlayers).toContain(player2);
            expect(tablePlayers).not.toContain(player3);
        });
    });
});
//# sourceMappingURL=PlayerManager.test.js.map