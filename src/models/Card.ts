import { Rank, Suit } from "../types";

export class Card {
  private readonly _suit: Suit;
  private readonly _rank: Rank;

  constructor(suit: Suit, rank: Rank) {
    this._suit = suit;
    this._rank = rank;
  }

  get suit(): Suit {
    return this._suit;
  }

  get rank(): Rank {
    return this._rank;
  }

  /**
   * Returns a string representation of the card (e.g., "A♠", "10♥")
   */
  toString(): string {
    const suitSymbols = {
      [Suit.HEARTS]: "♥",
      [Suit.DIAMONDS]: "♦",
      [Suit.CLUBS]: "♣",
      [Suit.SPADES]: "♠",
    };

    return `${this._rank}${suitSymbols[this._suit]}`;
  }

  /**
   * Returns a numeric value of the card for comparison purposes
   * Ace is high (14) by default
   */
  getValue(aceHigh: boolean = true): number {
    const rankValues: Record<Rank, number> = {
      [Rank.TWO]: 2,
      [Rank.THREE]: 3,
      [Rank.FOUR]: 4,
      [Rank.FIVE]: 5,
      [Rank.SIX]: 6,
      [Rank.SEVEN]: 7,
      [Rank.EIGHT]: 8,
      [Rank.NINE]: 9,
      [Rank.TEN]: 10,
      [Rank.JACK]: 11,
      [Rank.QUEEN]: 12,
      [Rank.KING]: 13,
      [Rank.ACE]: aceHigh ? 14 : 1,
    };

    return rankValues[this._rank];
  }

  /**
   * Compares two cards for equality
   */
  equals(card: Card): boolean {
    return this._suit === card.suit && this._rank === card.rank;
  }
}
