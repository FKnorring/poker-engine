/**
 * Simple poker client for command line testing
 */
export declare class PokerClient {
    private host;
    private port;
    private socket;
    private rl;
    private connected;
    private loggedIn;
    private playerId;
    private username;
    private gameState;
    private playerCards;
    private buffer;
    private myTurn;
    /**
     * Creates a new poker client
     * @param host The server host
     * @param port The server port
     */
    constructor(host?: string, port?: number);
    /**
     * Sets up event handlers
     */
    private setupEventHandlers;
    /**
     * Handles messages from the server
     * @param data The message data
     */
    private handleServerMessage;
    /**
     * Handles welcome message
     * @param data The welcome data
     */
    private handleWelcomeMessage;
    /**
     * Handles login success message
     * @param data The login success data
     */
    private handleLoginSuccess;
    /**
     * Handles error message
     * @param data The error data
     */
    private handleErrorMessage;
    /**
     * Handles game state message
     * @param data The game state data
     */
    private handleGameState;
    /**
     * Handles player cards message
     * @param data The player cards data
     */
    private handlePlayerCards;
    /**
     * Handles player turn message
     * @param data The player turn data
     */
    private handlePlayerTurn;
    /**
     * Handles game started message
     * @param data The game started data
     */
    private handleGameStarted;
    /**
     * Handles state changed message
     * @param data The state changed data
     */
    private handleStateChanged;
    /**
     * Handles player action message
     * @param data The player action data
     */
    private handlePlayerAction;
    /**
     * Handles hand complete message
     * @param data The hand complete data
     */
    private handleHandComplete;
    /**
     * Renders the current game state
     */
    private renderGameState;
    /**
     * Gets a player name by ID
     * @param playerId The player ID
     * @returns The player name, or "Unknown player" if not found
     */
    private getPlayerNameById;
    /**
     * Shows available commands
     */
    private showCommands;
    /**
     * Shows available action options
     */
    private showActionOptions;
    /**
     * Prompts for login
     */
    private promptLogin;
    /**
     * Prompts for a command
     */
    private promptCommand;
    /**
     * Handles game commands
     * @param command The command
     */
    private handleGameCommand;
    /**
     * Handles action commands
     * @param command The command
     * @param args The command arguments
     */
    private handleActionCommand;
    /**
     * Sends a message to the server
     * @param type The message type
     * @param data The message data
     */
    private sendMessage;
    /**
     * Connects to the server
     */
    connect(): void;
    /**
     * Disconnects from the server
     */
    disconnect(): void;
    /**
     * Helper to render a card with color and suit symbol
     */
    private renderCard;
    /**
     * Helper to render a list of cards
     */
    private renderCards;
    /**
     * Helper to render a player row
     */
    private renderPlayer;
}
