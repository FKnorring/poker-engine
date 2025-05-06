import { PlayerPosition, PlayerStatus } from "../types";
import { Card } from "./Card";
import { Hand } from "./Hand";

export interface PlayerActionHistory {
  street: string;
  action: string;
  amount: number;
  timestamp: Date;
}

export class Player {
  private _id: string;
  private _name: string;
  private _stack: number;
  private _hand: Hand;
  private _position: PlayerPosition | null;
  private _status: PlayerStatus;
  private _currentBet: number;
  private _actionHistory: PlayerActionHistory[];
  private _seatIndex: number;

  constructor(id: string, name: string, stack: number, seatIndex: number) {
    this._id = id;
    this._name = name;
    this._stack = stack;
    this._hand = new Hand();
    this._position = null;
    this._status = PlayerStatus.SITTING_OUT;
    this._currentBet = 0;
    this._actionHistory = [];
    this._seatIndex = seatIndex;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get stack(): number {
    return this._stack;
  }

  set stack(value: number) {
    // Don't allow negative stack
    this._stack = Math.max(0, value);
  }

  get hand(): Hand {
    return this._hand;
  }

  get holeCards(): Card[] {
    return this._hand.cards;
  }

  /**
   * Deals cards to the player's hand
   */
  dealCards(cards: Card[]): void {
    this._hand.addCards(cards);
  }

  /**
   * Clears the player's hand (end of round)
   */
  clearHand(): void {
    this._hand.clear();
  }

  get position(): PlayerPosition | null {
    return this._position;
  }

  set position(position: PlayerPosition | null) {
    this._position = position;
  }

  get status(): PlayerStatus {
    return this._status;
  }

  set status(status: PlayerStatus) {
    this._status = status;
  }

  get currentBet(): number {
    return this._currentBet;
  }

  set currentBet(amount: number) {
    this._currentBet = amount;
  }

  get actionHistory(): PlayerActionHistory[] {
    return [...this._actionHistory];
  }

  get seatIndex(): number {
    return this._seatIndex;
  }

  /**
   * Adds to the player's action history
   */
  addAction(street: string, action: string, amount: number): void {
    this._actionHistory.push({
      street,
      action,
      amount,
      timestamp: new Date(),
    });
  }

  /**
   * Clears action history (end of hand)
   */
  clearActionHistory(): void {
    this._actionHistory = [];
  }

  /**
   * Places a bet (reduces stack by amount)
   * @returns The actual amount bet (in case player doesn't have enough)
   */
  placeBet(amount: number): number {
    const actualBet = Math.min(amount, this._stack);
    this._stack -= actualBet;
    this._currentBet += actualBet;
    return actualBet;
  }

  /**
   * Adds winnings to player's stack
   */
  addWinnings(amount: number): void {
    this._stack += amount;
  }

  /**
   * Resets the player's bet amount (end of street)
   */
  resetBet(): void {
    this._currentBet = 0;
  }

  /**
   * Checks if the player is active in the current hand
   */
  isActive(): boolean {
    return this._status === PlayerStatus.ACTIVE;
  }

  /**
   * Checks if the player is all-in
   */
  isAllIn(): boolean {
    return this._status === PlayerStatus.ALL_IN;
  }

  /**
   * Checks if the player has folded
   */
  hasFolded(): boolean {
    return this._status === PlayerStatus.FOLDED;
  }

  /**
   * Checks if the player is sitting out
   */
  isSittingOut(): boolean {
    return this._status === PlayerStatus.SITTING_OUT;
  }

  /**
   * Checks if the player has any chips left
   */
  hasChips(): boolean {
    return this._stack > 0;
  }
}
