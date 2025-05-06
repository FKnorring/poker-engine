import { HandRank } from "../types";
import { Card } from "./Card";

export class Hand {
  private _cards: Card[];
  private _rank: HandRank | null = null;
  private _rankValue: number = 0;
  private _description: string = "";

  constructor(cards: Card[] = []) {
    this._cards = [...cards];
  }

  /**
   * Adds a card to the hand
   */
  addCard(card: Card): void {
    this._cards.push(card);
    // Reset evaluated properties since the hand changed
    this._rank = null;
    this._rankValue = 0;
    this._description = "";
  }

  /**
   * Adds multiple cards to the hand
   */
  addCards(cards: Card[]): void {
    this._cards.push(...cards);
    // Reset evaluated properties since the hand changed
    this._rank = null;
    this._rankValue = 0;
    this._description = "";
  }

  /**
   * Returns all cards in the hand
   */
  get cards(): Card[] {
    return [...this._cards];
  }

  /**
   * Returns the number of cards in the hand
   */
  get size(): number {
    return this._cards.length;
  }

  /**
   * Clears all cards from the hand
   */
  clear(): void {
    this._cards = [];
    this._rank = null;
    this._rankValue = 0;
    this._description = "";
  }

  /**
   * Returns the hand rank (will be calculated by the hand evaluator)
   */
  get rank(): HandRank | null {
    return this._rank;
  }

  /**
   * Sets the hand rank (to be used by the hand evaluator)
   */
  set rank(rank: HandRank | null) {
    this._rank = rank;
  }

  /**
   * Returns the numerical value of the hand (for comparison)
   */
  get rankValue(): number {
    return this._rankValue;
  }

  /**
   * Sets the numerical value of the hand (to be used by the hand evaluator)
   */
  set rankValue(value: number) {
    this._rankValue = value;
  }

  /**
   * Returns a description of the hand (e.g., "Pair of Aces")
   */
  get description(): string {
    return this._description;
  }

  /**
   * Sets the description of the hand (to be used by the hand evaluator)
   */
  set description(description: string) {
    this._description = description;
  }

  /**
   * Returns a string representation of the hand
   */
  toString(): string {
    return this._cards.map((card) => card.toString()).join(" ");
  }
}
