import { Rank, Suit } from "../types";
export declare class Card {
    private readonly _suit;
    private readonly _rank;
    constructor(suit: Suit, rank: Rank);
    get suit(): Suit;
    get rank(): Rank;
    /**
     * Returns a string representation of the card (e.g., "A♠", "10♥")
     */
    toString(): string;
    /**
     * Returns a numeric value of the card for comparison purposes
     * Ace is high (14) by default
     */
    getValue(aceHigh?: boolean): number;
    /**
     * Compares two cards for equality
     */
    equals(card: Card): boolean;
}
