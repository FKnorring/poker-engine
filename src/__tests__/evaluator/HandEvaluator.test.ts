import { Card, Hand } from "../../models";
import {
  HandEvaluator,
  HandEvaluationResult,
  LowHandEvaluationResult,
} from "../../evaluator/HandEvaluator";
import { Rank, Suit, HandRank } from "../../types";

// Create a concrete implementation of HandEvaluator for testing
class TestHandEvaluator extends HandEvaluator {
  evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult {
    // Simple implementation that just returns a mock result
    return {
      hand,
      rank: HandRank.HIGH_CARD,
      rankValue: 1, // Numeric value for HIGH_CARD
      description: "Test hand",
      tiebreakers: [14, 13, 12, 11, 10], // A, K, Q, J, 10
      bestCards: [...hand.cards.slice(0, 2), ...communityCards.slice(0, 3)],
    };
  }

  // Override evaluateLowHand for testing
  evaluateLowHand(cards: Card[]): LowHandEvaluationResult {
    const hasLowHand = cards.some((card) => card.rank <= Rank.EIGHT);

    return {
      valid: hasLowHand,
      rankValue: hasLowHand ? 1 : 0,
      description: hasLowHand ? "Valid low hand" : "Not a valid low hand",
      bestCards: hasLowHand ? cards.slice(0, 5) : [],
      tiebreakers: hasLowHand ? [1, 2, 3, 4, 5] : [],
    };
  }
}

describe("HandEvaluator", () => {
  // Create test cards
  const aceHearts = new Card(Suit.HEARTS, Rank.ACE);
  const kingHearts = new Card(Suit.HEARTS, Rank.KING);
  const queenHearts = new Card(Suit.HEARTS, Rank.QUEEN);
  const jackHearts = new Card(Suit.HEARTS, Rank.JACK);
  const tenHearts = new Card(Suit.HEARTS, Rank.TEN);
  const twoSpades = new Card(Suit.SPADES, Rank.TWO);

  describe("constructor", () => {
    test("should initialize with default options", () => {
      const evaluator = new TestHandEvaluator();

      // Using private property access for testing (not ideal in practice)
      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.evaluateLow).toBe(false);
      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.lowHandQualifier).toBe(8);
      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.acesLow).toBe(false);
    });

    test("should initialize with custom options", () => {
      const evaluator = new TestHandEvaluator({
        evaluateLow: true,
        lowHandQualifier: 6,
        acesLow: false,
      });

      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.evaluateLow).toBe(true);
      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.lowHandQualifier).toBe(6);
      // @ts-ignore - accessing private property for testing
      expect(evaluator.options.acesLow).toBe(false);
    });
  });

  describe("compareHands", () => {
    test("should compare hands by rank value", () => {
      const evaluator = new TestHandEvaluator();

      const hand1: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.STRAIGHT,
        rankValue: 5, // Numeric value for STRAIGHT
        description: "Straight",
        tiebreakers: [14, 13, 12, 11, 10],
        bestCards: [],
      };

      const hand2: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.FLUSH,
        rankValue: 6, // Numeric value for FLUSH
        description: "Flush",
        tiebreakers: [14, 13, 12, 11, 9],
        bestCards: [],
      };

      const result = evaluator.compareHands(hand1, hand2);
      expect(result).toBeLessThan(0); // hand2 (flush) is better than hand1 (straight)
    });

    test("should compare hands by tiebreakers when rank values are equal", () => {
      const evaluator = new TestHandEvaluator();

      const hand1: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.STRAIGHT,
        rankValue: 5, // Numeric value for STRAIGHT
        description: "Straight to Ace",
        tiebreakers: [14, 13, 12, 11, 10],
        bestCards: [],
      };

      const hand2: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.STRAIGHT,
        rankValue: 5, // Numeric value for STRAIGHT
        description: "Straight to King",
        tiebreakers: [13, 12, 11, 10, 9],
        bestCards: [],
      };

      const result = evaluator.compareHands(hand1, hand2);
      expect(result).toBeGreaterThan(0); // hand1 (straight to ace) is better than hand2 (straight to king)
    });

    test("should consider hands equal when rank values and all tiebreakers are equal", () => {
      const evaluator = new TestHandEvaluator();

      const hand1: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.STRAIGHT,
        rankValue: 5, // Numeric value for STRAIGHT
        description: "Straight to Ace",
        tiebreakers: [14, 13, 12, 11, 10],
        bestCards: [],
      };

      const hand2: HandEvaluationResult = {
        hand: new Hand(),
        rank: HandRank.STRAIGHT,
        rankValue: 5, // Numeric value for STRAIGHT
        description: "Straight to Ace",
        tiebreakers: [14, 13, 12, 11, 10],
        bestCards: [],
      };

      const result = evaluator.compareHands(hand1, hand2);
      expect(result).toBe(0); // Hands are equal
    });
  });

  describe("evaluateHiLo", () => {
    test("should evaluate both high and low hands when evaluateLow is true", () => {
      const evaluator = new TestHandEvaluator({ evaluateLow: true });

      const hand = new Hand();
      hand.addCards([aceHearts, kingHearts]);

      const communityCards = [queenHearts, jackHearts, twoSpades];

      const result = evaluator.evaluateHiLo(hand, communityCards);

      // High hand should be evaluated
      expect(result.highHand).toBeDefined();
      expect(result.highHand.rank).toBe(HandRank.HIGH_CARD);

      // Low hand should be evaluated and valid (due to having a 2)
      expect(result.lowHand).not.toBeNull();
      expect(result.lowHand?.valid).toBe(true);
    });

    test("should not evaluate low hand when evaluateLow is false", () => {
      const evaluator = new TestHandEvaluator({ evaluateLow: false });

      const hand = new Hand();
      hand.addCards([aceHearts, kingHearts]);

      const communityCards = [queenHearts, jackHearts, twoSpades];

      const result = evaluator.evaluateHiLo(hand, communityCards);

      // High hand should be evaluated
      expect(result.highHand).toBeDefined();
      expect(result.highHand.rank).toBe(HandRank.HIGH_CARD);

      // Low hand should be null
      expect(result.lowHand).toBeNull();
    });
  });
});
