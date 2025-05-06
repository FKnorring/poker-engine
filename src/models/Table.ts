import { Dealer } from "../engine/Dealer";
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
  buttonPosition: number;
  activePlayerIndex: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  minRaise: number;
}

export class Table {
  private readonly id: string;
  private readonly name: string;
  private readonly maxPlayers: number;
  private readonly smallBlind: number;
  private readonly bigBlind: number;
  private players: (Player | null)[];
  private communityCards: Card[];
  private potManager: PotManager;
  private buttonPosition: number;
  private activePlayerIndex: number;
  private currentBet: number;
  private minRaise: number;
  private handNumber: number;

  constructor(options: TableOptions) {
    this.id = options.id;
    this.name = options.name;
    this.maxPlayers = options.maxPlayers;
    this.smallBlind = options.smallBlind;
    this.bigBlind = options.bigBlind;

    // Initialize empty seats
    this.players = Array(this.maxPlayers).fill(null);

    this.communityCards = [];
    this.potManager = new PotManager();
    this.buttonPosition = 0;
    this.activePlayerIndex = -1;
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.handNumber = 0;
  }

  get activePlayers(): Player[] {
    const active = this.players.filter(
      (player): player is Player =>
        player !== null && (player.isActive() || player.isAllIn())
    );
    return active;
  }

  get activePlayer(): Player | null {
    if (
      this.activePlayerIndex < 0 ||
      this.activePlayerIndex >= this.players.length
    ) {
      return null;
    }
    return this.players[this.activePlayerIndex];
  }

  get canCheck(): boolean {
    return this.currentBet === this.activePlayer?.currentBet;
  }

  get call(): boolean {
    if (!this.activePlayer) {
      return false;
    }

    return (
      this.activePlayer.placeBet(
        this.currentBet - this.activePlayer?.currentBet
      ) > 0
    );
  }

  /**
   * Adds a community card to the table
   */
  addCommunityCard(card: Card): void {
    this.communityCards.push(card);
  }

  /**
   * Adds multiple community cards to the table
   */
  addCommunityCards(cards: Card[]): void {
    this.communityCards.push(...cards);
  }

  /**
   * Clears all community cards from the table
   */
  clearCommunityCards(): void {
    this.communityCards = [];
  }

  /**
   * Tries to seat a player at the table
   * @returns true if player was seated, false if table is full
   */
  seatPlayer(player: Player): { success: boolean; error?: string } {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, error: "Table is full" };
    }

    const seatIndex = this.players.findIndex((p) => p === null);

    if (seatIndex < 0) {
      return { success: false, error: "No available seats" };
    }

    // Add the player to the seat
    this.players[seatIndex] = player;

    return { success: true };
  }

  /**
   * Removes a player from the table
   */
  removePlayer(playerId: string): { success: boolean; error?: string } {
    const playerIndex = this.players.findIndex(
      (player) => player !== null && player.id === playerId
    );

    if (playerIndex === -1) {
      return { success: false, error: "Player not found" };
    }

    this.players[playerIndex] = null;
    return { success: true };
  }

  /**
   * Moves the button to the next active player
   */
  moveButton(): void {
    const activeSeatIndices = this._getActiveSeatIndices();

    if (activeSeatIndices.length <= 1) {
      return; // Can't move button with 0 or 1 players
    }

    let nextPos = (this.buttonPosition + 1) % this.maxPlayers;

    // Find the next seat with an active player
    while (!activeSeatIndices.includes(nextPos)) {
      nextPos = (nextPos + 1) % this.maxPlayers;
    }

    this.buttonPosition = nextPos;
  }

  /**
   * Increments the hand number
   */
  startNewHand(): void {
    this.handNumber++;
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    this.clearCommunityCards();
    this.potManager.clear();

    this.players.forEach((player) => {
      if (player) {
        player.hand.clear();
        player.currentBet = 0;
        if (player.status === PlayerStatus.SITTING_OUT && player.stack > 0) {
          player.status = PlayerStatus.ACTIVE;
        }
      }
    });

    this.moveButton();
  }

  setFirstPlayerToAct({ preflop = false }: { preflop?: boolean } = {}): void {
    const activePlayers = this.activePlayers;

    this.activePlayerIndex =
      (this.buttonPosition + (preflop ? 3 : 1)) % activePlayers.length;
  }

  /**
   * Returns a snapshot of the current table state
   */
  getSnapshot(): TableSnapshot {
    const activePlayers = this.activePlayers;

    return {
      id: this.id,
      name: this.name,
      players: activePlayers,
      communityCards: this.communityCards,
      potAmount: this.potManager.totalPotAmount,
      buttonPosition: this.buttonPosition,
      activePlayerIndex: this.activePlayerIndex,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      currentBet: this.currentBet,
      minRaise: this.minRaise,
    };
  }

  getSmallBlind(): Player | null {
    return this.activePlayers[
      (this.buttonPosition + 1) % this.activePlayers.length
    ];
  }

  getBigBlind(): Player | null {
    return this.activePlayers[
      (this.buttonPosition + 2) % this.activePlayers.length
    ];
  }

  postAnte(ante: number): void {
    this.activePlayers.forEach((player) => {
      player.placeBet(ante);
    });
  }

  /**
   * Helper method to get indices of seats with active players
   */
  private _getActiveSeatIndices(): number[] {
    return this.players
      .map((player, index) => ({ player, index }))
      .filter((item) => item.player !== null)
      .map((item) => item.index);
  }

  public reset(): void {
    this.clearCommunityCards();

    this.players.forEach((player) => {
      if (player) {
        player.hand.clear();
        player.currentBet = 0;
        if (player.status === PlayerStatus.SITTING_OUT && player.stack > 0) {
          player.status = PlayerStatus.ACTIVE;
        }
      }
    });

    this.potManager.clear();

    this.moveButton();
  }

  public addBet(playerId: string, amount: number): void {
    this.potManager.addBet(playerId, amount);
  }

  public collectBets(): void {
    this.potManager.collectBets();
  }

  public clearPot(): void {
    this.potManager.clear();
  }

  /**
   * Direct method to force add a player to a seat (for debugging)
   */
  forceAddPlayer(player: Player, seatIndex: number): boolean {
    if (seatIndex < 0 || seatIndex >= this.maxPlayers) {
      return false;
    }

    // Set player directly in the players array
    this.players[seatIndex] = player;

    // Verify
    return this.players[seatIndex] === player;
  }
}
