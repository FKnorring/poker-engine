"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const types_1 = require("../types");
class Card {
    constructor(suit, rank) {
        this._suit = suit;
        this._rank = rank;
    }
    get suit() {
        return this._suit;
    }
    get rank() {
        return this._rank;
    }
    /**
     * Returns a string representation of the card (e.g., "A♠", "10♥")
     */
    toString() {
        const suitSymbols = {
            [types_1.Suit.HEARTS]: "♥",
            [types_1.Suit.DIAMONDS]: "♦",
            [types_1.Suit.CLUBS]: "♣",
            [types_1.Suit.SPADES]: "♠",
        };
        return `${this._rank}${suitSymbols[this._suit]}`;
    }
    /**
     * Returns a numeric value of the card for comparison purposes
     * Ace is high (14) by default
     */
    getValue(aceHigh = true) {
        const rankValues = {
            [types_1.Rank.TWO]: 2,
            [types_1.Rank.THREE]: 3,
            [types_1.Rank.FOUR]: 4,
            [types_1.Rank.FIVE]: 5,
            [types_1.Rank.SIX]: 6,
            [types_1.Rank.SEVEN]: 7,
            [types_1.Rank.EIGHT]: 8,
            [types_1.Rank.NINE]: 9,
            [types_1.Rank.TEN]: 10,
            [types_1.Rank.JACK]: 11,
            [types_1.Rank.QUEEN]: 12,
            [types_1.Rank.KING]: 13,
            [types_1.Rank.ACE]: aceHigh ? 14 : 1,
        };
        return rankValues[this._rank];
    }
    /**
     * Compares two cards for equality
     */
    equals(card) {
        return this._suit === card.suit && this._rank === card.rank;
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map