"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = exports.DEFAULT_GAME_CONFIG = void 0;
const Table_1 = require("../models/Table");
const Action_1 = require("../models/Action");
const Pot_1 = require("../models/Pot");
const StateMachine_1 = require("./StateMachine");
const Dealer_1 = require("./Dealer");
const types_1 = require("../types");
const TexasHoldemEvaluator_1 = require("../evaluator/TexasHoldemEvaluator");
const OmahaEvaluator_1 = require("../evaluator/OmahaEvaluator");
/**
 * Default game engine configuration - Texas Hold'em No Limit
 */
exports.DEFAULT_GAME_CONFIG = {
    variant: types_1.GameVariant.TEXAS_HOLDEM,
    bettingStructure: types_1.BettingStructure.NO_LIMIT,
    smallBlind: 5,
    bigBlind: 10,
    ante: 0,
    minPlayers: 2,
    maxPlayers: 10,
    timeoutInSeconds: 30,
};
/**
 * Game Engine - Coordinates game flow and processes actions
 */
class GameEngine {
    /**
     * Creates a new game engine
     * @param config Game configuration
     * @param playerManager Optional player manager for centralized player tracking
     */
    constructor(config = exports.DEFAULT_GAME_CONFIG, playerManager) {
        this.currentPlayerIndex = 0;
        this.dealerPosition = -1;
        this.eventListeners = new Map();
        this.actionTimeoutId = null;
        this.playerManager = null;
        this.config = { ...exports.DEFAULT_GAME_CONFIG, ...config };
        // Create a new table with max players from config
        this.table = new Table_1.Table({
            id: `game-${Date.now()}`,
            name: `Poker Table ${Date.now()}`,
            maxPlayers: this.config.maxPlayers,
            smallBlind: this.config.smallBlind,
            bigBlind: this.config.bigBlind,
            minBuyIn: this.config.smallBlind * 20,
            maxBuyIn: this.config.smallBlind * 200,
            gameVariant: this.config.variant,
            bettingStructure: this.config.bettingStructure,
        });
        this.stateMachine = new StateMachine_1.GameStateMachine();
        this.dealer = new Dealer_1.Dealer();
        this.potManager = new Pot_1.PotManager();
        this.playerManager = playerManager || null;
        // Set up state change listener
        this.stateMachine.addStateChangeListener(this.handleStateChange.bind(this));
        // Initialize the hand evaluator based on game variant
        this.handEvaluator = this.createHandEvaluator();
        // Register the table with the player manager if provided
        if (this.playerManager) {
            this.playerManager.registerTable(this.table);
        }
    }
    /**
     * Sets the player manager for this game engine
     * @param playerManager The player manager to use
     */
    setPlayerManager(playerManager) {
        this.playerManager = playerManager;
        playerManager.registerTable(this.table);
    }
    /**
     * Gets the player manager if set
     * @returns The player manager, or null if not set
     */
    getPlayerManager() {
        return this.playerManager;
    }
    /**
     * Creates the appropriate hand evaluator based on the game variant
     */
    createHandEvaluator() {
        // Create evaluator based on game variant
        switch (this.config.variant) {
            case types_1.GameVariant.OMAHA:
                return new OmahaEvaluator_1.OmahaEvaluator({
                    evaluateLow: false,
                    lowHandQualifier: 8,
                    acesLow: true,
                });
            case types_1.GameVariant.TEXAS_HOLDEM:
            default:
                return new TexasHoldemEvaluator_1.TexasHoldemEvaluator({
                    evaluateLow: false,
                    lowHandQualifier: 8,
                    acesLow: true,
                });
        }
    }
    /**
     * Adds a player to the table
     * @param player The player to add
     * @returns True if the player was added successfully
     */
    addPlayer(player) {
        if (this.table.players.filter(Boolean).length >= this.config.maxPlayers) {
            return false;
        }
        // Find an empty seat
        const emptySeatIndex = this.table.players.findIndex((p) => p === null);
        if (emptySeatIndex !== -1) {
            // Try to seat the player
            const added = this.table.seatPlayer(player, emptySeatIndex);
            // Verify player was actually added to the table
            const playerIndex = this.table.players.findIndex((p) => p !== null && p.id === player.id);
            // Explicitly activate the player if needed
            if (added && player.status !== types_1.PlayerStatus.ACTIVE) {
                player.status = types_1.PlayerStatus.ACTIVE;
            }
            // Update player manager if available
            if (added && this.playerManager) {
                // Update player session in player manager
                this.playerManager.updatePlayerActivity(player.id);
            }
            return added;
        }
        return false;
    }
    /**
     * Removes a player from the table
     * @param playerId The ID of the player to remove
     * @returns True if the player was removed successfully
     */
    removePlayer(playerId) {
        const playerIndex = this.table.players.findIndex((p) => p !== null && p.id === playerId);
        if (playerIndex !== -1) {
            const removed = this.table.removePlayer(playerId);
            // Update player manager if available
            if (removed && this.playerManager) {
                // Find the player's session in the player manager and update it
                const session = this.playerManager.getPlayerSession(playerId);
                if (session) {
                    session.currentTableId = null;
                    session.seatIndex = null;
                    session.isActive = false;
                }
            }
            return removed;
        }
        return false;
    }
    /**
     * Starts a new game if possible
     * @returns True if the game was started successfully
     */
    startGame() {
        const players = this.table.players.filter((p) => p !== null);
        // Check if we can start the game
        if (players.length < this.config.minPlayers) {
            return false;
        }
        if (this.stateMachine.getCurrentState() !== types_1.GameState.WAITING) {
            return false;
        }
        // Reset the table and deck
        this.resetTable();
        // Move the dealer button
        this.moveDealerButton();
        // Transition to STARTING state
        this.stateMachine.transition(types_1.GameState.STARTING);
        // Deal the hole cards
        this.dealHoleCards();
        // Transition to PREFLOP
        this.stateMachine.transition(types_1.GameState.PREFLOP);
        // Post blinds and antes
        this.postBlindsAndAntes();
        // Emit game started event
        this.emit(types_1.GameEngineEventType.GAME_STARTED, {
            table: this.table,
            players: players,
            dealerPosition: this.dealerPosition,
            blinds: {
                small: this.config.smallBlind,
                big: this.config.bigBlind,
            },
        });
        return true;
    }
    /**
     * Resets the table for a new hand
     */
    resetTable() {
        // Clear community cards
        this.table.clearCommunityCards();
        // Reset all active players' hands
        this.table.players.forEach((player) => {
            if (player) {
                player.hand.clear();
                player.currentBet = 0;
                if (player.status === types_1.PlayerStatus.SITTING_OUT && player.stack > 0) {
                    player.status = types_1.PlayerStatus.ACTIVE;
                }
            }
        });
        // Reset the pot manager
        this.potManager.clear();
        // Reset the dealer's deck
        this.dealer.reset();
    }
    /**
     * Moves the dealer button to the next player
     */
    moveDealerButton() {
        const players = this.table.activePlayers;
        if (players.length === 0) {
            return;
        }
        // Move the dealer button
        this.dealerPosition = (this.dealerPosition + 1) % players.length;
        // In our implementation, we need to keep track of dealer position in GameEngine
        // since Table doesn't have this property
        // Set the first player to act based on the dealer position
        this.setFirstPlayerToAct();
    }
    /**
     * Sets the first player to act based on the current state
     */
    setFirstPlayerToAct() {
        const activePlayers = this.table.activePlayers;
        const currentState = this.stateMachine.getCurrentState();
        if (activePlayers.length <= 1) {
            return;
        }
        switch (currentState) {
            case types_1.GameState.PREFLOP:
                // In preflop, first to act is after the big blind
                this.currentPlayerIndex =
                    (this.dealerPosition + 3) % activePlayers.length;
                break;
            case types_1.GameState.FLOP:
            case types_1.GameState.TURN:
            case types_1.GameState.RIVER:
                // In other rounds, first to act is after the dealer
                this.currentPlayerIndex =
                    (this.dealerPosition + 1) % activePlayers.length;
                break;
            default:
                // For other states, reset to the first player
                this.currentPlayerIndex = 0;
        }
        this.notifyPlayerTurn();
    }
    /**
     * Posts blinds and antes for the current hand
     */
    postBlindsAndAntes() {
        const activePlayers = this.table.activePlayers;
        if (activePlayers.length < 2) {
            return;
        }
        // Post small blind
        const smallBlindPos = (this.dealerPosition + 1) % activePlayers.length;
        const smallBlindPlayer = activePlayers[smallBlindPos];
        smallBlindPlayer.placeBet(this.config.smallBlind);
        // Post big blind
        const bigBlindPos = (this.dealerPosition + 2) % activePlayers.length;
        const bigBlindPlayer = activePlayers[bigBlindPos];
        bigBlindPlayer.placeBet(this.config.bigBlind);
        // Post antes if configured
        if (this.config.ante > 0) {
            activePlayers.forEach((player) => {
                player.placeBet(this.config.ante);
            });
        }
        // Initialize pot with current bets
        this.collectBets(true);
        // Set the current bet to the big blind
        this.table.currentBet = this.config.bigBlind;
    }
    /**
     * Collects bets from all players into the pot
     */
    collectBets(blinds = false) {
        this.table.players.forEach((player) => {
            if (player && player.currentBet > 0) {
                // Add each player's bet to the pot manager
                this.potManager.addBet(player, player.currentBet);
                if (!blinds)
                    player.currentBet = 0;
            }
        });
        // After all bets are recorded, move them to pots
        if (!blinds)
            this.potManager.collectBets();
    }
    /**
     * Handles a player's action
     * @param playerId The ID of the player taking the action
     * @param action The action to take
     * @returns The result of the action
     */
    handleAction(playerId, action) {
        const player = this.getPlayerById(playerId);
        if (!player) {
            return { success: false, message: "Player not found" };
        }
        const activePlayers = this.table.activePlayers;
        const currentPlayer = activePlayers[this.currentPlayerIndex];
        // Make sure it's the player's turn
        if (currentPlayer.id !== playerId) {
            return { success: false, message: "Not your turn" };
        }
        // Cancel any pending action timeout
        this.clearActionTimeout();
        // Process the action based on type
        let actionSuccess = false;
        switch (action.type) {
            case types_1.ActionType.FOLD:
                player.status = types_1.PlayerStatus.FOLDED;
                actionSuccess = true;
                break;
            case types_1.ActionType.CHECK:
                // Can only check if no one has bet or player has matched the current bet
                if (this.table.currentBet > player.currentBet) {
                    return {
                        success: false,
                        message: "Cannot check, must call or raise",
                    };
                }
                actionSuccess = true;
                break;
            case types_1.ActionType.CALL:
                // Call the current bet
                actionSuccess =
                    player.placeBet(this.table.currentBet - player.currentBet) > 0;
                break;
            case types_1.ActionType.BET:
            case types_1.ActionType.RAISE:
                // Validate bet/raise amount
                const amount = action.amount;
                const minBet = Math.max(this.config.bigBlind, this.table.currentBet * 2);
                if (amount < minBet) {
                    return { success: false, message: `Minimum bet/raise is ${minBet}` };
                }
                actionSuccess = player.placeBet(amount) > 0;
                if (actionSuccess) {
                    this.table.currentBet = player.currentBet;
                }
                break;
            case types_1.ActionType.ALL_IN:
                // All-in with all remaining chips
                const allInAmount = player.stack;
                actionSuccess = player.placeBet(allInAmount) > 0;
                if (actionSuccess) {
                    player.status = types_1.PlayerStatus.ALL_IN;
                    this.table.currentBet = Math.max(this.table.currentBet, player.currentBet);
                }
                break;
        }
        if (!actionSuccess) {
            return { success: false, message: "Action could not be completed" };
        }
        // Update player activity in player manager if available
        if (this.playerManager) {
            this.playerManager.updatePlayerActivity(playerId);
        }
        // Emit player action event
        this.emit(types_1.GameEngineEventType.PLAYER_ACTION, { player, action });
        // Move to the next player or next game state
        const nextState = this.advanceGame();
        return {
            success: true,
            nextState,
        };
    }
    /**
     * Gets a player by ID
     */
    getPlayerById(playerId) {
        return (this.table.players.find((p) => p !== null && p.id === playerId) || null);
    }
    /**
     * Advances the game to the next player or state
     * @returns The new game state if changed
     */
    advanceGame() {
        // Check if round is complete
        if (this.isRoundComplete()) {
            return this.advanceToNextState();
        }
        else {
            // Move to the next player
            this.moveToNextPlayer();
            return undefined;
        }
    }
    /**
     * Checks if the current betting round is complete
     */
    isRoundComplete() {
        const activePlayers = this.table.activePlayers;
        // If only one player remains active, the round is complete
        if (activePlayers.length <= 1) {
            return true;
        }
        // Round is complete when all active players have either:
        // 1. Matched the current bet, or
        // 2. Gone all-in with less than the current bet
        const currentBet = this.table.currentBet;
        return activePlayers.every((player) => player.currentBet === currentBet ||
            (player.status === types_1.PlayerStatus.ALL_IN &&
                player.currentBet < currentBet));
    }
    /**
     * Advances to the next player in the current round
     */
    moveToNextPlayer() {
        const activePlayers = this.getActivePlayersInHand();
        if (activePlayers.length <= 1) {
            return;
        }
        // Find the next player who can act
        let nextPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;
        // Skip players who are all-in
        while (activePlayers[nextPlayerIndex].status === types_1.PlayerStatus.ALL_IN) {
            nextPlayerIndex = (nextPlayerIndex + 1) % activePlayers.length;
            // If we've gone through all players and they're all all-in, break
            if (nextPlayerIndex === this.currentPlayerIndex) {
                break;
            }
        }
        this.currentPlayerIndex = nextPlayerIndex;
        this.notifyPlayerTurn();
        // Set a timeout for the player's action
        this.setActionTimeout();
    }
    /**
     * Gets players who are active in the current hand (not folded, not sitting out)
     */
    getActivePlayersInHand() {
        return this.table.players.filter((p) => p !== null &&
            p.status !== types_1.PlayerStatus.FOLDED &&
            p.status !== types_1.PlayerStatus.SITTING_OUT);
    }
    /**
     * Advances the game to the next state
     * @returns The new game state
     */
    advanceToNextState() {
        const currentState = this.stateMachine.getCurrentState();
        let nextState;
        // Collect bets into the pot
        this.collectBets();
        // Determine next state based on current state and game conditions
        const activePlayers = this.getActivePlayersInHand();
        // If only one active player remains, go straight to showdown
        if (activePlayers.length <= 1) {
            nextState = types_1.GameState.SHOWDOWN;
        }
        else {
            // Otherwise, advance to the next state in sequence
            switch (currentState) {
                case types_1.GameState.STARTING:
                    nextState = types_1.GameState.PREFLOP;
                    this.dealHoleCards();
                    break;
                case types_1.GameState.PREFLOP:
                    nextState = types_1.GameState.FLOP;
                    this.dealFlop();
                    break;
                case types_1.GameState.FLOP:
                    nextState = types_1.GameState.TURN;
                    this.dealTurn();
                    break;
                case types_1.GameState.TURN:
                    nextState = types_1.GameState.RIVER;
                    this.dealRiver();
                    break;
                case types_1.GameState.RIVER:
                    nextState = types_1.GameState.SHOWDOWN;
                    break;
                case types_1.GameState.SHOWDOWN:
                    nextState = types_1.GameState.FINISHED;
                    this.resolveHand();
                    break;
                case types_1.GameState.FINISHED:
                    nextState = types_1.GameState.WAITING;
                    break;
                default:
                    nextState = types_1.GameState.WAITING;
            }
        }
        // Transition to the next state
        this.stateMachine.transition(nextState);
        return nextState;
    }
    /**
     * Deals hole cards to all active players
     */
    dealHoleCards() {
        const activePlayers = this.table.activePlayers;
        if (activePlayers.length === 0) {
            return;
        }
        // Deal hole cards based on game variant
        if (this.config.variant === types_1.GameVariant.TEXAS_HOLDEM) {
            // Deal 2 cards to each player
            activePlayers.forEach((player) => {
                const cards = this.dealer.dealCards(2);
                player.hand.addCards(cards);
            });
        }
        else if (this.config.variant === types_1.GameVariant.OMAHA) {
            // Deal 4 cards to each player for Omaha
            activePlayers.forEach((player) => {
                const cards = this.dealer.dealCards(4);
                player.hand.addCards(cards);
            });
        }
    }
    /**
     * Deals the flop (first 3 community cards)
     */
    dealFlop() {
        // Use the dealer to deal the flop
        const flopCards = this.dealer.dealFlop(this.table);
        // Emit event
        this.emit(types_1.GameEngineEventType.STATE_CHANGED, {
            oldState: types_1.GameState.PREFLOP,
            newState: types_1.GameState.FLOP,
            cards: flopCards,
        });
    }
    /**
     * Deals the turn (4th community card)
     */
    dealTurn() {
        // Use the dealer to deal the turn
        const turnCard = this.dealer.dealTurn(this.table);
        // Emit event
        this.emit(types_1.GameEngineEventType.STATE_CHANGED, {
            oldState: types_1.GameState.FLOP,
            newState: types_1.GameState.TURN,
            cards: turnCard ? [turnCard] : [],
        });
    }
    /**
     * Deals the river (5th community card)
     */
    dealRiver() {
        // Use the dealer to deal the river
        const riverCard = this.dealer.dealRiver(this.table);
        // Emit event
        this.emit(types_1.GameEngineEventType.STATE_CHANGED, {
            oldState: types_1.GameState.TURN,
            newState: types_1.GameState.RIVER,
            cards: riverCard ? [riverCard] : [],
        });
    }
    /**
     * Resolves the hand, determines winners and awards pots
     */
    resolveHand() {
        const activePlayers = this.getActivePlayersInHand();
        const communityCards = this.table.communityCards;
        const winners = [];
        // If only one player remains, they win the pot without showdown
        if (activePlayers.length === 1) {
            const winner = activePlayers[0];
            const potAmount = this.table.totalPot;
            winners.push({
                player: winner,
                handRank: "Default Win",
                handValue: 0,
                bestHand: [],
                potAmount,
            });
            winner.addWinnings(potAmount);
            this.potManager.clear();
            // Update player stats in player manager if available
            if (this.playerManager) {
                this.playerManager.updatePlayerStats(winner.id, true, potAmount, potAmount);
            }
            this.emit(types_1.GameEngineEventType.HAND_COMPLETE, { winners });
            return winners;
        }
        // Calculate hand values for all players
        const playerHandResults = activePlayers.map((player) => {
            const handResult = this.handEvaluator.evaluate(player.hand, communityCards);
            return {
                player,
                handResult,
            };
        });
        // Manually determine the winner for now
        // In a full implementation, we would use the pot manager to handle side pots
        let bestResult = playerHandResults[0];
        for (let i = 1; i < playerHandResults.length; i++) {
            const comparisonResult = this.handEvaluator.compareHands(playerHandResults[i].handResult, bestResult.handResult);
            if (comparisonResult > 0) {
                bestResult = playerHandResults[i];
            }
        }
        // Award the pot to the winner
        const winningPlayer = bestResult.player;
        const potAmount = this.table.totalPot;
        winners.push({
            player: winningPlayer,
            handRank: bestResult.handResult.rank?.toString() || "Unknown",
            handValue: bestResult.handResult.rankValue,
            bestHand: bestResult.handResult.bestCards,
            potAmount,
        });
        winningPlayer.addWinnings(potAmount);
        // Update player stats in player manager if available
        if (this.playerManager) {
            // Update winner's stats
            this.playerManager.updatePlayerStats(winningPlayer.id, true, potAmount, potAmount);
            // Update other players' stats
            activePlayers.forEach((player) => {
                if (player.id !== winningPlayer.id) {
                    const lostAmount = -player.currentBet;
                    this.playerManager?.updatePlayerStats(player.id, false, lostAmount, potAmount);
                }
            });
        }
        this.potManager.clear();
        this.emit(types_1.GameEngineEventType.HAND_COMPLETE, { winners });
        return winners;
    }
    /**
     * Handles state changes in the game state machine
     */
    handleStateChange(oldState, newState) {
        // Reset current bet on new betting rounds
        if (newState === types_1.GameState.PREFLOP ||
            newState === types_1.GameState.FLOP ||
            newState === types_1.GameState.TURN ||
            newState === types_1.GameState.RIVER) {
            this.table.currentBet = 0;
            this.setFirstPlayerToAct();
        }
        // Emit state change event
        this.emit(types_1.GameEngineEventType.STATE_CHANGED, { oldState, newState });
        if (newState === types_1.GameState.FINISHED) {
            // Prepare for the next hand
            this.table.players.forEach((player) => {
                if (player) {
                    if (player.status !== types_1.PlayerStatus.SITTING_OUT) {
                        player.status = types_1.PlayerStatus.ACTIVE;
                    }
                    player.clearHand();
                    player.currentBet = 0;
                }
            });
            this.table.clearCommunityCards();
            this.potManager.clear();
        }
    }
    /**
     * Notifies that it's a player's turn to act
     */
    notifyPlayerTurn() {
        const activePlayers = this.getActivePlayersInHand();
        if (activePlayers.length <= 1 ||
            this.currentPlayerIndex >= activePlayers.length) {
            return;
        }
        const currentPlayer = activePlayers[this.currentPlayerIndex];
        this.emit(types_1.GameEngineEventType.PLAYER_TURN, {
            playerId: currentPlayer.id,
            timeoutInSeconds: this.config.timeoutInSeconds,
        });
    }
    /**
     * Sets a timeout for the current player's action
     */
    setActionTimeout() {
        // Clear any existing timeout
        this.clearActionTimeout();
        // Set a new timeout
        this.actionTimeoutId = setTimeout(() => {
            const activePlayers = this.getActivePlayersInHand();
            if (activePlayers.length <= 1 ||
                this.currentPlayerIndex >= activePlayers.length) {
                return;
            }
            const currentPlayer = activePlayers[this.currentPlayerIndex];
            // Automatically fold if there's a bet to call
            if (this.table.currentBet > currentPlayer.currentBet) {
                const foldAction = new Action_1.Action(currentPlayer, types_1.ActionType.FOLD);
                this.handleAction(currentPlayer.id, foldAction);
            }
            else {
                // Otherwise check
                const checkAction = new Action_1.Action(currentPlayer, types_1.ActionType.CHECK);
                this.handleAction(currentPlayer.id, checkAction);
            }
        }, this.config.timeoutInSeconds * 1000);
    }
    /**
     * Clears the action timeout
     */
    clearActionTimeout() {
        if (this.actionTimeoutId) {
            clearTimeout(this.actionTimeoutId);
            this.actionTimeoutId = null;
        }
    }
    /**
     * Gets the current game state
     */
    getGameState() {
        return this.stateMachine.getCurrentState();
    }
    /**
     * Gets the table
     */
    getTable() {
        return this.table;
    }
    /**
     * Gets the current pot manager
     */
    getPotManager() {
        return this.potManager;
    }
    /**
     * Gets the game configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Adds an event listener
     * @param event The event to listen for
     * @param callback The callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)?.push(callback);
    }
    /**
     * Removes an event listener
     * @param event The event to remove the listener from
     * @param callback The callback function to remove
     */
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    /**
     * Emits an event
     * @param event The event to emit
     * @param data The event data
     */
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach((callback) => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Gets the current dealer position
     * @returns The current dealer position
     */
    getDealerPosition() {
        return this.dealerPosition;
    }
    /**
     * Gets the current player index
     * @returns The current player index
     */
    getCurrentPlayerIndex() {
        return this.currentPlayerIndex;
    }
    /**
     * Checks if it's a specific player's turn
     * @param playerId The player ID to check
     * @returns True if it's the player's turn
     */
    isPlayersTurn(playerId) {
        const currentPlayer = this.table.players[this.currentPlayerIndex];
        return currentPlayer !== null && currentPlayer.id === playerId;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=GameEngine.js.map