"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const Player_1 = require("../models/Player");
const types_1 = require("../types");
/**
 * PlayerManager - Centralizes player management across the system
 *
 * The PlayerManager is responsible for:
 * - Registering and tracking players
 * - Managing player sessions and states
 * - Moving players between tables
 * - Tracking player statistics
 */
class PlayerManager {
    constructor() {
        this.players = new Map();
        this.playerStats = new Map();
        this.playerSessions = new Map();
        this.tables = new Map();
    }
    /**
     * Register a table with the player manager
     * @param table The table to register
     */
    registerTable(table) {
        this.tables.set(table.id, table);
    }
    /**
     * Unregister a table from the player manager
     * @param tableId The ID of the table to unregister
     */
    unregisterTable(tableId) {
        this.tables.delete(tableId);
    }
    /**
     * Register a new player
     * @param options Player registration options
     * @returns The created player
     */
    registerPlayer(options) {
        const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        // Create a new player
        const player = new Player_1.Player(playerId, options.name, options.initialStack, -1 // No seat assigned yet
        );
        // Initialize player statistics
        const stats = {
            handsPlayed: 0,
            handsWon: 0,
            totalWinnings: 0,
            totalLosses: 0,
            biggestPot: 0,
            lastActive: new Date(),
        };
        // Initialize player session
        const session = {
            playerId,
            currentTableId: null,
            seatIndex: null,
            isActive: false,
            joinedAt: new Date(),
            lastAction: new Date(),
        };
        // Store player data
        this.players.set(playerId, player);
        this.playerStats.set(playerId, stats);
        this.playerSessions.set(playerId, session);
        return player;
    }
    /**
     * Get a player by ID
     * @param playerId The ID of the player to get
     * @returns The player, or null if not found
     */
    getPlayer(playerId) {
        return this.players.get(playerId) || null;
    }
    /**
     * Get all registered players
     * @returns Array of all players
     */
    getAllPlayers() {
        return Array.from(this.players.values());
    }
    /**
     * Get player statistics
     * @param playerId The ID of the player
     * @returns Player statistics, or null if player not found
     */
    getPlayerStats(playerId) {
        return this.playerStats.get(playerId) || null;
    }
    /**
     * Get player session information
     * @param playerId The ID of the player
     * @returns Player session, or null if player not found
     */
    getPlayerSession(playerId) {
        return this.playerSessions.get(playerId) || null;
    }
    /**
     * Seat a player at a table
     * @param playerId The ID of the player to seat
     * @param tableId The ID of the table
     * @param seatIndex The seat index to sit at
     * @returns True if successful, false otherwise
     */
    seatPlayerAtTable(playerId, tableId, seatIndex) {
        const player = this.getPlayer(playerId);
        const table = this.tables.get(tableId);
        if (!player || !table) {
            return false;
        }
        // Try to seat the player
        const success = table.seatPlayer(player, seatIndex);
        if (success) {
            // Update player session
            const session = this.playerSessions.get(playerId);
            if (session) {
                // If player was at another table, remove them
                if (session.currentTableId &&
                    session.currentTableId !== tableId &&
                    session.seatIndex !== null) {
                    const previousTable = this.tables.get(session.currentTableId);
                    if (previousTable) {
                        previousTable.removePlayer(playerId);
                    }
                }
                // Update session with new table information
                session.currentTableId = tableId;
                session.seatIndex = seatIndex;
                session.isActive = true;
                session.lastAction = new Date();
                // Update player status
                player.status = types_1.PlayerStatus.SITTING_OUT;
            }
        }
        return success;
    }
    /**
     * Remove a player from their current table
     * @param playerId The ID of the player to remove
     * @returns True if successful, false otherwise
     */
    removePlayerFromTable(playerId) {
        const session = this.playerSessions.get(playerId);
        if (!session || !session.currentTableId || session.seatIndex === null) {
            return false;
        }
        const table = this.tables.get(session.currentTableId);
        if (!table) {
            return false;
        }
        const success = table.removePlayer(playerId);
        if (success) {
            // Update session
            session.currentTableId = null;
            session.seatIndex = null;
            session.isActive = false;
            session.lastAction = new Date();
        }
        return success;
    }
    /**
     * Update player statistics after a hand
     * @param playerId The ID of the player
     * @param won Whether the player won the hand
     * @param amount The amount won (positive) or lost (negative)
     * @param potSize The total size of the pot
     */
    updatePlayerStats(playerId, won, amount, potSize) {
        const stats = this.playerStats.get(playerId);
        if (!stats) {
            return;
        }
        stats.handsPlayed++;
        if (won) {
            stats.handsWon++;
            stats.totalWinnings += amount;
        }
        else if (amount < 0) {
            stats.totalLosses += Math.abs(amount);
        }
        if (potSize > stats.biggestPot) {
            stats.biggestPot = potSize;
        }
        stats.lastActive = new Date();
    }
    /**
     * Check if a player is currently seated at a table
     * @param playerId The ID of the player
     * @returns True if seated, false otherwise
     */
    isPlayerSeated(playerId) {
        const session = this.playerSessions.get(playerId);
        return !!(session && session.currentTableId && session.seatIndex !== null);
    }
    /**
     * Get all players at a table
     * @param tableId The ID of the table
     * @returns Array of players at the table, or empty array if table not found
     */
    getPlayersAtTable(tableId) {
        const table = this.tables.get(tableId);
        if (!table) {
            return [];
        }
        return table.players.filter((p) => p !== null);
    }
    /**
     * Update player session status
     * @param playerId The ID of the player
     */
    updatePlayerActivity(playerId) {
        const session = this.playerSessions.get(playerId);
        const stats = this.playerStats.get(playerId);
        if (session) {
            session.lastAction = new Date();
        }
        if (stats) {
            stats.lastActive = new Date();
        }
    }
    /**
     * Allocate a buy-in amount to a player's stack
     * @param playerId The ID of the player
     * @param amount The amount to buy in
     * @returns True if successful, false otherwise
     */
    playerBuyIn(playerId, amount) {
        if (amount <= 0) {
            return false;
        }
        const player = this.getPlayer(playerId);
        if (!player) {
            return false;
        }
        player.stack += amount;
        return true;
    }
    /**
     * Handle a player cashing out from a table
     * @param playerId The ID of the player
     * @returns The amount cashed out, or -1 if failed
     */
    playerCashOut(playerId) {
        const player = this.getPlayer(playerId);
        if (!player) {
            return -1;
        }
        const currentStack = player.stack;
        // Remove player from table if seated
        this.removePlayerFromTable(playerId);
        // Reset player stack
        player.stack = 0;
        return currentStack;
    }
}
exports.PlayerManager = PlayerManager;
//# sourceMappingURL=PlayerManager.js.map