"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dealer = void 0;
const Deck_1 = require("../models/Deck");
/**
 * Dealer - Manages deck and card dealing logic
 *
 * The Dealer component abstracts all card dealing operations from the game engine,
 * providing a clean interface for handling the deck and dealing cards to players
 * and the community board.
 */
class Dealer {
    constructor() {
        this.burnCards = [];
        this.deck = new Deck_1.Deck();
        this.reset();
    }
    /**
     * Reset the dealer's deck and burned cards
     */
    reset() {
        this.deck = new Deck_1.Deck();
        this.deck.shuffle();
        this.burnCards = [];
    }
    /**
     * Deal hole cards to players
     * @param players Array of players to deal cards to
     * @param cardsPerPlayer Number of hole cards per player (2 for Hold'em, 4 for Omaha)
     * @returns Map of player IDs to their dealt cards
     */
    dealHoleCards(players, cardsPerPlayer = 2) {
        const dealtCards = new Map();
        // Clear any existing cards from players' hands
        players.forEach((player) => {
            if (player) {
                player.hand.clear();
            }
        });
        // Deal cards in a round-robin fashion (as in real poker)
        for (let round = 0; round < cardsPerPlayer; round++) {
            for (const player of players) {
                if (player && player.isActive()) {
                    const card = this.deck.draw();
                    if (card) {
                        player.hand.addCard(card);
                        // Track dealt cards
                        if (!dealtCards.has(player.id)) {
                            dealtCards.set(player.id, []);
                        }
                        const playerCards = dealtCards.get(player.id);
                        if (playerCards) {
                            playerCards.push(card);
                        }
                    }
                }
            }
        }
        return dealtCards;
    }
    /**
     * Burn a card before dealing community cards (standard poker procedure)
     * @returns The burned card
     */
    burnCard() {
        const burnCard = this.deck.draw();
        if (burnCard) {
            this.burnCards.push(burnCard);
        }
        return burnCard;
    }
    /**
     * Deal the flop (first 3 community cards)
     * @param table The table to deal community cards to
     * @returns The 3 flop cards
     */
    dealFlop(table) {
        // Burn a card first
        this.burnCard();
        // Deal 3 cards for the flop
        const flopCards = this.deck.drawMultiple(3);
        table.addCommunityCards(flopCards);
        return flopCards;
    }
    /**
     * Deal the turn (4th community card)
     * @param table The table to deal the turn card to
     * @returns The turn card
     */
    dealTurn(table) {
        // Burn a card first
        this.burnCard();
        // Deal the turn card
        const turnCard = this.deck.draw();
        if (turnCard) {
            table.addCommunityCards([turnCard]);
        }
        return turnCard;
    }
    /**
     * Deal the river (5th community card)
     * @param table The table to deal the river card to
     * @returns The river card
     */
    dealRiver(table) {
        // Burn a card first
        this.burnCard();
        // Deal the river card
        const riverCard = this.deck.draw();
        if (riverCard) {
            table.addCommunityCards([riverCard]);
        }
        return riverCard;
    }
    /**
     * Deal specific community cards for testing purposes
     * @param table The table to deal cards to
     * @param cards The specific cards to deal
     */
    dealSpecificCommunityCards(table, cards) {
        table.addCommunityCards(cards);
    }
    /**
     * Get the number of cards remaining in the deck
     */
    getRemainingCardCount() {
        return this.deck.remainingCards;
    }
    /**
     * Get all burned cards (for testing/debugging)
     */
    getBurnedCards() {
        return [...this.burnCards];
    }
    /**
     * Deal a specific number of cards from the deck
     * @param count Number of cards to deal
     * @returns Array of dealt cards
     */
    dealCards(count) {
        return this.deck.drawMultiple(count);
    }
}
exports.Dealer = Dealer;
//# sourceMappingURL=Dealer.js.map