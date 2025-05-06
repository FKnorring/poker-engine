import { Player } from "../models/Player";
import { Table } from "../models/Table";
/**
 * Player registration options
 */
export interface PlayerRegistrationOptions {
    name: string;
    initialStack: number;
}
/**
 * Player statistics
 */
export interface PlayerStats {
    handsPlayed: number;
    handsWon: number;
    totalWinnings: number;
    totalLosses: number;
    biggestPot: number;
    lastActive: Date;
}
/**
 * Player session information
 */
export interface PlayerSession {
    playerId: string;
    currentTableId: string | null;
    seatIndex: number | null;
    isActive: boolean;
    joinedAt: Date;
    lastAction: Date;
}
/**
 * PlayerManager - Centralizes player management across the system
 *
 * The PlayerManager is responsible for:
 * - Registering and tracking players
 * - Managing player sessions and states
 * - Moving players between tables
 * - Tracking player statistics
 */
export declare class PlayerManager {
    private players;
    private playerStats;
    private playerSessions;
    private tables;
    constructor();
    /**
     * Register a table with the player manager
     * @param table The table to register
     */
    registerTable(table: Table): void;
    /**
     * Unregister a table from the player manager
     * @param tableId The ID of the table to unregister
     */
    unregisterTable(tableId: string): void;
    /**
     * Register a new player
     * @param options Player registration options
     * @returns The created player
     */
    registerPlayer(options: PlayerRegistrationOptions): Player;
    /**
     * Get a player by ID
     * @param playerId The ID of the player to get
     * @returns The player, or null if not found
     */
    getPlayer(playerId: string): Player | null;
    /**
     * Get all registered players
     * @returns Array of all players
     */
    getAllPlayers(): Player[];
    /**
     * Get player statistics
     * @param playerId The ID of the player
     * @returns Player statistics, or null if player not found
     */
    getPlayerStats(playerId: string): PlayerStats | null;
    /**
     * Get player session information
     * @param playerId The ID of the player
     * @returns Player session, or null if player not found
     */
    getPlayerSession(playerId: string): PlayerSession | null;
    /**
     * Seat a player at a table
     * @param playerId The ID of the player to seat
     * @param tableId The ID of the table
     * @param seatIndex The seat index to sit at
     * @returns True if successful, false otherwise
     */
    seatPlayerAtTable(playerId: string, tableId: string, seatIndex: number): boolean;
    /**
     * Remove a player from their current table
     * @param playerId The ID of the player to remove
     * @returns True if successful, false otherwise
     */
    removePlayerFromTable(playerId: string): boolean;
    /**
     * Update player statistics after a hand
     * @param playerId The ID of the player
     * @param won Whether the player won the hand
     * @param amount The amount won (positive) or lost (negative)
     * @param potSize The total size of the pot
     */
    updatePlayerStats(playerId: string, won: boolean, amount: number, potSize: number): void;
    /**
     * Check if a player is currently seated at a table
     * @param playerId The ID of the player
     * @returns True if seated, false otherwise
     */
    isPlayerSeated(playerId: string): boolean;
    /**
     * Get all players at a table
     * @param tableId The ID of the table
     * @returns Array of players at the table, or empty array if table not found
     */
    getPlayersAtTable(tableId: string): Player[];
    /**
     * Update player session status
     * @param playerId The ID of the player
     */
    updatePlayerActivity(playerId: string): void;
    /**
     * Allocate a buy-in amount to a player's stack
     * @param playerId The ID of the player
     * @param amount The amount to buy in
     * @returns True if successful, false otherwise
     */
    playerBuyIn(playerId: string, amount: number): boolean;
    /**
     * Handle a player cashing out from a table
     * @param playerId The ID of the player
     * @returns The amount cashed out, or -1 if failed
     */
    playerCashOut(playerId: string): number;
}
