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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokerClient = void 0;
const net = __importStar(require("net"));
const readline = __importStar(require("readline"));
const chalk_1 = __importDefault(require("chalk"));
const types_1 = require("../types");
/**
 * Simple poker client for command line testing
 */
class PokerClient {
    /**
     * Creates a new poker client
     * @param host The server host
     * @param port The server port
     */
    constructor(host = "localhost", port = 3000) {
        this.host = host;
        this.port = port;
        this.connected = false;
        this.loggedIn = false;
        this.playerId = null;
        this.username = null;
        this.gameState = null;
        this.playerCards = [];
        this.buffer = "";
        this.myTurn = false;
        this.socket = new net.Socket();
        // Create readline interface
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        // Set up event handlers
        this.setupEventHandlers();
    }
    /**
     * Sets up event handlers
     */
    setupEventHandlers() {
        // Socket event handlers
        this.socket.on("connect", () => {
            console.log(`Connected to server at ${this.host}:${this.port}`);
            this.connected = true;
        });
        this.socket.on("data", (data) => {
            // Combine incoming data with any buffered data
            const combined = this.buffer + data.toString();
            // Split by newlines in case multiple messages arrive at once
            const parts = combined.split("\n");
            // Keep the last part as buffer if it's not complete
            this.buffer = parts.pop() || "";
            // Process each complete message
            parts.forEach((part) => {
                if (part.trim()) {
                    this.handleServerMessage(part);
                }
            });
        });
        this.socket.on("close", () => {
            console.log("Disconnected from server");
            this.connected = false;
            process.exit(0);
        });
        this.socket.on("error", (err) => {
            console.error("Socket error:", err);
            process.exit(1);
        });
    }
    /**
     * Handles messages from the server
     * @param data The message data
     */
    handleServerMessage(data) {
        try {
            const message = JSON.parse(data);
            if (!message.type) {
                console.error("Invalid message format from server");
                return;
            }
            switch (message.type) {
                case "WELCOME":
                    this.handleWelcomeMessage(message.data);
                    break;
                case "LOGIN_SUCCESS":
                    this.handleLoginSuccess(message.data);
                    break;
                case "ERROR":
                    this.handleErrorMessage(message.data);
                    break;
                case "GAME_STATE":
                    this.handleGameState(message.data);
                    break;
                case "PLAYER_CARDS":
                    this.handlePlayerCards(message.data);
                    break;
                case "PLAYER_TURN":
                    this.handlePlayerTurn(message.data);
                    break;
                case "GAME_STARTED":
                    this.handleGameStarted(message.data);
                    break;
                case "STATE_CHANGED":
                    this.handleStateChanged(message.data);
                    break;
                case "PLAYER_ACTION":
                    this.handlePlayerAction(message.data);
                    break;
                case "HAND_COMPLETE":
                    this.handleHandComplete(message.data);
                    break;
                default:
                    console.log(`Unknown message type: ${message.type}`);
            }
        }
        catch (error) {
            console.error("Error parsing server message:", error);
        }
    }
    /**
     * Handles welcome message
     * @param data The welcome data
     */
    handleWelcomeMessage(data) {
        console.log(data.message);
        this.promptLogin();
    }
    /**
     * Handles login success message
     * @param data The login success data
     */
    handleLoginSuccess(data) {
        this.playerId = data.playerId;
        this.loggedIn = true;
        console.log(`Login successful! You are in seat ${data.seat} with ${data.stack} chips.`);
        this.showCommands();
    }
    /**
     * Handles error message
     * @param data The error data
     */
    handleErrorMessage(data) {
        console.error(`Error: ${data.message}`);
    }
    /**
     * Handles game state message
     * @param data The game state data
     */
    handleGameState(data) {
        this.gameState = data;
        this.renderGameState();
    }
    /**
     * Handles player cards message
     * @param data The player cards data
     */
    handlePlayerCards(data) {
        this.playerCards = data.cards;
        console.log(chalk_1.default.bold("Your cards: ") + this.renderCards(this.playerCards));
    }
    /**
     * Handles player turn message
     * @param data The player turn data
     */
    handlePlayerTurn(data) {
        this.myTurn = data.playerId === this.playerId;
        this.renderGameState();
        if (this.myTurn) {
            console.log(chalk_1.default.bgGreen.black(`\nIt's your turn! You have ${data.timeoutInSeconds} seconds to act.`));
            this.showActionOptions();
        }
        else {
            const playerName = this.getPlayerNameById(data.playerId);
            console.log(chalk_1.default.bgCyan.black(`\nIt's ${playerName}'s turn.`));
        }
    }
    /**
     * Handles game started message
     * @param data The game started data
     */
    handleGameStarted(data) {
        console.clear();
        console.log(chalk_1.default.bold("\nGame started!"));
        console.log(`Dealer position: ${data.dealerPosition}`);
        console.log(`Small blind: ${data.blinds.small}, Big blind: ${data.blinds.big}`);
    }
    /**
     * Handles state changed message
     * @param data The state changed data
     */
    handleStateChanged(data) {
        console.clear();
        console.log(chalk_1.default.yellow(`\nGame state changed from ${data.oldState} to ${data.newState}`));
        if (data.cards && data.cards.length > 0) {
            console.log(chalk_1.default.bold("New cards: ") + this.renderCards(data.cards));
        }
    }
    /**
     * Handles player action message
     * @param data The player action data
     */
    handlePlayerAction(data) {
        let actionText = "";
        switch (data.action) {
            case "FOLD":
                actionText = chalk_1.default.gray("folded");
                break;
            case "CHECK":
                actionText = chalk_1.default.blue("checked");
                break;
            case "CALL":
                actionText = chalk_1.default.green("called");
                break;
            case "BET":
                actionText = chalk_1.default.yellow(`bet ${data.amount}`);
                break;
            case "RAISE":
                actionText = chalk_1.default.magenta(`raised to ${data.amount}`);
                break;
            case "ALL_IN":
                actionText = chalk_1.default.redBright("went all-in");
                break;
            default:
                actionText = data.action;
        }
        console.log(`\n${chalk_1.default.bold(data.name)} ${actionText}`);
    }
    /**
     * Handles hand complete message
     * @param data The hand complete data
     */
    handleHandComplete(data) {
        console.clear();
        console.log(chalk_1.default.bgMagenta.black("\nHand complete!"));
        data.winners.forEach((winner) => {
            console.log(chalk_1.default.bold(`${winner.name} won ${winner.potAmount} with ${winner.handRank}`));
        });
    }
    /**
     * Renders the current game state
     */
    renderGameState() {
        if (!this.gameState)
            return;
        console.clear();
        console.log(chalk_1.default.bgWhite.black("\n==== GAME STATE ===="));
        console.log(`State: ${chalk_1.default.bold(this.gameState.gameState)}`);
        console.log(`Pot: ${chalk_1.default.green(this.gameState.pot)}`);
        console.log(`Current bet: ${chalk_1.default.blue(this.gameState.currentBet)}`);
        if (this.gameState.communityCards.length > 0) {
            console.log(chalk_1.default.bold("Community cards: ") +
                this.renderCards(this.gameState.communityCards));
        }
        console.log("\nPlayers:");
        this.gameState.players.forEach((player, index) => {
            if (player) {
                console.log(this.renderPlayer(player, index));
            }
        });
        console.log(chalk_1.default.bgWhite.black("====================\n"));
        if (this.playerCards && this.playerCards.length > 0) {
            console.log(chalk_1.default.bold("Your cards: ") + this.renderCards(this.playerCards));
        }
    }
    /**
     * Gets a player name by ID
     * @param playerId The player ID
     * @returns The player name, or "Unknown player" if not found
     */
    getPlayerNameById(playerId) {
        if (!this.gameState)
            return "Unknown player";
        const player = this.gameState.players.find((p) => p && p.id === playerId);
        return player ? player.name : "Unknown player";
    }
    /**
     * Shows available commands
     */
    showCommands() {
        console.log("\nAvailable commands:");
        console.log("start - Start the game");
        console.log("quit - Disconnect from the server");
        console.log("help - Show these commands");
        this.promptCommand();
    }
    /**
     * Shows available action options
     */
    showActionOptions() {
        if (!this.gameState)
            return;
        console.log("\nAvailable actions:");
        console.log("fold - Fold your hand");
        const currentBet = this.gameState.currentBet;
        const player = this.gameState.players.find((p) => p && p.id === this.playerId);
        if (!player)
            return;
        if (currentBet <= player.currentBet) {
            console.log("check - Check");
        }
        else {
            console.log(`call - Call ${currentBet - player.currentBet}`);
        }
        if (player.stack > 0) {
            const minRaise = Math.max(this.gameState.currentBet * 2, this.gameState.currentBet + 10);
            console.log(`bet <amount> - Bet/Raise (min: ${minRaise})`);
            console.log("allin - Go all-in");
        }
    }
    /**
     * Prompts for login
     */
    promptLogin() {
        this.rl.question("Enter your username: ", (username) => {
            this.username = username.trim();
            if (!this.username) {
                console.log("Username cannot be empty");
                this.promptLogin();
                return;
            }
            this.sendMessage("LOGIN", { username: this.username });
        });
    }
    /**
     * Prompts for a command
     */
    promptCommand() {
        this.rl.question("> ", (input) => {
            const [command, ...args] = input.trim().toLowerCase().split(" ");
            if (this.myTurn) {
                this.handleActionCommand(command, args);
            }
            else {
                this.handleGameCommand(command);
            }
            // Continue prompting unless we're quitting
            if (command !== "quit" && this.connected) {
                this.promptCommand();
            }
        });
    }
    /**
     * Handles game commands
     * @param command The command
     */
    handleGameCommand(command) {
        switch (command) {
            case "start":
                this.sendMessage("START_GAME", {});
                break;
            case "quit":
                this.disconnect();
                break;
            case "help":
                this.showCommands();
                break;
            default:
                console.log('Unknown command. Type "help" for available commands.');
        }
    }
    /**
     * Handles action commands
     * @param command The command
     * @param args The command arguments
     */
    handleActionCommand(command, args) {
        switch (command) {
            case "fold":
                this.sendMessage("PLAYER_ACTION", { type: "FOLD" });
                this.myTurn = false;
                break;
            case "check":
                this.sendMessage("PLAYER_ACTION", { type: "CHECK" });
                this.myTurn = false;
                break;
            case "call":
                this.sendMessage("PLAYER_ACTION", { type: "CALL" });
                this.myTurn = false;
                break;
            case "bet":
            case "raise":
                const amount = parseInt(args[0]);
                if (isNaN(amount) || amount <= 0) {
                    console.log("Invalid amount. Must be a positive number.");
                    return;
                }
                this.sendMessage("PLAYER_ACTION", {
                    type: command === "bet" ? "BET" : "RAISE",
                    amount,
                });
                this.myTurn = false;
                break;
            case "allin":
                this.sendMessage("PLAYER_ACTION", { type: "ALL_IN" });
                this.myTurn = false;
                break;
            default:
                console.log('Unknown action. Type "help" for available commands.');
        }
    }
    /**
     * Sends a message to the server
     * @param type The message type
     * @param data The message data
     */
    sendMessage(type, data) {
        const message = JSON.stringify({ type, data });
        this.socket.write(message + "\n");
    }
    /**
     * Connects to the server
     */
    connect() {
        this.socket.connect(this.port, this.host);
    }
    /**
     * Disconnects from the server
     */
    disconnect() {
        if (this.connected) {
            this.socket.end();
        }
    }
    /**
     * Helper to render a card with color and suit symbol
     */
    renderCard(card) {
        // Card format: 'AS', 'TD', etc.
        if (!card || card.length < 2)
            return card;
        const rank = card.slice(0, card.length - 1);
        const suit = card.slice(-1);
        let suitSymbol = "?";
        let color = chalk_1.default.white;
        switch (suit) {
            case "H":
                suitSymbol = "♥";
                color = chalk_1.default.red;
                break;
            case "D":
                suitSymbol = "♦";
                color = chalk_1.default.redBright;
                break;
            case "C":
                suitSymbol = "♣";
                color = chalk_1.default.green;
                break;
            case "S":
                suitSymbol = "♠";
                color = chalk_1.default.blue;
                break;
        }
        return color(`${rank}${suitSymbol}`);
    }
    /**
     * Helper to render a list of cards
     */
    renderCards(cards) {
        return cards.map((c) => this.renderCard(c)).join(" ");
    }
    /**
     * Helper to render a player row
     */
    renderPlayer(player, index) {
        let name = player.name;
        let status = player.status;
        let chips = player.stack;
        let bet = player.currentBet;
        let isMe = player.id === this.playerId;
        let isDealer = this.gameState && index === this.gameState.dealerPosition;
        let isCurrent = this.gameState && index === this.gameState.currentPlayerIndex;
        let color = chalk_1.default.white;
        if (isMe)
            color = chalk_1.default.bold.yellow;
        else if (isCurrent)
            color = chalk_1.default.bold.cyan;
        else if (status === types_1.PlayerStatus.FOLDED)
            color = chalk_1.default.gray;
        else if (status === types_1.PlayerStatus.ALL_IN)
            color = chalk_1.default.magenta;
        let dealerMark = isDealer ? chalk_1.default.bgWhite.black(" D ") : "   ";
        let turnMark = isCurrent ? chalk_1.default.bgCyan.black("→ ") : "   ";
        let meMark = isMe ? chalk_1.default.bgYellow.black("ME") : "   ";
        return `${turnMark}${dealerMark}${meMark} ${color(name)} | ${chalk_1.default.green(chips + " chips")} | bet: ${chalk_1.default.blue(bet)} | status: ${chalk_1.default.gray(status)}`;
    }
}
exports.PokerClient = PokerClient;
//# sourceMappingURL=PokerClient.js.map