/**
 * Simple poker server for command line testing
 */
export declare class PokerServer {
    private server;
    private gameEngine;
    private clients;
    private port;
    private gameStarted;
    /**
     * Creates a new poker server
     * @param port The port to listen on
     */
    constructor(port?: number);
    /**
     * Sets up game engine event listeners
     */
    private setupGameEventListeners;
    /**
     * Starts the server
     */
    start(): void;
    /**
     * Stops the server
     */
    stop(): void;
    /**
     * Handles a new client connection
     * @param socket The client socket
     */
    private handleConnection;
    /**
     * Handles client data
     * @param client The client connection
     * @param data The data received
     */
    private handleClientData;
    /**
     * Handles client disconnection
     * @param client The client connection
     */
    private handleClientDisconnect;
    /**
     * Handles login message
     * @param client The client connection
     * @param data The login data
     */
    private handleLoginMessage;
    /**
     * Handles start game message
     * @param client The client connection
     */
    private handleStartGame;
    /**
     * Handles player action message
     * @param client The client connection
     * @param data The action data
     */
    private handlePlayerAction;
    /**
     * Sends an error message to a client
     * @param client The client connection
     * @param message The error message
     */
    private sendError;
    /**
     * Sends a message to a client
     * @param client The client connection
     * @param type The message type
     * @param data The message data
     */
    private sendMessage;
    /**
     * Broadcasts a message to all connected clients
     * @param type The message type
     * @param data The message data
     */
    private broadcastMessage;
    /**
     * Sends game state to all clients
     */
    private sendGameState;
}
