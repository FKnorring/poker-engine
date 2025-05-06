import { Table } from "../models/Table";
import { Player } from "../models/Player";
import { Deck } from "../models/Deck";
import { Card } from "../models/Card";
import { Action } from "../models/Action";
import { PotManager } from "../models/Pot";
import { GameStateMachine } from "./StateMachine";
import { PlayerManager } from "./PlayerManager";
import { Dealer } from "./Dealer";
import {
  GameState,
  PlayerStatus,
  BettingStructure,
  GameVariant,
  ActionType,
  GameEngineEventType,
  GameStartedEvent,
  PlayerActionEvent,
  StateChangedEvent,
  HandCompleteEvent,
  PlayerTurnEvent,
  GameErrorEvent,
  RoundCompleteEvent,
  GameEngineEventPayload,
} from "../types";
import { HandEvaluator } from "../evaluator/HandEvaluator";
import { GAME_VARIANTS } from "../rules/GameVariantConfig";
import { TexasHoldemEvaluator } from "../evaluator/TexasHoldemEvaluator";
import { OmahaEvaluator } from "../evaluator/OmahaEvaluator";

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
export const DEFAULT_GAME_CONFIG: GameEngineConfig = {
  variant: GameVariant.TEXAS_HOLDEM,
  bettingStructure: BettingStructure.NO_LIMIT,
  smallBlind: 5,
  bigBlind: 10,
  ante: 0,
  minPlayers: 2,
  maxPlayers: 10,
  timeoutInSeconds: 30,
};

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
export class GameEngine {
  private table: Table;
  private stateMachine: GameStateMachine;
  private config: GameEngineConfig;
  private handEvaluator: HandEvaluator;
  private eventListeners: Map<GameEngineEventType, ((data: any) => void)[]> =
    new Map();
  private actionTimeoutId: NodeJS.Timeout | null = null;
  private playerManager: PlayerManager | null = null;

