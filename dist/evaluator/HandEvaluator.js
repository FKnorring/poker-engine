"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandEvaluator = void 0;
/**
 * Abstract base class for hand evaluators
 */
class HandEvaluator {
    constructor(options = {}) {
        this.options = {
            evaluateLow: false,
            lowHandQualifier: 8,
            acesLow: false,
            ...options,
        };
    }
    /**
     * Default comparison logic - can be overridden by specific variants
     */
    compareHands(hand1, hand2) {
        // First compare by hand rank value (higher is better)
        if (hand1.rankValue !== hand2.rankValue) {
            return hand1.rankValue - hand2.rankValue;
        }
        // If rank values are the same, compare tiebreakers
        const minLength = Math.min(hand1.tiebreakers.length, hand2.tiebreakers.length);
        for (let i = 0; i < minLength; i++) {
            if (hand1.tiebreakers[i] !== hand2.tiebreakers[i]) {
                return hand1.tiebreakers[i] - hand2.tiebreakers[i];
            }
        }
        // If everything is equal, it's a tie
        return 0;
    }
    /**
     * Evaluates low hands for hi-lo games
     * Default implementation that can be overridden
     */
    evaluateLowHand(cards) {
        // Default implementation that will be overridden by specific variants
        return {
            valid: false,
            rankValue: 0,
            description: "Not a valid low hand",
            bestCards: [],
            tiebreakers: [],
        };
    }
    /**
     * Default hi-lo evaluation that can be overridden
     */
    evaluateHiLo(hand, communityCards) {
        const highHand = this.evaluate(hand, communityCards);
        let lowHand = null;
        if (this.options.evaluateLow) {
            lowHand = this.evaluateLowHand([...hand.cards, ...communityCards]);
        }
        return { highHand, lowHand };
    }
}
exports.HandEvaluator = HandEvaluator;
//# sourceMappingURL=HandEvaluator.js.map