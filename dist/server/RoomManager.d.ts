import { WebSocketService } from "./WebSocketService";
export interface GameRoomConfig {
    name: string;
    maxPlayers: number;
    blinds: {
        small: number;
        big: number;
    };
    buyIn: {
        min: number;
        max: number;
    };
}
export interface GameRoom {
    id: string;
    config: GameRoomConfig;
    players: Map<string, {
        id: string;
        name: string;
        stack: number;
    }>;
    isActive: boolean;
    createdAt: number;
}
/**
 * RoomManager handles game rooms/tables and their participants
 */
export declare class RoomManager {
    private wsService;
    private rooms;
    constructor(wsService: WebSocketService);
    /**
     * Create a new game room
     * @param config Configuration for the new room
     * @returns The created room
     */
    createRoom(config: GameRoomConfig): GameRoom;
    /**
     * Get a room by ID
     * @param roomId ID of the room to get
     * @returns The room or undefined if not found
     */
    getRoom(roomId: string): GameRoom | undefined;
    /**
     * Get all active rooms
     * @returns Array of all active rooms
     */
    getActiveRooms(): GameRoom[];
    /**
     * Get all room IDs
     * @returns Array of all room IDs
     */
    getAllRoomIds(): string[];
    /**
     * Add a player to a room
     * @param roomId ID of the room
     * @param playerId ID of the player
     * @param playerName Player's display name
     * @param buyIn Initial buy-in amount
     * @returns True if the player was added successfully
     */
    addPlayerToRoom(roomId: string, playerId: string, playerName: string, buyIn: number): boolean;
    /**
     * Remove a player from a room
     * @param roomId ID of the room
     * @param playerId ID of the player
     * @returns True if the player was removed successfully
     */
    removePlayerFromRoom(roomId: string, playerId: string): boolean;
    /**
     * Start a game in a room
     * @param roomId ID of the room
     * @returns True if the game was started successfully
     */
    startGame(roomId: string): boolean;
    /**
     * End a game in a room
     * @param roomId ID of the room
     * @returns True if the game was ended successfully
     */
    endGame(roomId: string): boolean;
    /**
     * Set up event listeners for room-related events
     */
    private setupEventListeners;
}
