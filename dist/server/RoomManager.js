"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const GameEvents_1 = require("../events/GameEvents");
const GameEventBus_1 = require("../events/GameEventBus");
const uuid_1 = require("uuid");
/**
 * RoomManager handles game rooms/tables and their participants
 */
class RoomManager {
    constructor(wsService) {
        this.wsService = wsService;
        this.rooms = new Map();
        this.setupEventListeners();
    }
    /**
     * Create a new game room
     * @param config Configuration for the new room
     * @returns The created room
     */
    createRoom(config) {
        const roomId = (0, uuid_1.v4)();
        const room = {
            id: roomId,
            config,
            players: new Map(),
            isActive: false,
            createdAt: Date.now(),
        };
        this.rooms.set(roomId, room);
        // Emit game created event
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_CREATED, {
            gameId: roomId,
            timestamp: Date.now(),
            maxPlayers: config.maxPlayers,
            blinds: config.blinds,
        });
        return room;
    }
    /**
     * Get a room by ID
     * @param roomId ID of the room to get
     * @returns The room or undefined if not found
     */
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    /**
     * Get all active rooms
     * @returns Array of all active rooms
     */
    getActiveRooms() {
        return Array.from(this.rooms.values()).filter((room) => room.isActive);
    }
    /**
     * Get all room IDs
     * @returns Array of all room IDs
     */
    getAllRoomIds() {
        return Array.from(this.rooms.keys());
    }
    /**
     * Add a player to a room
     * @param roomId ID of the room
     * @param playerId ID of the player
     * @param playerName Player's display name
     * @param buyIn Initial buy-in amount
     * @returns True if the player was added successfully
     */
    addPlayerToRoom(roomId, playerId, playerName, buyIn) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return false;
        }
        // Check if room is full
        if (room.players.size >= room.config.maxPlayers) {
            return false;
        }
        // Check if buy-in is valid
        if (buyIn < room.config.buyIn.min || buyIn > room.config.buyIn.max) {
            return false;
        }
        // Add player
        room.players.set(playerId, {
            id: playerId,
            name: playerName,
            stack: buyIn,
        });
        // Subscribe the player to the room
        this.wsService.joinRoom(playerId, roomId);
        // Emit player joined event
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_JOINED, {
            playerId,
            player: {
                id: playerId,
                name: playerName,
                stack: buyIn,
            }, // Type simplification for example
            seatIndex: room.players.size - 1,
            timestamp: Date.now(),
        });
        // Let the client know they need to sit in to play
        this.wsService.sendToClient(playerId, {
            type: "player:status",
            payload: {
                status: "sitting_out",
                message: "You are currently sitting out. Click 'Sit In' to play.",
            },
        });
        // Broadcast to other players in the room
        this.wsService.sendToRoom(roomId, {
            type: "player:joined",
            payload: {
                playerId: playerId,
                playerName: playerName,
                players: room.players.size,
                isSittingOut: true,
            },
        });
        return true;
    }
    /**
     * Remove a player from a room
     * @param roomId ID of the room
     * @param playerId ID of the player
     * @returns True if the player was removed successfully
     */
    removePlayerFromRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.players.has(playerId)) {
            return false;
        }
        // Get player's seat index
        const playersList = Array.from(room.players.keys());
        const seatIndex = playersList.indexOf(playerId);
        // Remove player
        room.players.delete(playerId);
        // Unsubscribe the player from the room
        this.wsService.leaveRoom(playerId, roomId);
        // Emit player left event
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.PLAYER_LEFT, {
            playerId,
            seatIndex,
            timestamp: Date.now(),
        });
        // If room is empty, remove it
        if (room.players.size === 0) {
            this.rooms.delete(roomId);
        }
        return true;
    }
    /**
     * Start a game in a room
     * @param roomId ID of the room
     * @returns True if the game was started successfully
     */
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            console.log(`DEBUG: RoomManager.startGame - Room ${roomId} not found`);
            return false;
        }
        // Check if there are enough players
        if (room.players.size < 2) {
            console.log(`DEBUG: RoomManager.startGame - Not enough players (${room.players.size}) in room ${roomId}`);
            return false;
        }
        // Activate the room
        room.isActive = true;
        // Log player information before emitting event
        console.log(`DEBUG: RoomManager.startGame - Starting game with ${room.players.size} players`);
        console.log(`DEBUG: RoomManager.startGame - Player data:`, Array.from(room.players.entries()));
        // Emit game started event
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_STARTED, {
            gameId: roomId,
            timestamp: Date.now(),
            players: Array.from(room.players.values()), // Type simplification for example
            dealerPosition: 0, // Initially set to first player
        });
        console.log(`DEBUG: RoomManager.startGame - GAME_STARTED event emitted for room ${roomId}`);
        return true;
    }
    /**
     * End a game in a room
     * @param roomId ID of the room
     * @returns True if the game was ended successfully
     */
    endGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.isActive) {
            return false;
        }
        // Deactivate the room
        room.isActive = false;
        // Calculate game duration
        const duration = Date.now() - room.createdAt;
        // Emit game ended event
        GameEventBus_1.gameEventBus.emitGameEvent(GameEvents_1.GameEventType.GAME_ENDED, {
            gameId: roomId,
            timestamp: Date.now(),
            players: Array.from(room.players.values()), // Type simplification for example
            duration,
        });
        return true;
    }
    /**
     * Set up event listeners for room-related events
     */
    setupEventListeners() {
        // Listen for client disconnections to remove them from rooms
        this.wsService.on("client:disconnected", ({ clientId }) => {
            // Find and remove player from all rooms
            this.rooms.forEach((room, roomId) => {
                if (room.players.has(clientId)) {
                    this.removePlayerFromRoom(roomId, clientId);
                }
            });
        });
    }
}
exports.RoomManager = RoomManager;
//# sourceMappingURL=RoomManager.js.map