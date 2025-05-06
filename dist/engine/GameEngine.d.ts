import { Table } from "../models/Table";
import { Player } from "../models/Player";
import { Card } from "../models/Card";
import { Action } from "../models/Action";
import { PotManager } from "../models/Pot";
import { PlayerManager } from "./PlayerManager";
import { GameState, BettingStructure, GameVariant, GameEngineEventType, GameStartedEvent, PlayerActionEvent, StateChangedEvent, HandCompleteEvent, PlayerTurnEvent, GameErrorEvent, RoundCompleteEvent } from "../types";
type GameEngineEventPayloadMap = {
    [GameEngineEventType.GAME_STARTED]: GameStartedEvent;
    [GameEngineEventType.PLAYER_ACTION]: PlayerActionEvent;
    [GameEngineEventType.STATE_CHANGED]: StateChangedEvent;
    [GameEngineEventType.ROUND_COMPLETE]: RoundCompleteEvent;
    [GameEngineEventType.HAND_COMPLETE]: HandCompleteEvent;
    [GameEngineEventType.GAME_ERROR]: GameErrorEvent;
    [GameEngineEventType.PLAYER_TURN]: PlayerTurnEvent;
};
/**
 * Interface for game engine configuration
 */
export interface GameEngineConfig {
    variant: GameVariant;
    bettingStructure: BettingStructure;
    smallBlind: number;
    bigBlind: number;
    ante: number;
    minPlayers: number;
    maxPlayers: number;
    timeoutInSeconds: number;
}
/**
 * Default game engine configuration - Texas Hold'em No Limit
 */
export declare const DEFAULT_GAME_CONFIG: GameEngineConfig;
/**
 * Result of a player's action
 */
export interface ActionResult {
    success: boolean;
    message?: string;
    nextState?: GameState;
}
/**
 * Hand winner information
 */
export interface HandWinner {
    player: Player;
    handRank: string;
    handValue: number;
    bestHand: Card[];
    potAmount: number;
}
/**
 * Game Engine - Coordinates game flow and processes actions
 */
export declare class GameEngine {
    private table;
    private stateMachine;
    private config;
    private dealer;
    private handEvaluator;
    private potManager;
    private currentPlayerIndex;
    private dealerPosition;
    private eventListeners;
    private actionTimeoutId;
    private playerManager;
    /**
     * Creates a new game engine
     * @param config Game configuration
     * @param playerManager Optional player manager for centralized player tracking
     */
    constructor(config?: GameEngineConfig, playerManager?: PlayerManager);
    /**
     * Sets the player manager for this game engine
     * @param playerManager The player manager to use
     */
    setPlayerManager(playerManager: PlayerManager): void;
    /**
     * Gets the player manager if set
     * @returns The player manager, or null if not set
     */
    getPlayerManager(): PlayerManager | null;
    /**
     * Creates the appropriate hand evaluator based on the game variant
     */
    private createHandEvaluator;
    /**
     * Adds a player to the table
     * @param player The player to add
     * @returns True if the player was added successfully
     */
    addPlayer(player: Player): boolean;
    /**
     * Removes a player from the table
     * @param playerId The ID of the player to remove
     * @returns True if the player was removed successfully
     */
    removePlayer(playerId: string): boolean;
    /**
     * Starts a new game if possible
     * @returns True if the game was started successfully
     */
    startGame(): boolean;
    /**
     * Resets the table for a new hand
     */
    private resetTable;
    /**
     * Moves the dealer button to the next player
     */
    private moveDealerButton;
    /**
     * Sets the first player to act based on the current state
     */
    private setFirstPlayerToAct;
    /**
     * Posts blinds and antes for the current hand
     */
    private postBlindsAndAntes;
    /**
     * Collects bets from all players into the pot
     */
    private collectBets;
    /**
     * Handles a player's action
     * @param playerId The ID of the player taking the action
     * @param action The action to take
     * @returns The result of the action
     */
    handleAction(playerId: string, action: Action): ActionResult;
    /**
     * Gets a player by ID
     */
    private getPlayerById;
    /**
     * Advances the game to the next player or state
     * @returns The new game state if changed
     */
    private advanceGame;
    /**
     * Checks if the current betting round is complete
     */
    private isRoundComplete;
    /**
     * Advances to the next player in the current round
     */
    private moveToNextPlayer;
    /**
     * Gets players who are active in the current hand (not folded, not sitting out)
     */
    private getActivePlayersInHand;
    /**
     * Advances the game to the next state
     * @returns The new game state
     */
    private advanceToNextState;
    /**
     * Deals hole cards to all active players
     */
    private dealHoleCards;
    /**
     * Deals the flop (first 3 community cards)
     */
    private dealFlop;
    /**
     * Deals the turn (4th community card)
     */
    private dealTurn;
    /**
     * Deals the river (5th community card)
     */
    private dealRiver;
    /**
     * Resolves the hand, determines winners and awards pots
     */
    private resolveHand;
    /**
     * Handles state changes in the game state machine
     */
    private handleStateChange;
    /**
     * Notifies that it's a player's turn to act
     */
    private notifyPlayerTurn;
    /**
     * Sets a timeout for the current player's action
     */
    private setActionTimeout;
    /**
     * Clears the action timeout
     */
    private clearActionTimeout;
    /**
     * Gets the current game state
     */
    getGameState(): GameState;
    /**
     * Gets the table
     */
    getTable(): Table;
    /**
     * Gets the current pot manager
     */
    getPotManager(): PotManager;
    /**
     * Gets the game configuration
     */
    getConfig(): GameEngineConfig;
    /**
     * Adds an event listener
     * @param event The event to listen for
     * @param callback The callback function
     */
    on<T extends GameEngineEventType>(event: T, callback: (data: GameEngineEventPayloadMap[T]) => void): void;
    /**
     * Removes an event listener
     * @param event The event to remove the listener from
     * @param callback The callback function to remove
     */
    off<T extends GameEngineEventType>(event: T, callback: (data: GameEngineEventPayloadMap[T]) => void): void;
    /**
     * Emits an event
     * @param event The event to emit
     * @param data The event data
     */
    private emit;
    /**
     * Gets the current dealer position
     * @returns The current dealer position
     */
    getDealerPosition(): number;
    /**
     * Gets the current player index
     * @returns The current player index
     */
    getCurrentPlayerIndex(): number;
    /**
     * Checks if it's a specific player's turn
     * @param playerId The player ID to check
     * @returns True if it's the player's turn
     */
    isPlayersTurn(playerId: string): boolean;
}
export {};
