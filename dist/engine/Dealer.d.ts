import { Card } from "../models/Card";
import { Player } from "../models/Player";
import { Table } from "../models/Table";
/**
 * Dealer - Manages deck and card dealing logic
 *
 * The Dealer component abstracts all card dealing operations from the game engine,
 * providing a clean interface for handling the deck and dealing cards to players
 * and the community board.
 */
export declare class Dealer {
    private deck;
    private burnCards;
    constructor();
    /**
     * Reset the dealer's deck and burned cards
     */
    reset(): void;
    /**
     * Deal hole cards to players
     * @param players Array of players to deal cards to
     * @param cardsPerPlayer Number of hole cards per player (2 for Hold'em, 4 for Omaha)
     * @returns Map of player IDs to their dealt cards
     */
    dealHoleCards(players: Player[], cardsPerPlayer?: number): Map<string, Card[]>;
    /**
     * Burn a card before dealing community cards (standard poker procedure)
     * @returns The burned card
     */
    burnCard(): Card | undefined;
    /**
     * Deal the flop (first 3 community cards)
     * @param table The table to deal community cards to
     * @returns The 3 flop cards
     */
    dealFlop(table: Table): Card[];
    /**
     * Deal the turn (4th community card)
     * @param table The table to deal the turn card to
     * @returns The turn card
     */
    dealTurn(table: Table): Card | undefined;
    /**
     * Deal the river (5th community card)
     * @param table The table to deal the river card to
     * @returns The river card
     */
    dealRiver(table: Table): Card | undefined;
    /**
     * Deal specific community cards for testing purposes
     * @param table The table to deal cards to
     * @param cards The specific cards to deal
     */
    dealSpecificCommunityCards(table: Table, cards: Card[]): void;
    /**
     * Get the number of cards remaining in the deck
     */
    getRemainingCardCount(): number;
    /**
     * Get all burned cards (for testing/debugging)
     */
    getBurnedCards(): Card[];
    /**
     * Deal a specific number of cards from the deck
     * @param count Number of cards to deal
     * @returns Array of dealt cards
     */
    dealCards(count: number): Card[];
}
