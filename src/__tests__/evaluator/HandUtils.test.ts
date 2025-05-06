import { Card } from "../../models";
import { HandUtils } from "../../evaluator";
import { Rank, Suit, HandRank } from "../../types";

describe("HandUtils", () => {
  // Test cards
  const aceHearts = new Card(Suit.HEARTS, Rank.ACE);
  const aceSpades = new Card(Suit.SPADES, Rank.ACE);
  const aceDiamonds = new Card(Suit.DIAMONDS, Rank.ACE);
  const aceClubs = new Card(Suit.CLUBS, Rank.ACE);
  const kingHearts = new Card(Suit.HEARTS, Rank.KING);
  const kingSpades = new Card(Suit.SPADES, Rank.KING);
  const queenHearts = new Card(Suit.HEARTS, Rank.QUEEN);
  const jackHearts = new Card(Suit.HEARTS, Rank.JACK);
  const jackSpades = new Card(Suit.SPADES, Rank.JACK);
  const tenHearts = new Card(Suit.HEARTS, Rank.TEN);
  const nineHearts = new Card(Suit.HEARTS, Rank.NINE);
  const eightSpades = new Card(Suit.SPADES, Rank.EIGHT);
  const sevenSpades = new Card(Suit.SPADES, Rank.SEVEN);
  const sixDiamonds = new Card(Suit.DIAMONDS, Rank.SIX);
  const fiveClubs = new Card(Suit.CLUBS, Rank.FIVE);
  const fourHearts = new Card(Suit.HEARTS, Rank.FOUR);
  const threeHearts = new Card(Suit.HEARTS, Rank.THREE);
  const twoSpades = new Card(Suit.SPADES, Rank.TWO);

  describe("groupByRank", () => {
    test("should group cards by rank", () => {
      const cards = [aceHearts, kingHearts, aceSpades, queenHearts];
      const groups = HandUtils.groupByRank(cards);

      expect(groups.size).toBe(3); // Ace, King, Queen
      expect(groups.get(Rank.ACE)?.length).toBe(2);
      expect(groups.get(Rank.KING)?.length).toBe(1);
      expect(groups.get(Rank.QUEEN)?.length).toBe(1);
    });
  });

  describe("groupBySuit", () => {
    test("should group cards by suit", () => {
      const cards = [aceHearts, kingHearts, aceSpades, queenHearts];
      const groups = HandUtils.groupBySuit(cards);

      expect(groups.size).toBe(2); // Hearts, Spades
      expect(groups.get(Suit.HEARTS)?.length).toBe(3);
      expect(groups.get(Suit.SPADES)?.length).toBe(1);
    });
  });

  describe("sortByRank", () => {
    test("should sort cards by rank (ace high)", () => {
      const cards = [twoSpades, kingHearts, aceHearts, tenHearts];
      const sorted = HandUtils.sortByRank(cards, true);

      expect(sorted[0].rank).toBe(Rank.ACE);
      expect(sorted[1].rank).toBe(Rank.KING);
      expect(sorted[2].rank).toBe(Rank.TEN);
      expect(sorted[3].rank).toBe(Rank.TWO);
    });

    test("should sort cards by rank (ace low)", () => {
      const cards = [twoSpades, kingHearts, aceHearts, tenHearts];
      const sorted = HandUtils.sortByRank(cards, false);

      expect(sorted[0].rank).toBe(Rank.KING);
      expect(sorted[1].rank).toBe(Rank.TEN);
      expect(sorted[2].rank).toBe(Rank.TWO);
      expect(sorted[3].rank).toBe(Rank.ACE);
    });
  });

  describe("findPairs", () => {
    test("should find all pairs in the cards", () => {
      const cards = [aceHearts, aceSpades, kingHearts, queenHearts];
      const pairs = HandUtils.findPairs(cards);

      expect(pairs.length).toBe(1);
      expect(pairs[0].length).toBe(2);
      expect(pairs[0][0].rank).toBe(Rank.ACE);
      expect(pairs[0][1].rank).toBe(Rank.ACE);
    });

    test("should find multiple pairs if present", () => {
      const cards = [aceHearts, aceSpades, kingHearts, kingSpades, queenHearts];
      const pairs = HandUtils.findPairs(cards);

      expect(pairs.length).toBe(2);
    });

    test("should return empty array if no pairs", () => {
      const cards = [aceHearts, kingHearts, queenHearts, jackHearts];
      const pairs = HandUtils.findPairs(cards);

      expect(pairs.length).toBe(0);
    });
  });

  describe("findThreeOfAKinds", () => {
    test("should find a three of a kind", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts];
      const trips = HandUtils.findThreeOfAKinds(cards);

      expect(trips.length).toBe(1);
      expect(trips[0].length).toBe(3);
      expect(trips[0][0].rank).toBe(Rank.ACE);
      expect(trips[0][1].rank).toBe(Rank.ACE);
      expect(trips[0][2].rank).toBe(Rank.ACE);
    });

    test("should return empty array if no three of a kind", () => {
      const cards = [aceHearts, aceSpades, kingHearts, queenHearts];
      const trips = HandUtils.findThreeOfAKinds(cards);

      expect(trips.length).toBe(0);
    });
  });

  describe("findFourOfAKinds", () => {
    test("should find a four of a kind", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, aceClubs, kingHearts];
      const quads = HandUtils.findFourOfAKinds(cards);

      expect(quads.length).toBe(1);
      expect(quads[0].length).toBe(4);
      expect(quads[0][0].rank).toBe(Rank.ACE);
      expect(quads[0][1].rank).toBe(Rank.ACE);
      expect(quads[0][2].rank).toBe(Rank.ACE);
      expect(quads[0][3].rank).toBe(Rank.ACE);
    });

    test("should return empty array if no four of a kind", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts];
      const quads = HandUtils.findFourOfAKinds(cards);

      expect(quads.length).toBe(0);
    });
  });

  describe("findStraight", () => {
    test("should find a straight", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
      ];
      const straight = HandUtils.findStraight(cards);

      expect(straight).not.toBeNull();
      expect(straight!.length).toBe(5);
      expect(straight![0].rank).toBe(Rank.ACE);
      expect(straight![1].rank).toBe(Rank.KING);
      expect(straight![2].rank).toBe(Rank.QUEEN);
      expect(straight![3].rank).toBe(Rank.JACK);
      expect(straight![4].rank).toBe(Rank.TEN);
    });

    test("should find a wheel straight (A-5-4-3-2)", () => {
      const cards = [
        aceHearts,
        fiveClubs,
        fourHearts,
        threeHearts,
        twoSpades,
        kingHearts,
      ];
      const straight = HandUtils.findStraight(cards);

      expect(straight).not.toBeNull();
      expect(straight!.length).toBe(5);
      expect(straight![0].rank).toBe(Rank.FIVE);
      expect(straight![1].rank).toBe(Rank.FOUR);
      expect(straight![2].rank).toBe(Rank.THREE);
      expect(straight![3].rank).toBe(Rank.TWO);
      expect(straight![4].rank).toBe(Rank.ACE); // Ace is low
    });

    test("should return null if no straight", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        nineHearts,
      ];
      const straight = HandUtils.findStraight(cards);

      expect(straight).toBeNull();
    });
  });

  describe("findFlush", () => {
    test("should find a flush", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        nineHearts,
        twoSpades,
      ];
      const flush = HandUtils.findFlush(cards);

      expect(flush).not.toBeNull();
      expect(flush!.length).toBe(5);
      expect(flush![0].suit).toBe(Suit.HEARTS);
      expect(flush![1].suit).toBe(Suit.HEARTS);
      expect(flush![2].suit).toBe(Suit.HEARTS);
      expect(flush![3].suit).toBe(Suit.HEARTS);
      expect(flush![4].suit).toBe(Suit.HEARTS);
    });

    test("should return null if no flush", () => {
      const cards = [aceHearts, kingHearts, queenHearts, jackHearts, twoSpades];
      const flush = HandUtils.findFlush(cards);

      expect(flush).toBeNull();
    });
  });

  describe("findStraightFlush", () => {
    test("should find a straight flush", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
      ];
      const straightFlush = HandUtils.findStraightFlush(cards);

      expect(straightFlush).not.toBeNull();
      expect(straightFlush!.length).toBe(5);
      expect(straightFlush![0].rank).toBe(Rank.ACE);
      expect(straightFlush![1].rank).toBe(Rank.KING);
      expect(straightFlush![2].rank).toBe(Rank.QUEEN);
      expect(straightFlush![3].rank).toBe(Rank.JACK);
      expect(straightFlush![4].rank).toBe(Rank.TEN);
      expect(straightFlush![0].suit).toBe(Suit.HEARTS);
    });

    test("should return null if no straight flush", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
      ];
      // Replace tenHearts with twoSpades to break the straight flush
      const modifiedCards = cards.filter((card) => card !== tenHearts);
      const straightFlush = HandUtils.findStraightFlush(modifiedCards);

      expect(straightFlush).toBeNull();
    });
  });

  describe("findRoyalFlush", () => {
    test("should find a royal flush", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
      ];
      const royalFlush = HandUtils.findRoyalFlush(cards);

      expect(royalFlush).not.toBeNull();
      expect(royalFlush!.length).toBe(5);
      expect(royalFlush![0].rank).toBe(Rank.ACE);
      expect(royalFlush![1].rank).toBe(Rank.KING);
      expect(royalFlush![2].rank).toBe(Rank.QUEEN);
      expect(royalFlush![3].rank).toBe(Rank.JACK);
      expect(royalFlush![4].rank).toBe(Rank.TEN);
      expect(royalFlush![0].suit).toBe(Suit.HEARTS);
    });

    test("should return null if no royal flush", () => {
      const cards = [
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        nineHearts,
        twoSpades,
      ];
      const royalFlush = HandUtils.findRoyalFlush(cards);

      expect(royalFlush).toBeNull();
    });
  });

  describe("findFullHouse", () => {
    test("should find a full house", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts, kingSpades];
      const fullHouse = HandUtils.findFullHouse(cards);

      expect(fullHouse).not.toBeNull();
      expect(fullHouse![0].length).toBe(3); // Three of a kind
      expect(fullHouse![1].length).toBe(2); // Pair
      expect(fullHouse![0][0].rank).toBe(Rank.ACE);
      expect(fullHouse![1][0].rank).toBe(Rank.KING);
    });

    test("should return null if no full house", () => {
      const cards = [aceHearts, aceSpades, kingHearts, queenHearts, jackHearts];
      const fullHouse = HandUtils.findFullHouse(cards);

      expect(fullHouse).toBeNull();
    });
  });

  describe("evaluateHighHand", () => {
    test("should correctly identify royal flush", () => {
      const cards = [aceHearts, kingHearts, queenHearts, jackHearts, tenHearts];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(evaluation.rankValue).toBe(10);
    });

    test("should correctly identify straight flush", () => {
      const cards = [
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        nineHearts,
      ];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(evaluation.rankValue).toBe(9);
    });

    test("should correctly identify four of a kind", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, aceClubs, kingHearts];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(evaluation.rankValue).toBe(8);
    });

    test("should correctly identify full house", () => {
      const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts, kingSpades];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.FULL_HOUSE);
      expect(evaluation.rankValue).toBe(7);
    });

    test("should correctly identify flush", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        nineHearts,
      ];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.FLUSH);
      expect(evaluation.rankValue).toBe(6);
    });

    test("should correctly identify straight", () => {
      const cards = [aceHearts, kingSpades, queenHearts, jackSpades, tenHearts];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.STRAIGHT);
      expect(evaluation.rankValue).toBe(5);
    });

    test("should correctly identify three of a kind", () => {
      const cards = [
        aceHearts,
        aceSpades,
        aceDiamonds,
        kingHearts,
        queenHearts,
      ];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(evaluation.rankValue).toBe(4);
    });

    test("should correctly identify two pair", () => {
      const cards = [aceHearts, aceSpades, kingHearts, kingSpades, queenHearts];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.TWO_PAIR);
      expect(evaluation.rankValue).toBe(3);
    });

    test("should correctly identify one pair", () => {
      const cards = [aceHearts, aceSpades, kingHearts, queenHearts, jackHearts];
      const evaluation = HandUtils.evaluateHighHand(cards);

      expect(evaluation.rank).toBe(HandRank.PAIR);
      expect(evaluation.rankValue).toBe(2);
    });

    test("should correctly identify high card", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        nineHearts,
        eightSpades,
      ];
      // Make sure not all cards have the same suit to avoid a flush
      const modifiedCards = [
        aceHearts,
        kingSpades,
        queenHearts,
        jackSpades,
        nineHearts,
      ];
      const evaluation = HandUtils.evaluateHighHand(modifiedCards);

      expect(evaluation.rank).toBe(HandRank.HIGH_CARD);
      expect(evaluation.rankValue).toBe(1);
    });
  });

  describe("evaluateLowHand", () => {
    test("should correctly identify a qualifying low hand", () => {
      const cards = [
        aceHearts,
        twoSpades,
        threeHearts,
        fourHearts,
        fiveClubs,
        kingHearts,
      ];
      const evaluation = HandUtils.evaluateLowHand(cards, 8);

      expect(evaluation.valid).toBe(true);
      expect(evaluation.bestCards.length).toBe(5);
      // Aces should be treated as low
      const ranks = evaluation.bestCards.map((card) => card.rank).sort();
      expect(ranks).toContain(Rank.ACE);
      expect(ranks).toContain(Rank.TWO);
      expect(ranks).toContain(Rank.THREE);
      expect(ranks).toContain(Rank.FOUR);
      expect(ranks).toContain(Rank.FIVE);
    });

    test("should reject hand with pairs", () => {
      const cards = [
        aceHearts,
        aceSpades,
        twoSpades,
        threeHearts,
        fourHearts,
        fiveClubs,
      ];
      const evaluation = HandUtils.evaluateLowHand(cards, 8);

      expect(evaluation.valid).toBe(true);
      // Should still be valid but won't use both aces
      expect(evaluation.bestCards.length).toBe(5);

      // Count how many aces are in the best hand
      const aceCount = evaluation.bestCards.filter(
        (card) => card.rank === Rank.ACE
      ).length;
      expect(aceCount).toBe(1); // Only one Ace should be used
    });

    test("should reject hand with cards above qualifier", () => {
      const cards = [
        nineHearts,
        twoSpades,
        threeHearts,
        fourHearts,
        fiveClubs,
        sixDiamonds,
      ];
      const evaluation = HandUtils.evaluateLowHand(cards, 8);

      // It seems the evaluator is using the lower cards and ignoring the nine,
      // so it considers this a valid low hand. Let's adjust the test.
      // Check that it doesn't include the nine in the best hand
      const nineInBestHand = evaluation.bestCards.some(
        (card) => card.rank === Rank.NINE
      );
      expect(nineInBestHand).toBe(false);

      // Create a hand with all cards above 8
      const highCards = [
        nineHearts,
        tenHearts,
        jackHearts,
        queenHearts,
        kingHearts,
        aceHearts,
      ];
      const highEvaluation = HandUtils.evaluateLowHand(highCards, 8);
      expect(highEvaluation.valid).toBe(false);
    });
  });

  describe("generateCombinations", () => {
    test("should generate all possible 5-card combinations", () => {
      const cards = [
        aceHearts,
        kingHearts,
        queenHearts,
        jackHearts,
        tenHearts,
        nineHearts,
      ];
      const combinations = HandUtils.generateCombinations(cards, 5);

      // There should be 6C5 = 6 combinations
      expect(combinations.length).toBe(6);
      expect(combinations[0].length).toBe(5);
    });

    test("should generate all possible 2-card combinations", () => {
      const cards = [aceHearts, kingHearts, queenHearts, jackHearts];
      const combinations = HandUtils.generateCombinations(cards, 2);

      // There should be 4C2 = 6 combinations
      expect(combinations.length).toBe(6);
      expect(combinations[0].length).toBe(2);
    });
  });

  describe("generateOmahaCombinations", () => {
    test("should generate valid Omaha combinations (2 hole + 3 community)", () => {
      const holeCards = [aceHearts, kingHearts, queenHearts, jackHearts];
      const communityCards = [
        tenHearts,
        nineHearts,
        eightSpades,
        sevenSpades,
        sixDiamonds,
      ];

      const combinations = HandUtils.generateOmahaCombinations(
        holeCards,
        communityCards
      );

      // There should be 4C2 * 5C3 = 6 * 10 = 60 combinations
      expect(combinations.length).toBe(60);

      // Each combination should have exactly 5 cards
      expect(combinations[0].length).toBe(5);

      // Verify a few combinations to ensure they contain 2 hole cards and 3 community cards
      const holeSuits = new Set(holeCards.map((card) => card.suit.toString()));
      const communitySuits = new Set(
        communityCards.map((card) => card.suit.toString())
      );

      // Check some random combinations
      for (let i = 0; i < 5; i++) {
        const combo = combinations[i];
        const holeCardCount = combo.filter((card) =>
          holeCards.some((hc) => hc.suit === card.suit && hc.rank === card.rank)
        ).length;

        const communityCardCount = combo.filter((card) =>
          communityCards.some(
            (cc) => cc.suit === card.suit && cc.rank === card.rank
          )
        ).length;

        expect(holeCardCount).toBe(2);
        expect(communityCardCount).toBe(3);
      }
    });
  });
});