  /**
   * Creates a new game engine
   * @param config Game configuration
   * @param playerManager Optional player manager for centralized player tracking
   */
  constructor(
    config: GameEngineConfig = DEFAULT_GAME_CONFIG,
    playerManager?: PlayerManager
  ) {
    this.config = { ...DEFAULT_GAME_CONFIG, ...config };

    // Create a new table with max players from config
    this.table = new Table({
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

    this.stateMachine = new GameStateMachine();
    this.dealer = new Dealer();
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
  public setPlayerManager(playerManager: PlayerManager): void {
    this.playerManager = playerManager;
    playerManager.registerTable(this.table);
  }

  /**
   * Gets the player manager if set
   * @returns The player manager, or null if not set
   */
  public getPlayerManager(): PlayerManager | null {
    return this.playerManager;
  }

  /**
   * Creates the appropriate hand evaluator based on the game variant
   */
  private createHandEvaluator(): HandEvaluator {
    // Create evaluator based on game variant
    switch (this.config.variant) {
      case GameVariant.OMAHA:
        return new OmahaEvaluator({
          evaluateLow: false,
          lowHandQualifier: 8,
          acesLow: true,
        });
      case GameVariant.TEXAS_HOLDEM:
      default:
        return new TexasHoldemEvaluator({
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
  public addPlayer(player: Player): boolean {
    if (this.table.players.filter(Boolean).length >= this.config.maxPlayers) {
      return false;
    }

    // Find an empty seat
    const emptySeatIndex = this.table.players.findIndex((p) => p === null);

    if (emptySeatIndex !== -1) {
      // Try to seat the player
      const added = this.table.seatPlayer(player, emptySeatIndex);

      // Verify player was actually added to the table
      const playerIndex = this.table.players.findIndex(
        (p) => p !== null && p.id === player.id
      );

      // Explicitly activate the player if needed
      if (added && player.status !== PlayerStatus.ACTIVE) {
        player.status = PlayerStatus.ACTIVE;
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
  public removePlayer(playerId: string): boolean {
    const playerIndex = this.table.players.findIndex(
      (p) => p !== null && p.id === playerId
    );

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
  public startGame(): boolean {
    const players = this.table.players.filter((p) => p !== null) as Player[];

    // Check if we can start the game
    if (players.length < this.config.minPlayers) {
      return false;
    }

    if (this.stateMachine.getCurrentState() !== GameState.WAITING) {
      return false;
    }

    // Reset the table and deck
    this.resetTable();

    // Move the dealer button
    this.moveDealerButton();

    // Transition to STARTING state
    this.stateMachine.transition(GameState.STARTING);

    // Deal the hole cards
    this.dealHoleCards();

    // Transition to PREFLOP
    this.stateMachine.transition(GameState.PREFLOP);

    // Post blinds and antes
    this.postBlindsAndAntes();

    // Emit game started event
    this.emit(GameEngineEventType.GAME_STARTED, {
      table: this.table,
      players: players,
      dealerPosition: this.getDealerPosition(),
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
  private resetTable(): void {
    // Reset the table
    this.table.reset();

    // Reset the dealer's deck
    this.dealer.reset();
  }

  /**
   * Sets the first player to act based on the current state
   */
  private setFirstPlayerToAct(): void {
    const activePlayers = this.table.activePlayers;
    const currentState = this.stateMachine.getCurrentState();

    if (activePlayers.length <= 1) {
      return;
    }

    switch (currentState) {
      case GameState.PREFLOP:
        // In preflop, first to act is after the big blind
        this.currentPlayerIndex =
          (this.dealerPosition + 3) % activePlayers.length;
        break;
      case GameState.FLOP:
      case GameState.TURN:
      case GameState.RIVER:
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
  private postBlindsAndAntes(): void {
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
  private collectBets(blinds: Boolean = false): void {
    this.table.players.forEach((player) => {
      if (player && player.currentBet > 0) {
        // Add each player's bet to the pot manager
        this.table.addBet(player.id, player.currentBet);
        if (!blinds) player.currentBet = 0;
      }
    });

    // After all bets are recorded, move them to pots
    if (!blinds) this.table.collectBets();
  }

  /**
   * Handles a player's action
   * @param playerId The ID of the player taking the action
   * @param action The action to take
   * @returns The result of the action
   */
  public handleAction(playerId: string, action: Action): ActionResult {
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
      case ActionType.FOLD:
        player.status = PlayerStatus.FOLDED;
        actionSuccess = true;
        break;

      case ActionType.CHECK:
        // Can only check if no one has bet or player has matched the current bet
        if (this.table.currentBet > player.currentBet) {
          return {
            success: false,
            message: "Cannot check, must call or raise",
          };
        }
        actionSuccess = true;
        break;

      case ActionType.CALL:
        // Call the current bet
        actionSuccess =
          player.placeBet(this.table.currentBet - player.currentBet) > 0;
        break;

      case ActionType.BET:
      case ActionType.RAISE:
        // Validate bet/raise amount
        const amount = action.amount;
        const minBet = Math.max(
          this.config.bigBlind,
          this.table.currentBet * 2
        );

        if (amount < minBet) {
          return { success: false, message: `Minimum bet/raise is ${minBet}` };
        }

        actionSuccess = player.placeBet(amount) > 0;
        if (actionSuccess) {
          this.table.currentBet = player.currentBet;
        }
        break;

      case ActionType.ALL_IN:
        // All-in with all remaining chips
        const allInAmount = player.stack;
        actionSuccess = player.placeBet(allInAmount) > 0;
        if (actionSuccess) {
          player.status = PlayerStatus.ALL_IN;
          this.table.currentBet = Math.max(
            this.table.currentBet,
            player.currentBet
          );
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
    this.emit(GameEngineEventType.PLAYER_ACTION, { player, action });

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
  private getPlayerById(playerId: string): Player | null {
    return (
      this.table.players.find((p) => p !== null && p.id === playerId) || null
    );
  }

  /**
   * Advances the game to the next player or state
   * @returns The new game state if changed
   */
  private advanceGame(): GameState | undefined {
    // Check if round is complete
    if (this.isRoundComplete()) {
      return this.advanceToNextState();
    } else {
      // Move to the next player
      this.moveToNextPlayer();
      return undefined;
    }
  }

  /**
   * Checks if the current betting round is complete
   */
  private isRoundComplete(): boolean {
    const activePlayers = this.table.activePlayers;

    // If only one player remains active, the round is complete
    if (activePlayers.length <= 1) {
      return true;
    }

    // Round is complete when all active players have either:
    // 1. Matched the current bet, or
    // 2. Gone all-in with less than the current bet
    const currentBet = this.table.currentBet;

    return activePlayers.every(
      (player) =>
        player.currentBet === currentBet ||
        (player.status === PlayerStatus.ALL_IN &&
          player.currentBet < currentBet)
    );
  }

  /**
   * Advances to the next player in the current round
   */
  private moveToNextPlayer(): void {
    const activePlayers = this.getActivePlayersInHand();

    console.log(activePlayers);

    if (activePlayers.length <= 1) {
      return;
    }

    // Find the next player who can act
    let nextPlayerIndex = (this.currentPlayerIndex + 1) % activePlayers.length;

    // Skip players who are all-in
    while (activePlayers[nextPlayerIndex].status === PlayerStatus.ALL_IN) {
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
  private getActivePlayersInHand(): Player[] {
    return this.table.players.filter(
      (p) =>
        p !== null &&
        p.status !== PlayerStatus.FOLDED &&
        p.status !== PlayerStatus.SITTING_OUT
    ) as Player[];
  }

  /**
   * Advances the game to the next state
   * @returns The new game state
   */
  private advanceToNextState(): GameState {
    const currentState = this.stateMachine.getCurrentState();
    let nextState: GameState;

    // Collect bets into the pot
    this.collectBets();

    // Determine next state based on current state and game conditions
    const activePlayers = this.getActivePlayersInHand();

    // If only one active player remains, go straight to showdown
    if (activePlayers.length <= 1) {
      nextState = GameState.SHOWDOWN;
    } else {
      // Otherwise, advance to the next state in sequence
      switch (currentState) {
        case GameState.STARTING:
          nextState = GameState.PREFLOP;
          this.dealHoleCards();
          break;
        case GameState.PREFLOP:
          nextState = GameState.FLOP;
          this.dealFlop();
          break;
        case GameState.FLOP:
          nextState = GameState.TURN;
          this.dealTurn();
          break;
        case GameState.TURN:
          nextState = GameState.RIVER;
          this.dealRiver();
          break;
        case GameState.RIVER:
          nextState = GameState.SHOWDOWN;
          break;
        case GameState.SHOWDOWN:
          nextState = GameState.FINISHED;
          this.resolveHand();
          break;
        case GameState.FINISHED:
          nextState = GameState.WAITING;
          break;
        default:
          nextState = GameState.WAITING;
      }
    }

    // Transition to the next state
    this.stateMachine.transition(nextState);
    return nextState;
  }

  /**
   * Deals hole cards to all active players
   */
  private dealHoleCards(): void {
    const activePlayers = this.table.activePlayers;

    if (activePlayers.length === 0) {
      return;
    }

    // Deal hole cards based on game variant
    if (this.config.variant === GameVariant.TEXAS_HOLDEM) {
      // Deal 2 cards to each player
      activePlayers.forEach((player) => {
        const cards = this.dealer.dealCards(2);
        player.hand.addCards(cards);
      });
    } else if (this.config.variant === GameVariant.OMAHA) {
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
  private dealFlop(): void {
    // Use the dealer to deal the flop
    const flopCards = this.dealer.dealFlop(this.table);

    // Emit event
    this.emit(GameEngineEventType.STATE_CHANGED, {
      oldState: GameState.PREFLOP,
      newState: GameState.FLOP,
      cards: flopCards,
    });
  }

  /**
   * Deals the turn (4th community card)
   */
  private dealTurn(): void {
    // Use the dealer to deal the turn
    const turnCard = this.dealer.dealTurn(this.table);

    // Emit event
    this.emit(GameEngineEventType.STATE_CHANGED, {
      oldState: GameState.FLOP,
      newState: GameState.TURN,
      cards: turnCard ? [turnCard] : [],
    });
  }

  /**
   * Deals the river (5th community card)
   */
  private dealRiver(): void {
    // Use the dealer to deal the river
    const riverCard = this.dealer.dealRiver(this.table);

    // Emit event
    this.emit(GameEngineEventType.STATE_CHANGED, {
      oldState: GameState.TURN,
      newState: GameState.RIVER,
      cards: riverCard ? [riverCard] : [],
    });
  }

  /**
   * Resolves the hand, determines winners and awards pots
   */
  private resolveHand(): HandWinner[] {
    const activePlayers = this.getActivePlayersInHand();
    const communityCards = this.table.communityCards;
    const winners: HandWinner[] = [];

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
      this.table.clearPot();

      // Update player stats in player manager if available
      if (this.playerManager) {
        this.playerManager.updatePlayerStats(
          winner.id,
          true,
          potAmount,
          potAmount
        );
      }

      this.emit(GameEngineEventType.HAND_COMPLETE, { winners });
      return winners;
    }

    // Calculate hand values for all players
    const playerHandResults = activePlayers.map((player) => {
      const handResult = this.handEvaluator.evaluate(
        player.hand,
        communityCards
      );

      return {
        player,
        handResult,
      };
    });

    // Manually determine the winner for now
    // In a full implementation, we would use the pot manager to handle side pots
    let bestResult = playerHandResults[0];

    for (let i = 1; i < playerHandResults.length; i++) {
      const comparisonResult = this.handEvaluator.compareHands(
        playerHandResults[i].handResult,
        bestResult.handResult
      );

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
      this.playerManager.updatePlayerStats(
        winningPlayer.id,
        true,
        potAmount,
        potAmount
      );

      // Update other players' stats
      activePlayers.forEach((player) => {
        if (player.id !== winningPlayer.id) {
          const lostAmount = -player.currentBet;
          this.playerManager?.updatePlayerStats(
            player.id,
            false,
            lostAmount,
            potAmount
          );
        }
      });
    }

    this.table.clearPot();

    this.emit(GameEngineEventType.HAND_COMPLETE, { winners });
    return winners;
  }

  /**
   * Handles state changes in the game state machine
   */
  private handleStateChange(oldState: GameState, newState: GameState): void {
    // Reset current bet on new betting rounds
    if (
      newState === GameState.PREFLOP ||
      newState === GameState.FLOP ||
      newState === GameState.TURN ||
      newState === GameState.RIVER
    ) {
      this.table.currentBet = 0;
      this.setFirstPlayerToAct();
    }

    // Emit state change event
    this.emit(GameEngineEventType.STATE_CHANGED, { oldState, newState });

    if (newState === GameState.FINISHED) {
      // Prepare for the next hand
      this.resetTable();
    }
  }

  /**
   * Notifies that it's a player's turn to act
   */
  private notifyPlayerTurn(): void {
    const activePlayers = this.getActivePlayersInHand();

    if (
      activePlayers.length <= 1 ||
      this.currentPlayerIndex >= activePlayers.length
    ) {
      return;
    }

    const currentPlayer = activePlayers[this.currentPlayerIndex];
    this.emit(GameEngineEventType.PLAYER_TURN, {
      playerId: currentPlayer.id,
      timeoutInSeconds: this.config.timeoutInSeconds,
    });
  }

  /**
   * Sets a timeout for the current player's action
   */
  private setActionTimeout(): void {
    // Clear any existing timeout
    this.clearActionTimeout();

    // Set a new timeout
    this.actionTimeoutId = setTimeout(() => {
      const activePlayers = this.getActivePlayersInHand();

      if (
        activePlayers.length <= 1 ||
        this.currentPlayerIndex >= activePlayers.length
      ) {
        return;
      }

      const currentPlayer = activePlayers[this.currentPlayerIndex];

      // Automatically fold if there's a bet to call
      if (this.table.currentBet > currentPlayer.currentBet) {
        const foldAction = new Action(currentPlayer, ActionType.FOLD);
        this.handleAction(currentPlayer.id, foldAction);
      } else {
        // Otherwise check
        const checkAction = new Action(currentPlayer, ActionType.CHECK);
        this.handleAction(currentPlayer.id, checkAction);
      }
    }, this.config.timeoutInSeconds * 1000);
  }

  /**
   * Clears the action timeout
   */
  private clearActionTimeout(): void {
    if (this.actionTimeoutId) {
      clearTimeout(this.actionTimeoutId);
      this.actionTimeoutId = null;
    }
  }

  /**
   * Gets the current game state
   */
  public getGameState(): GameState {
    return this.stateMachine.getCurrentState();
  }

  /**
   * Gets the table
   */
  public getTable(): Table {
    return this.table;
  }

  /**
   * Gets the game configuration
   */
  public getConfig(): GameEngineConfig {
    return { ...this.config };
  }

  /**
   * Adds an event listener
   * @param event The event to listen for
   * @param callback The callback function
   */
  public on<T extends GameEngineEventType>(
    event: T,
    callback: (data: GameEngineEventPayloadMap[T]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback as any);
  }

  /**
   * Removes an event listener
   * @param event The event to remove the listener from
   * @param callback The callback function to remove
   */
  public off<T extends GameEngineEventType>(
    event: T,
    callback: (data: GameEngineEventPayloadMap[T]) => void
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback as any);
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
  private emit<T extends GameEngineEventType>(
    event: T,
    data: GameEngineEventPayloadMap[T]
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          (callback as (data: GameEngineEventPayloadMap[T]) => void)(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Gets the current dealer position
   * @returns The current dealer position
   */
  public getDealerPosition(): number {
    return this.table.buttonPosition;
  }

  /**
   * Gets the current player index
   * @returns The current player index
   */
  public getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  /**
   * Checks if it's a specific player's turn
   * @param playerId The player ID to check
   * @returns True if it's the player's turn
   */
  public isPlayersTurn(playerId: string): boolean {
    const currentPlayer = this.table.players[this.currentPlayerIndex];
    return currentPlayer !== null && currentPlayer.id === playerId;
  }
}
