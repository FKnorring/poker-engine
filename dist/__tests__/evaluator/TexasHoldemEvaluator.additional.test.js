"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TexasHoldemEvaluator_1 = require("../../evaluator/TexasHoldemEvaluator");
const Card_1 = require("../../models/Card");
const Hand_1 = require("../../models/Hand");
const types_1 = require("../../types");
describe("TexasHoldemEvaluator Additional Tests", () => {
    let evaluator;
    beforeEach(() => {
        // Create evaluator with default settings
        evaluator = new TexasHoldemEvaluator_1.TexasHoldemEvaluator();
    });
    // Helper to create cards
    const createCard = (suit, rank) => new Card_1.Card(suit, rank);
    test("should find the best hand from hole cards and community cards", () => {
        // Create a hand with two hole cards
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
        ]);
        // Create community cards for a royal flush
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.JACK),
            createCard(types_1.Suit.HEARTS, types_1.Rank.TEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.TWO),
            createCard(types_1.Suit.CLUBS, types_1.Rank.THREE),
        ];
        // Evaluate the hand
        const result = evaluator.evaluate(hand, communityCards);
        // Should identify a royal flush
        expect(result.rank).toBe(types_1.HandRank.ROYAL_FLUSH);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Royal Flush");
    });
    test("should evaluate a straight flush", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.CLUBS, types_1.Rank.NINE),
            createCard(types_1.Suit.CLUBS, types_1.Rank.EIGHT),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.SIX),
            createCard(types_1.Suit.CLUBS, types_1.Rank.FIVE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.STRAIGHT_FLUSH);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Straight Flush");
    });
    test("should evaluate four of a kind", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.ACE),
            createCard(types_1.Suit.SPADES, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.JACK),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.FOUR_OF_A_KIND);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Four of a Kind");
    });
    test("should evaluate a full house", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
            createCard(types_1.Suit.CLUBS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.JACK),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.FULL_HOUSE);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Full House");
    });
    test("should evaluate a flush", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
        ]);
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.TEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
            createCard(types_1.Suit.CLUBS, types_1.Rank.NINE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.EIGHT),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.FLUSH);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Flush");
    });
    test("should evaluate a straight", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.NINE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.EIGHT),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.SIX),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
            createCard(types_1.Suit.CLUBS, types_1.Rank.KING),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.STRAIGHT);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Straight");
    });
    test("should evaluate three of a kind", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.JACK),
            createCard(types_1.Suit.SPADES, types_1.Rank.TEN),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.THREE_OF_A_KIND);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Three of a Kind");
    });
    test("should evaluate two pair", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
            createCard(types_1.Suit.CLUBS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.JACK),
            createCard(types_1.Suit.HEARTS, types_1.Rank.TEN),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.TWO_PAIR);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Two Pair");
    });
    test("should evaluate one pair", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.JACK),
            createCard(types_1.Suit.SPADES, types_1.Rank.TEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.NINE),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.PAIR);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Pair");
    });
    test("should evaluate high card", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
        ]);
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.JACK),
            createCard(types_1.Suit.CLUBS, types_1.Rank.NINE),
            createCard(types_1.Suit.SPADES, types_1.Rank.SEVEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.HIGH_CARD);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("High Card");
    });
    test("should evaluate a wheel straight (A-5 low straight)", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.TWO),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.THREE),
            createCard(types_1.Suit.SPADES, types_1.Rank.FOUR),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
            createCard(types_1.Suit.CLUBS, types_1.Rank.QUEEN),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.STRAIGHT);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Straight");
    });
    test("should evaluate a wheel straight flush (A-5 low straight flush)", () => {
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.TWO),
        ]);
        const communityCards = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.THREE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FOUR),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
            createCard(types_1.Suit.CLUBS, types_1.Rank.QUEEN),
        ];
        const result = evaluator.evaluate(hand, communityCards);
        expect(result.rank).toBe(types_1.HandRank.STRAIGHT_FLUSH);
        expect(result.bestCards.length).toBe(5);
        expect(result.description).toContain("Straight Flush");
    });
    test("should correctly compare two hands", () => {
        // Create a higher hand (royal flush)
        const hand1 = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
        ]);
        const communityCards1 = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.JACK),
            createCard(types_1.Suit.HEARTS, types_1.Rank.TEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.TWO),
            createCard(types_1.Suit.CLUBS, types_1.Rank.THREE),
        ];
        // Create a lower hand (straight flush)
        const hand2 = new Hand_1.Hand([
            createCard(types_1.Suit.CLUBS, types_1.Rank.NINE),
            createCard(types_1.Suit.CLUBS, types_1.Rank.EIGHT),
        ]);
        const communityCards2 = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.SEVEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.SIX),
            createCard(types_1.Suit.CLUBS, types_1.Rank.FIVE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
        ];
        // Evaluate both hands
        const result1 = evaluator.evaluate(hand1, communityCards1);
        const result2 = evaluator.evaluate(hand2, communityCards2);
        // Compare the hands
        const comparison = evaluator.compareHands(result1, result2);
        // Result1 should be better than result2
        expect(comparison).toBeGreaterThan(0);
    });
    test("should compare hands with the same rank but different values", () => {
        // Create a higher pair (pair of aces)
        const hand1 = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.ACE),
        ]);
        const communityCards1 = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.CLUBS, types_1.Rank.JACK),
            createCard(types_1.Suit.SPADES, types_1.Rank.TEN),
            createCard(types_1.Suit.HEARTS, types_1.Rank.NINE),
        ];
        // Create a lower pair (pair of kings)
        const hand2 = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.KING),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
        ]);
        const communityCards2 = [
            createCard(types_1.Suit.HEARTS, types_1.Rank.QUEEN),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.JACK),
            createCard(types_1.Suit.CLUBS, types_1.Rank.TEN),
            createCard(types_1.Suit.SPADES, types_1.Rank.NINE),
            createCard(types_1.Suit.HEARTS, types_1.Rank.EIGHT),
        ];
        // Evaluate both hands
        const result1 = evaluator.evaluate(hand1, communityCards1);
        const result2 = evaluator.evaluate(hand2, communityCards2);
        // Compare the hands
        const comparison = evaluator.compareHands(result1, result2);
        // Result1 should be better than result2
        expect(comparison).toBeGreaterThan(0);
    });
    test("should handle evaluating with hole cards only", () => {
        // Create a hand with two hole cards
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
        ]);
        // Evaluate with no community cards
        const result = evaluator.evaluate(hand, []);
        // Should evaluate to high card
        expect(result.rank).toBe(types_1.HandRank.HIGH_CARD);
        expect(result.bestCards.length).toBe(2);
        expect(result.description).toContain("High Card");
    });
    test("should handle evaluating with low settings", () => {
        // Create evaluator with low hand evaluation enabled
        const lowEvaluator = new TexasHoldemEvaluator_1.TexasHoldemEvaluator({
            evaluateLow: true,
            lowHandQualifier: 8,
            acesLow: true,
        });
        // Create a good low hand (A-2-3-4-5)
        const hand = new Hand_1.Hand([
            createCard(types_1.Suit.HEARTS, types_1.Rank.ACE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.TWO),
        ]);
        const communityCards = [
            createCard(types_1.Suit.CLUBS, types_1.Rank.THREE),
            createCard(types_1.Suit.SPADES, types_1.Rank.FOUR),
            createCard(types_1.Suit.HEARTS, types_1.Rank.FIVE),
            createCard(types_1.Suit.DIAMONDS, types_1.Rank.KING),
            createCard(types_1.Suit.CLUBS, types_1.Rank.QUEEN),
        ];
        // Evaluate the hand for low
        const result = lowEvaluator.evaluateHiLo(hand, communityCards);
        // Should qualify for low
        expect(result.lowHand?.valid).toBe(true);
        expect(result.lowHand?.bestCards).toHaveLength(5);
        expect(result.lowHand?.rankValue).toBeLessThanOrEqual(5); // A-2-3-4-5 is a 5-low
    });
});
//# sourceMappingURL=TexasHoldemEvaluator.additional.test.js.map