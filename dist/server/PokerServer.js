"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerServer = void 0;
const net = __importStar(require("net"));
const uuid_1 = require("uuid");
const GameEngine_1 = require("../engine/GameEngine");
const Player_1 = require("../models/Player");
const types_1 = require("../types");
const Action_1 = require("../models/Action");
/**
 * Simple poker server for command line testing
 */
class PokerServer {
    /**
     * Creates a new poker server
     * @param port The port to listen on
     */
    constructor(port = 3000) {
        this.clients = new Map();
        this.gameStarted = false;
        this.port = port;
        this.server = net.createServer(this.handleConnection.bind(this));
        this.gameEngine = new GameEngine_1.GameEngine(GameEngine_1.DEFAULT_GAME_CONFIG);
        // Set up game engine event listeners
        this.setupGameEventListeners();
    }
    /**
     * Sets up game engine event listeners
     */
    setupGameEventListeners() {
        // Listen for game started event
        this.gameEngine.on("gameStarted", (data) => {
            this.broadcastMessage("GAME_STARTED", {
                dealerPosition: data.dealerPosition,
                blinds: data.blinds,
            });
            this.sendGameState();
        });
        // Listen for player turn event
        this.gameEngine.on("playerTurn", (data) => {
            this.broadcastMessage("PLAYER_TURN", {
                playerId: data.playerId,
                timeoutInSeconds: data.timeoutInSeconds,
            });
        });
        // Listen for state change event
        this.gameEngine.on("stateChanged", (data) => {
            this.broadcastMessage("STATE_CHANGED", {
                oldState: data.oldState,
                newState: data.newState,
                cards: data.cards
                    ? data.cards.map((card) => `${card.rank}${card.suit}`)
                    : [],
            });
            this.sendGameState();
        });
        // Listen for player action event
        this.gameEngine.on("playerAction", (data) => {
            this.broadcastMessage("PLAYER_ACTION", {
                playerId: data.player.id,
                name: data.player.name,
                action: data.action.type,
                amount: data.action.amount,
            });
            this.sendGameState();
        });
        // Listen for hand complete event
        this.gameEngine.on("handComplete", (data) => {
            this.broadcastMessage("HAND_COMPLETE", {
                winners: data.winners.map((winner) => ({
                    playerId: winner.player.id,
                    name: winner.player.name,
                    handRank: winner.handRank,
                    potAmount: winner.potAmount,
                })),
            });
            this.sendGameState();
        });
    }
    /**
     * Starts the server
     */
    start() {
        this.server.listen(this.port, () => {
            console.log(`Poker server started on port ${this.port}`);
        });
    }
    /**
     * Stops the server
     */
    stop() {
        this.server.close();
        console.log("Poker server stopped");
    }
    /**
     * Handles a new client connection
     * @param socket The client socket
     */
    handleConnection(socket) {
        const clientId = (0, uuid_1.v4)();
        const client = {
            id: clientId,
            socket,
            playerId: null,
            username: null,
        };
        this.clients.set(clientId, client);
        console.log(`Client connected: ${clientId}`);
        // Send welcome message
        this.sendMessage(client, "WELCOME", {
            message: "Welcome to the Poker Server!",
            clientId,
        });
        // Set up event handlers for the socket
        socket.on("data", (data) => this.handleClientData(client, data));
        socket.on("end", () => this.handleClientDisconnect(client));
        socket.on("error", (err) => console.error(`Client ${clientId} error:`, err));
    }
    /**
     * Handles client data
     * @param client The client connection
     * @param data The data received
     */
    handleClientData(client, data) {
        try {
            const message = JSON.parse(data.toString().trim());
            if (!message.type || typeof message.type !== "string") {
                this.sendError(client, "Invalid message format");
                return;
            }
            switch (message.type) {
                case "LOGIN":
                    this.handleLoginMessage(client, message.data);
                    break;
                case "START_GAME":
                    this.handleStartGame(client);
                    break;
                case "PLAYER_ACTION":
                    this.handlePlayerAction(client, message.data);
                    break;
                default:
                    this.sendError(client, `Unknown message type: ${message.type}`);
            }
        }
        catch (error) {
            console.error("Error parsing client message:", error);
            this.sendError(client, "Invalid message format");
        }
    }
    /**
     * Handles client disconnection
     * @param client The client connection
     */
    handleClientDisconnect(client) {
        // Remove the player from the game if they were playing
        if (client.playerId) {
            this.gameEngine.removePlayer(client.playerId);
        }
        // Remove the client from our map
        this.clients.delete(client.id);
        console.log(`Client disconnected: ${client.id}`);
        // Broadcast updated game state
        this.sendGameState();
    }
    /**
     * Handles login message
     * @param client The client connection
     * @param data The login data
     */
    handleLoginMessage(client, data) {
        if (!data || !data.username) {
            this.sendError(client, "Username is required");
            return;
        }
        const username = data.username;
        // Find an empty seat for the player
        const table = this.gameEngine.getTable();
        console.log("DEBUG: Table players", table.players);
        const emptySeatIndex = table.players.findIndex((p) => p === null);
        if (emptySeatIndex === -1) {
            this.sendError(client, "No empty seats available");
            return;
        }
        // Create new player with the seat index
        const player = new Player_1.Player((0, uuid_1.v4)(), username, 1000, emptySeatIndex);
        // Add player to game engine
        const added = this.gameEngine.addPlayer(player);
        if (added) {
            // Set client properties
            client.playerId = player.id;
            client.username = username;
            // Send success response
            this.sendMessage(client, "LOGIN_SUCCESS", {
                playerId: player.id,
                seat: this.gameEngine
                    .getTable()
                    .players.findIndex((p) => p && p.id === player.id),
                stack: player.stack,
            });
            // Broadcast game state to all clients
            this.sendGameState();
            console.log(`Player ${username} (${player.id}) joined the game`);
            // Automatically start the game if enough players have joined and not already started
            const activePlayers = this.gameEngine.getTable().activePlayers;
            const minPlayers = this.gameEngine.getConfig().minPlayers;
            if (!this.gameStarted && activePlayers.length >= minPlayers) {
                const started = this.gameEngine.startGame();
                if (started) {
                    this.gameStarted = true;
                    console.log("Game started automatically (enough players joined)");
                }
            }
        }
        else {
            this.sendError(client, "Failed to join the game. Table might be full.");
        }
    }
    /**
     * Handles start game message
     * @param client The client connection
     */
    handleStartGame(client) {
        if (this.gameStarted) {
            this.sendError(client, "Game is already in progress");
            return;
        }
        const activePlayers = this.gameEngine.getTable().activePlayers;
        if (activePlayers.length < 2) {
            this.sendError(client, "Need at least 2 players to start the game");
            return;
        }
        const started = this.gameEngine.startGame();
        if (started) {
            this.gameStarted = true;
            console.log("Game started");
        }
        else {
            this.sendError(client, "Failed to start the game");
        }
    }
    /**
     * Handles player action message
     * @param client The client connection
     * @param data The action data
     */
    handlePlayerAction(client, data) {
        if (!client.playerId) {
            this.sendError(client, "You are not logged in");
            return;
        }
        if (!data || !data.type) {
            this.sendError(client, "Invalid action format");
            return;
        }
        // Get the player
        const player = this.gameEngine
            .getTable()
            .players.find((p) => p !== null && p.id === client.playerId);
        if (!player) {
            this.sendError(client, "Player not found");
            return;
        }
        // Check if it's the player's turn
        if (!this.gameEngine.isPlayersTurn(client.playerId)) {
            this.sendError(client, "Not your turn");
            return;
        }
        // Create the action
        let action;
        switch (data.type) {
            case "FOLD":
                action = new Action_1.Action(player, types_1.ActionType.FOLD);
                break;
            case "CHECK":
                action = new Action_1.Action(player, types_1.ActionType.CHECK);
                break;
            case "CALL":
                action = new Action_1.Action(player, types_1.ActionType.CALL);
                break;
            case "BET":
            case "RAISE":
                if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
                    this.sendError(client, "Invalid bet/raise amount");
                    return;
                }
                action = new Action_1.Action(player, data.type === "BET" ? types_1.ActionType.BET : types_1.ActionType.RAISE, Number(data.amount));
                break;
            case "ALL_IN":
                action = new Action_1.Action(player, types_1.ActionType.ALL_IN);
                break;
            default:
                this.sendError(client, `Unknown action type: ${data.type}`);
                return;
        }
        // Handle the action
        const result = this.gameEngine.handleAction(client.playerId, action);
        if (!result.success) {
            this.sendError(client, result.message || "Action failed");
        }
        // Check if the hand is over
        if (result.nextState === types_1.GameState.FINISHED) {
            setTimeout(() => {
                this.gameStarted = false;
                this.sendGameState();
            }, 2000);
        }
    }
    /**
     * Sends an error message to a client
     * @param client The client connection
     * @param message The error message
     */
    sendError(client, message) {
        this.sendMessage(client, "ERROR", { message });
    }
    /**
     * Sends a message to a client
     * @param client The client connection
     * @param type The message type
     * @param data The message data
     */
    sendMessage(client, type, data) {
        try {
            const message = JSON.stringify({ type, data });
            client.socket.write(message + "\n");
        }
        catch (error) {
            console.error("Error sending message to client:", error);
        }
    }
    /**
     * Broadcasts a message to all connected clients
     * @param type The message type
     * @param data The message data
     */
    broadcastMessage(type, data) {
        this.clients.forEach((client) => {
            this.sendMessage(client, type, data);
        });
    }
    /**
     * Sends game state to all clients
     */
    sendGameState() {
        const table = this.gameEngine.getTable();
        const gameState = this.gameEngine.getGameState();
        const dealerPosition = this.gameEngine.getDealerPosition();
        const currentPlayerIndex = this.gameEngine.getCurrentPlayerIndex();
        const state = {
            gameState,
            dealerPosition,
            currentPlayerIndex,
            pot: table.totalPot,
            currentBet: table.currentBet,
            canStartGame: !this.gameStarted && table.activePlayers.length >= 2,
            communityCards: table.communityCards.map((card) => `${card.rank}${card.suit}`),
            players: table.players.map((player) => {
                if (!player)
                    return null;
                return {
                    id: player.id,
                    name: player.name,
                    stack: player.stack,
                    currentBet: player.currentBet,
                    status: player.status,
                    // Only send hole cards to the player they belong to
                    cards: [],
                };
            }),
        };
        // Broadcast general game state to all players
        this.broadcastMessage("GAME_STATE", state);
        // Send private hand information to each player
        this.clients.forEach((client) => {
            if (client.playerId) {
                const player = table.players.find((p) => p && p.id === client.playerId);
                if (player) {
                    this.sendMessage(client, "PLAYER_CARDS", {
                        cards: player.hand.cards.map((card) => `${card.rank}${card.suit}`),
                    });
                }
            }
        });
    }
}
exports.PokerServer = PokerServer;
//# sourceMappingURL=PokerServer.js.map