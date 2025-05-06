import { Card } from "./Card";
export declare class Deck {
    private _cards;
    constructor();
    /**
     * Creates a standard 52-card deck
     */
    private initializeDeck;
    /**
     * Shuffles the deck using the Fisher-Yates algorithm
     */
    shuffle(): void;
    /**
     * Draws the top card from the deck
     * @returns The top card, or undefined if the deck is empty
     */
    draw(): Card | undefined;
    /**
     * Draws multiple cards from the deck
     * @param count Number of cards to draw
     * @returns Array of drawn cards
     */
    drawMultiple(count: number): Card[];
    /**
     * Returns the number of cards remaining in the deck
     */
    get remainingCards(): number;
    /**
     * Resets the deck to its initial state (all 52 cards in standard order)
     */
    reset(): void;
    /**
     * Returns the current cards in the deck (for debugging)
     */
    get cards(): Card[];
}
