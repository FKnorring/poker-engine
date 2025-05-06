import { Rank, Suit } from "../types";
import { Card } from "./Card";

export class Deck {
  private _cards: Card[];

  constructor() {
    this._cards = [];
    this.initializeDeck();
  }

  /**
   * Creates a standard 52-card deck
   */
  private initializeDeck(): void {
    this._cards = [];

    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);

    for (const suit of suits) {
      for (const rank of ranks) {
        this._cards.push(new Card(suit, rank));
      }
    }
  }

  /**
   * Shuffles the deck using the Fisher-Yates algorithm
   */
  shuffle(): void {
    for (let i = this._cards.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1));
      // Swap elements at indices i and j
      [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
    }
  }

  /**
   * Draws the top card from the deck
   * @returns The top card, or undefined if the deck is empty
   */
  draw(): Card | undefined {
    return this._cards.pop();
  }

  /**
   * Draws multiple cards from the deck
   * @param count Number of cards to draw
   * @returns Array of drawn cards
   */
  drawMultiple(count: number): Card[] {
    const cards: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.draw();
      if (card) {
        cards.push(card);
      } else {
        break; // Deck is empty
      }
    }
    return cards;
  }

  /**
   * Returns the number of cards remaining in the deck
   */
  get remainingCards(): number {
    return this._cards.length;
  }

  /**
   * Resets the deck to its initial state (all 52 cards in standard order)
   */
  reset(): void {
    this.initializeDeck();
  }

  /**
   * Returns the current cards in the deck (for debugging)
   */
  get cards(): Card[] {
    return [...this._cards];
  }
}
