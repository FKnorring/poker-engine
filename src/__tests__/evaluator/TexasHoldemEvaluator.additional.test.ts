import { TexasHoldemEvaluator } from "../../evaluator/TexasHoldemEvaluator";
import { Card } from "../../models/Card";
import { Hand } from "../../models/Hand";
import { Rank, Suit, HandRank } from "../../types";

describe("TexasHoldemEvaluator Additional Tests", () => {
  let evaluator: TexasHoldemEvaluator;

  beforeEach(() => {
    // Create evaluator with default settings
    evaluator = new TexasHoldemEvaluator();
  });

  // Helper to create cards
  const createCard = (suit: Suit, rank: Rank): Card => new Card(suit, rank);

  test("should find the best hand from hole cards and community cards", () => {
    // Create a hand with two hole cards
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
    ]);

    // Create community cards for a royal flush
    const communityCards = [
      createCard(Suit.HEARTS, Rank.QUEEN),
      createCard(Suit.HEARTS, Rank.JACK),
      createCard(Suit.HEARTS, Rank.TEN),
      createCard(Suit.SPADES, Rank.TWO),
      createCard(Suit.CLUBS, Rank.THREE),
    ];

    // Evaluate the hand
    const result = evaluator.evaluate(hand, communityCards);

    // Should identify a royal flush
    expect(result.rank).toBe(HandRank.ROYAL_FLUSH);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Royal Flush");
  });

  test("should evaluate a straight flush", () => {
    const hand = new Hand([
      createCard(Suit.CLUBS, Rank.NINE),
      createCard(Suit.CLUBS, Rank.EIGHT),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.SEVEN),
      createCard(Suit.CLUBS, Rank.SIX),
      createCard(Suit.CLUBS, Rank.FIVE),
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.KING),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.STRAIGHT_FLUSH);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Straight Flush");
  });

  test("should evaluate four of a kind", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.ACE),
      createCard(Suit.SPADES, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.QUEEN),
      createCard(Suit.CLUBS, Rank.JACK),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.FOUR_OF_A_KIND);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Four of a Kind");
  });

  test("should evaluate a full house", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.KING),
      createCard(Suit.CLUBS, Rank.QUEEN),
      createCard(Suit.SPADES, Rank.JACK),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.FULL_HOUSE);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Full House");
  });

  test("should evaluate a flush", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
    ]);

    const communityCards = [
      createCard(Suit.HEARTS, Rank.QUEEN),
      createCard(Suit.HEARTS, Rank.TEN),
      createCard(Suit.HEARTS, Rank.FIVE),
      createCard(Suit.CLUBS, Rank.NINE),
      createCard(Suit.DIAMONDS, Rank.EIGHT),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.FLUSH);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Flush");
  });

  test("should evaluate a straight", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.NINE),
      createCard(Suit.DIAMONDS, Rank.EIGHT),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.SEVEN),
      createCard(Suit.SPADES, Rank.SIX),
      createCard(Suit.HEARTS, Rank.FIVE),
      createCard(Suit.DIAMONDS, Rank.ACE),
      createCard(Suit.CLUBS, Rank.KING),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.STRAIGHT);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Straight");
  });

  test("should evaluate three of a kind", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.SEVEN),
      createCard(Suit.DIAMONDS, Rank.QUEEN),
      createCard(Suit.CLUBS, Rank.JACK),
      createCard(Suit.SPADES, Rank.TEN),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.THREE_OF_A_KIND);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Three of a Kind");
  });

  test("should evaluate two pair", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards = [
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.KING),
      createCard(Suit.CLUBS, Rank.SEVEN),
      createCard(Suit.SPADES, Rank.JACK),
      createCard(Suit.HEARTS, Rank.TEN),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.TWO_PAIR);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Two Pair");
  });

  test("should evaluate one pair", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards = [
      createCard(Suit.HEARTS, Rank.SEVEN),
      createCard(Suit.DIAMONDS, Rank.QUEEN),
      createCard(Suit.CLUBS, Rank.JACK),
      createCard(Suit.SPADES, Rank.TEN),
      createCard(Suit.HEARTS, Rank.NINE),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.PAIR);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Pair");
  });

  test("should evaluate high card", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.KING),
    ]);

    const communityCards = [
      createCard(Suit.HEARTS, Rank.QUEEN),
      createCard(Suit.DIAMONDS, Rank.JACK),
      createCard(Suit.CLUBS, Rank.NINE),
      createCard(Suit.SPADES, Rank.SEVEN),
      createCard(Suit.HEARTS, Rank.FIVE),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.HIGH_CARD);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("High Card");
  });

  test("should evaluate a wheel straight (A-5 low straight)", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.TWO),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.THREE),
      createCard(Suit.SPADES, Rank.FOUR),
      createCard(Suit.HEARTS, Rank.FIVE),
      createCard(Suit.DIAMONDS, Rank.KING),
      createCard(Suit.CLUBS, Rank.QUEEN),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.STRAIGHT);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Straight");
  });

  test("should evaluate a wheel straight flush (A-5 low straight flush)", () => {
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.TWO),
    ]);

    const communityCards = [
      createCard(Suit.HEARTS, Rank.THREE),
      createCard(Suit.HEARTS, Rank.FOUR),
      createCard(Suit.HEARTS, Rank.FIVE),
      createCard(Suit.DIAMONDS, Rank.KING),
      createCard(Suit.CLUBS, Rank.QUEEN),
    ];

    const result = evaluator.evaluate(hand, communityCards);

    expect(result.rank).toBe(HandRank.STRAIGHT_FLUSH);
    expect(result.bestCards.length).toBe(5);
    expect(result.description).toContain("Straight Flush");
  });

  test("should correctly compare two hands", () => {
    // Create a higher hand (royal flush)
    const hand1 = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.HEARTS, Rank.KING),
    ]);

    const communityCards1 = [
      createCard(Suit.HEARTS, Rank.QUEEN),
      createCard(Suit.HEARTS, Rank.JACK),
      createCard(Suit.HEARTS, Rank.TEN),
      createCard(Suit.SPADES, Rank.TWO),
      createCard(Suit.CLUBS, Rank.THREE),
    ];

    // Create a lower hand (straight flush)
    const hand2 = new Hand([
      createCard(Suit.CLUBS, Rank.NINE),
      createCard(Suit.CLUBS, Rank.EIGHT),
    ]);

    const communityCards2 = [
      createCard(Suit.CLUBS, Rank.SEVEN),
      createCard(Suit.CLUBS, Rank.SIX),
      createCard(Suit.CLUBS, Rank.FIVE),
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.KING),
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
    const hand1 = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.ACE),
    ]);

    const communityCards1 = [
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.QUEEN),
      createCard(Suit.CLUBS, Rank.JACK),
      createCard(Suit.SPADES, Rank.TEN),
      createCard(Suit.HEARTS, Rank.NINE),
    ];

    // Create a lower pair (pair of kings)
    const hand2 = new Hand([
      createCard(Suit.HEARTS, Rank.KING),
      createCard(Suit.DIAMONDS, Rank.KING),
    ]);

    const communityCards2 = [
      createCard(Suit.HEARTS, Rank.QUEEN),
      createCard(Suit.DIAMONDS, Rank.JACK),
      createCard(Suit.CLUBS, Rank.TEN),
      createCard(Suit.SPADES, Rank.NINE),
      createCard(Suit.HEARTS, Rank.EIGHT),
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
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.KING),
    ]);

    // Evaluate with no community cards
    const result = evaluator.evaluate(hand, []);

    // Should evaluate to high card
    expect(result.rank).toBe(HandRank.HIGH_CARD);
    expect(result.bestCards.length).toBe(2);
    expect(result.description).toContain("High Card");
  });

  test("should handle evaluating with low settings", () => {
    // Create evaluator with low hand evaluation enabled
    const lowEvaluator = new TexasHoldemEvaluator({
      evaluateLow: true,
      lowHandQualifier: 8,
      acesLow: true,
    });

    // Create a good low hand (A-2-3-4-5)
    const hand = new Hand([
      createCard(Suit.HEARTS, Rank.ACE),
      createCard(Suit.DIAMONDS, Rank.TWO),
    ]);

    const communityCards = [
      createCard(Suit.CLUBS, Rank.THREE),
      createCard(Suit.SPADES, Rank.FOUR),
      createCard(Suit.HEARTS, Rank.FIVE),
      createCard(Suit.DIAMONDS, Rank.KING),
      createCard(Suit.CLUBS, Rank.QUEEN),
    ];

    // Evaluate the hand for low
    const result = lowEvaluator.evaluateHiLo(hand, communityCards);

    // Should qualify for low
    expect(result.lowHand?.valid).toBe(true);
    expect(result.lowHand?.bestCards).toHaveLength(5);
    expect(result.lowHand?.rankValue).toBeLessThanOrEqual(5); // A-2-3-4-5 is a 5-low
  });
});
