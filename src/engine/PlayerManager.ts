import { Player } from "../models/Player";
import { Table } from "../models/Table";
import { PlayerStatus } from "../types";

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
export class PlayerManager {
  private players: Map<string, Player>;
  private playerStats: Map<string, PlayerStats>;
  private playerSessions: Map<string, PlayerSession>;
  private tables: Map<string, Table>;

  constructor() {
    this.players = new Map<string, Player>();
    this.playerStats = new Map<string, PlayerStats>();
    this.playerSessions = new Map<string, PlayerSession>();
    this.tables = new Map<string, Table>();
  }

  /**
   * Register a table with the player manager
   * @param table The table to register
   */
  public registerTable(table: Table): void {
    this.tables.set(table.id, table);
  }

  /**
   * Unregister a table from the player manager
   * @param tableId The ID of the table to unregister
   */
  public unregisterTable(tableId: string): void {
    this.tables.delete(tableId);
  }

  /**
   * Register a new player
   * @param options Player registration options
   * @returns The created player
   */
  public registerPlayer(options: PlayerRegistrationOptions): Player {
    const playerId = `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create a new player
    const player = new Player(
      playerId,
      options.name,
      options.initialStack,
      -1 // No seat assigned yet
    );

    // Initialize player statistics
    const stats: PlayerStats = {
      handsPlayed: 0,
      handsWon: 0,
      totalWinnings: 0,
      totalLosses: 0,
      biggestPot: 0,
      lastActive: new Date(),
    };

    // Initialize player session
    const session: PlayerSession = {
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
  public getPlayer(playerId: string): Player | null {
    return this.players.get(playerId) || null;
  }

  /**
   * Get all registered players
   * @returns Array of all players
   */
  public getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  /**
   * Get player statistics
   * @param playerId The ID of the player
   * @returns Player statistics, or null if player not found
   */
  public getPlayerStats(playerId: string): PlayerStats | null {
    return this.playerStats.get(playerId) || null;
  }

  /**
   * Get player session information
   * @param playerId The ID of the player
   * @returns Player session, or null if player not found
   */
  public getPlayerSession(playerId: string): PlayerSession | null {
    return this.playerSessions.get(playerId) || null;
  }

  /**
   * Seat a player at a table
   * @param playerId The ID of the player to seat
   * @param tableId The ID of the table
   * @param seatIndex The seat index to sit at
   * @returns True if successful, false otherwise
   */
  public seatPlayerAtTable(
    playerId: string,
    tableId: string,
    seatIndex: number
  ): boolean {
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
        if (
          session.currentTableId &&
          session.currentTableId !== tableId &&
          session.seatIndex !== null
        ) {
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
        player.status = PlayerStatus.SITTING_OUT;
      }
    }

    return success;
  }

  /**
   * Remove a player from their current table
   * @param playerId The ID of the player to remove
   * @returns True if successful, false otherwise
   */
  public removePlayerFromTable(playerId: string): boolean {
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
  public updatePlayerStats(
    playerId: string,
    won: boolean,
    amount: number,
    potSize: number
  ): void {
    const stats = this.playerStats.get(playerId);

    if (!stats) {
      return;
    }

    stats.handsPlayed++;

    if (won) {
      stats.handsWon++;
      stats.totalWinnings += amount;
    } else if (amount < 0) {
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
  public isPlayerSeated(playerId: string): boolean {
    const session = this.playerSessions.get(playerId);
    return !!(session && session.currentTableId && session.seatIndex !== null);
  }

  /**
   * Get all players at a table
   * @param tableId The ID of the table
   * @returns Array of players at the table, or empty array if table not found
   */
  public getPlayersAtTable(tableId: string): Player[] {
    const table = this.tables.get(tableId);

    if (!table) {
      return [];
    }

    return table.players.filter((p): p is Player => p !== null);
  }

  /**
   * Update player session status
   * @param playerId The ID of the player
   */
  public updatePlayerActivity(playerId: string): void {
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
  public playerBuyIn(playerId: string, amount: number): boolean {
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
  public playerCashOut(playerId: string): number {
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
