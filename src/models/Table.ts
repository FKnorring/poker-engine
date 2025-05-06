import {
  BettingStructure,
  GameState,
  GameVariant,
  PlayerStatus,
} from "../types";
import { Card } from "./Card";
import { Player } from "./Player";
import { PotManager } from "./Pot";

export interface TableOptions {
  id: string;
  name: string;
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameVariant: GameVariant;
  bettingStructure: BettingStructure;
}

export interface TableSnapshot {
  id: string;
  name: string;
  players: Player[];
  communityCards: Card[];
  potAmount: number;
  currentState: GameState;
  buttonPosition: number;
  activePlayerIndex: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  minRaise: number;
}

export class Table {
  private readonly _id: string;
  private readonly _name: string;
  private readonly _maxPlayers: number;
  private readonly _smallBlind: number;
  private readonly _bigBlind: number;
  private readonly _minBuyIn: number;
  private readonly _maxBuyIn: number;
  private readonly _gameVariant: GameVariant;
  private readonly _bettingStructure: BettingStructure;
  private _players: (Player | null)[];
  private _communityCards: Card[];
  private _potManager: PotManager;
  private _state: GameState;
  private _buttonPosition: number;
  private _activePlayerIndex: number;
  private _currentBet: number;
  private _minRaise: number;
  private _handNumber: number;

  constructor(options: TableOptions) {
    this._id = options.id;
    this._name = options.name;
    this._maxPlayers = options.maxPlayers;
    this._smallBlind = options.smallBlind;
    this._bigBlind = options.bigBlind;
    this._minBuyIn = options.minBuyIn;
    this._maxBuyIn = options.maxBuyIn;
    this._gameVariant = options.gameVariant;
    this._bettingStructure = options.bettingStructure;

    // Initialize empty seats
    this._players = Array(this._maxPlayers).fill(null);

    this._communityCards = [];
    this._potManager = new PotManager();
    this._state = GameState.WAITING;
    this._buttonPosition = 0;
    this._activePlayerIndex = -1;
    this._currentBet = 0;
    this._minRaise = this._bigBlind;
    this._handNumber = 0;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get maxPlayers(): number {
    return this._maxPlayers;
  }

  get smallBlind(): number {
    return this._smallBlind;
  }

  get bigBlind(): number {
    return this._bigBlind;
  }

  get minBuyIn(): number {
    return this._minBuyIn;
  }

  get maxBuyIn(): number {
    return this._maxBuyIn;
  }

  get gameVariant(): GameVariant {
    return this._gameVariant;
  }

  get bettingStructure(): BettingStructure {
    return this._bettingStructure;
  }

  get players(): (Player | null)[] {
    return [...this._players];
  }

  get activePlayers(): Player[] {
    const active = this._players.filter(
      (player): player is Player =>
        player !== null && (player.isActive() || player.isAllIn())
    );
    return active;
  }

  get communityCards(): Card[] {
    return [...this._communityCards];
  }

  get potManager(): PotManager {
    return this._potManager;
  }

  get totalPot(): number {
    return this._potManager.totalPotAmount;
  }

  get state(): GameState {
    return this._state;
  }

  set state(state: GameState) {
    this._state = state;
  }

  get buttonPosition(): number {
    return this._buttonPosition;
  }

  get activePlayerIndex(): number {
    return this._activePlayerIndex;
  }

  set activePlayerIndex(index: number) {
    this._activePlayerIndex = index;
  }

  get activePlayer(): Player | null {
    if (
      this._activePlayerIndex < 0 ||
      this._activePlayerIndex >= this._players.length
    ) {
      return null;
    }
    return this._players[this._activePlayerIndex];
  }

  get currentBet(): number {
    return this._currentBet;
  }

  set currentBet(amount: number) {
    this._currentBet = amount;
  }

  get minRaise(): number {
    return this._minRaise;
  }

  set minRaise(amount: number) {
    this._minRaise = amount;
  }

  get handNumber(): number {
    return this._handNumber;
  }

  /**
   * Adds a community card to the table
   */
  addCommunityCard(card: Card): void {
    this._communityCards.push(card);
  }

  /**
   * Adds multiple community cards to the table
   */
  addCommunityCards(cards: Card[]): void {
    this._communityCards.push(...cards);
  }

  /**
   * Clears all community cards from the table
   */
  clearCommunityCards(): void {
    this._communityCards = [];
  }

  /**
   * Tries to seat a player at the table
   * @returns true if player was seated, false if table is full
   */
  seatPlayer(player: Player, seatIndex: number): boolean {
    if (seatIndex < 0 || seatIndex >= this._maxPlayers) {
      return false;
    }

    if (this._players[seatIndex] !== null) {
      return false;
    }
    // Add the player to the seat
    this._players[seatIndex] = player;

    return true;
  }

  /**
   * Removes a player from the table
   */
  removePlayer(playerId: string): boolean {
    const playerIndex = this._players.findIndex(
      (player) => player !== null && player.id === playerId
    );

    if (playerIndex === -1) {
      return false;
    }

    this._players[playerIndex] = null;
    return true;
  }

  /**
   * Moves the button to the next active player
   */
  moveButton(): void {
    const activeSeatIndices = this._getActiveSeatIndices();

    if (activeSeatIndices.length <= 1) {
      return; // Can't move button with 0 or 1 players
    }

    let nextPos = (this._buttonPosition + 1) % this._maxPlayers;

    // Find the next seat with an active player
    while (!activeSeatIndices.includes(nextPos)) {
      nextPos = (nextPos + 1) % this._maxPlayers;
    }

    this._buttonPosition = nextPos;
  }

  /**
   * Increments the hand number
   */
  startNewHand(): void {
    this._handNumber++;
    this._currentBet = 0;
    this._minRaise = this._bigBlind;
    this.clearCommunityCards();
    this._potManager.clear();
  }

  /**
   * Returns a snapshot of the current table state
   */
  getSnapshot(): TableSnapshot {
    const activePlayers = this.activePlayers;

    return {
      id: this._id,
      name: this._name,
      players: activePlayers,
      communityCards: this.communityCards,
      potAmount: this.totalPot,
      currentState: this._state,
      buttonPosition: this._buttonPosition,
      activePlayerIndex: this._activePlayerIndex,
      smallBlind: this._smallBlind,
      bigBlind: this._bigBlind,
      currentBet: this._currentBet,
      minRaise: this._minRaise,
    };
  }

  /**
   * Helper method to get indices of seats with active players
   */
  private _getActiveSeatIndices(): number[] {
    return this._players
      .map((player, index) => ({ player, index }))
      .filter((item) => item.player !== null)
      .map((item) => item.index);
  }

  public reset(): void {
    this.clearCommunityCards();

    this._players.forEach((player) => {
      if (player) {
        player.hand.clear();
        player.currentBet = 0;
        if (player.status === PlayerStatus.SITTING_OUT && player.stack > 0) {
          player.status = PlayerStatus.ACTIVE;
        }
      }
    });

    this.clearPot();
  }

  public addBet(playerId: string, amount: number): void {
    this._potManager.addBet(playerId, amount);
  }

  public collectBets(): void {
    this._potManager.collectBets();
  }

  public clearPot(): void {
    this._potManager.clear();
  }

  /**
   * Direct method to force add a player to a seat (for debugging)
   */
  forceAddPlayer(player: Player, seatIndex: number): boolean {
    if (seatIndex < 0 || seatIndex >= this.maxPlayers) {
      return false;
    }

    // Set player directly in the players array
    this._players[seatIndex] = player;

    // Verify
    return this._players[seatIndex] === player;
  }
}
