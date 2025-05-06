import { HandRank } from "../types";
import { Card } from "./Card";
export declare class Hand {
    private _cards;
    private _rank;
    private _rankValue;
    private _description;
    constructor(cards?: Card[]);
    /**
     * Adds a card to the hand
     */
    addCard(card: Card): void;
    /**
     * Adds multiple cards to the hand
     */
    addCards(cards: Card[]): void;
    /**
     * Returns all cards in the hand
     */
    get cards(): Card[];
    /**
     * Returns the number of cards in the hand
     */
    get size(): number;
    /**
     * Clears all cards from the hand
     */
    clear(): void;
    /**
     * Returns the hand rank (will be calculated by the hand evaluator)
     */
    get rank(): HandRank | null;
    /**
     * Sets the hand rank (to be used by the hand evaluator)
     */
    set rank(rank: HandRank | null);
    /**
     * Returns the numerical value of the hand (for comparison)
     */
    get rankValue(): number;
    /**
     * Sets the numerical value of the hand (to be used by the hand evaluator)
     */
    set rankValue(value: number);
    /**
     * Returns a description of the hand (e.g., "Pair of Aces")
     */
    get description(): string;
    /**
     * Sets the description of the hand (to be used by the hand evaluator)
     */
    set description(description: string);
    /**
     * Returns a string representation of the hand
     */
    toString(): string;
}
