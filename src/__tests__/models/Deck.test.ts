import { Deck } from "../../models/Deck";
import { Card } from "../../models/Card";
import { Rank, Suit } from "../../types";

describe("Deck", () => {
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
  });

  describe("initialization", () => {
    it("should create a standard 52-card deck", () => {
      expect(deck.remainingCards).toBe(52);

      // Check that all suits and ranks are present
      const cards = deck.cards;

      // Check for all suits
      const suits = new Set(cards.map((card) => card.suit));
      expect(suits.size).toBe(4);
      expect(suits.has(Suit.CLUBS)).toBe(true);
      expect(suits.has(Suit.DIAMONDS)).toBe(true);
      expect(suits.has(Suit.HEARTS)).toBe(true);
      expect(suits.has(Suit.SPADES)).toBe(true);

      // Check for all ranks
      const ranks = new Set(cards.map((card) => card.rank));
      expect(ranks.size).toBe(13);
      expect(ranks.has(Rank.ACE)).toBe(true);
      expect(ranks.has(Rank.KING)).toBe(true);
      expect(ranks.has(Rank.QUEEN)).toBe(true);
      expect(ranks.has(Rank.JACK)).toBe(true);
      expect(ranks.has(Rank.TEN)).toBe(true);
      expect(ranks.has(Rank.NINE)).toBe(true);
      expect(ranks.has(Rank.EIGHT)).toBe(true);
      expect(ranks.has(Rank.SEVEN)).toBe(true);
      expect(ranks.has(Rank.SIX)).toBe(true);
      expect(ranks.has(Rank.FIVE)).toBe(true);
      expect(ranks.has(Rank.FOUR)).toBe(true);
      expect(ranks.has(Rank.THREE)).toBe(true);
      expect(ranks.has(Rank.TWO)).toBe(true);

      // Check that each card is unique
      const uniqueCards = new Set(
        cards.map((card) => `${card.suit}-${card.rank}`)
      );
      expect(uniqueCards.size).toBe(52);
    });
  });

  describe("shuffle", () => {
    it("should shuffle the deck", () => {
      const originalOrder = [...deck.cards];

      // Shuffle the deck
      deck.shuffle();

      const shuffledOrder = deck.cards;

      // The deck should still have 52 cards
      expect(shuffledOrder.length).toBe(52);

      // The order should be different (this could theoretically fail, but it's extremely unlikely)
      let samePositionCount = 0;
      for (let i = 0; i < originalOrder.length; i++) {
        if (
          originalOrder[i].suit === shuffledOrder[i].suit &&
          originalOrder[i].rank === shuffledOrder[i].rank
        ) {
          samePositionCount++;
        }
      }

      // It's very unlikely that more than 25% of cards remain in the same position after shuffling
      expect(samePositionCount).toBeLessThan(13);
    });

    it("should perform a high-quality shuffle", () => {
      // Mock Math.random for deterministic results
      const mockRandom = jest.spyOn(Math, "random");
      const mockValues = Array(100)
        .fill(0)
        .map((_, i) => i / 100);
      let callCount = 0;

      mockRandom.mockImplementation(() => {
        return mockValues[callCount++ % mockValues.length];
      });

      deck.shuffle();

      // Verify that Math.random was called the expected number of times
      // Fisher-Yates should call Math.random 51 times for a 52-card deck
      expect(mockRandom).toHaveBeenCalledTimes(51);

      // Clean up
      mockRandom.mockRestore();
    });
  });

  describe("draw", () => {
    it("should draw a card from the deck", () => {
      const card = deck.draw();

      // A card should be returned
      expect(card).toBeInstanceOf(Card);

      // The deck should have one less card
      expect(deck.remainingCards).toBe(51);
    });

    it("should return undefined when the deck is empty", () => {
      // Draw all 52 cards
      for (let i = 0; i < 52; i++) {
        deck.draw();
      }

      // The next draw should return undefined
      const card = deck.draw();
      expect(card).toBeUndefined();

      // The deck should be empty
      expect(deck.remainingCards).toBe(0);
    });
  });

  describe("drawMultiple", () => {
    it("should draw multiple cards from the deck", () => {
      const cards = deck.drawMultiple(5);

      // 5 cards should be returned
      expect(cards.length).toBe(5);

      // The deck should have 5 less cards
      expect(deck.remainingCards).toBe(47);
    });

    it("should handle drawing more cards than available", () => {
      // Draw 50 cards
      deck.drawMultiple(50);

      // Try to draw 5 more (only 2 are left)
      const remainingCards = deck.drawMultiple(5);

      // Only 2 cards should be returned
      expect(remainingCards.length).toBe(2);

      // The deck should be empty
      expect(deck.remainingCards).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset the deck to its initial state", () => {
      // Draw some cards
      deck.drawMultiple(10);

      // Verify cards were drawn
      expect(deck.remainingCards).toBe(42);

      // Reset the deck
      deck.reset();

      // The deck should have 52 cards again
      expect(deck.remainingCards).toBe(52);
    });
  });

  describe("remainingCards", () => {
    it("should return the number of cards left in the deck", () => {
      expect(deck.remainingCards).toBe(52);

      deck.draw();
      expect(deck.remainingCards).toBe(51);

      deck.drawMultiple(5);
      expect(deck.remainingCards).toBe(46);
    });
  });

  describe("cards", () => {
    it("should return a copy of the current cards", () => {
      const cards = deck.cards;

      // Should be an array of 52 cards
      expect(cards.length).toBe(52);

      // Modifying the returned array should not affect the deck
      cards.pop();
      expect(deck.remainingCards).toBe(52);
    });
  });
});
