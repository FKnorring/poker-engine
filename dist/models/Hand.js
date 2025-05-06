"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hand = void 0;
class Hand {
    constructor(cards = []) {
        this._rank = null;
        this._rankValue = 0;
        this._description = "";
        this._cards = [...cards];
    }
    /**
     * Adds a card to the hand
     */
    addCard(card) {
        this._cards.push(card);
        // Reset evaluated properties since the hand changed
        this._rank = null;
        this._rankValue = 0;
        this._description = "";
    }
    /**
     * Adds multiple cards to the hand
     */
    addCards(cards) {
        this._cards.push(...cards);
        // Reset evaluated properties since the hand changed
        this._rank = null;
        this._rankValue = 0;
        this._description = "";
    }
    /**
     * Returns all cards in the hand
     */
    get cards() {
        return [...this._cards];
    }
    /**
     * Returns the number of cards in the hand
     */
    get size() {
        return this._cards.length;
    }
    /**
     * Clears all cards from the hand
     */
    clear() {
        this._cards = [];
        this._rank = null;
        this._rankValue = 0;
        this._description = "";
    }
    /**
     * Returns the hand rank (will be calculated by the hand evaluator)
     */
    get rank() {
        return this._rank;
    }
    /**
     * Sets the hand rank (to be used by the hand evaluator)
     */
    set rank(rank) {
        this._rank = rank;
    }
    /**
     * Returns the numerical value of the hand (for comparison)
     */
    get rankValue() {
        return this._rankValue;
    }
    /**
     * Sets the numerical value of the hand (to be used by the hand evaluator)
     */
    set rankValue(value) {
        this._rankValue = value;
    }
    /**
     * Returns a description of the hand (e.g., "Pair of Aces")
     */
    get description() {
        return this._description;
    }
    /**
     * Sets the description of the hand (to be used by the hand evaluator)
     */
    set description(description) {
        this._description = description;
    }
    /**
     * Returns a string representation of the hand
     */
    toString() {
        return this._cards.map((card) => card.toString()).join(" ");
    }
}
exports.Hand = Hand;
//# sourceMappingURL=Hand.js.map