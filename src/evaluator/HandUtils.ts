import { Card } from "../models";
import { HandRank, Rank, Suit } from "../types";

/**
 * Utility functions for poker hand evaluation
 */
export class HandUtils {
  /**
   * Groups cards by rank
   * @returns Map where key is rank and value is array of cards with that rank
   */
  static groupByRank(cards: Card[]): Map<Rank, Card[]> {
    const groups = new Map<Rank, Card[]>();

    for (const card of cards) {
      const rank = card.rank;
      if (!groups.has(rank)) {
        groups.set(rank, []);
      }
      groups.get(rank)!.push(card);
    }

    return groups;
  }

  /**
   * Groups cards by suit
   * @returns Map where key is suit and value is array of cards with that suit
   */
  static groupBySuit(cards: Card[]): Map<Suit, Card[]> {
    const groups = new Map<Suit, Card[]>();

    for (const card of cards) {
      const suit = card.suit;
      if (!groups.has(suit)) {
        groups.set(suit, []);
      }
      groups.get(suit)!.push(card);
    }

    return groups;
  }

  /**
   * Sorts cards by rank (highest to lowest)
   * @param aceHigh Whether to treat Ace as high card (default: true)
   */
  static sortByRank(cards: Card[], aceHigh: boolean = true): Card[] {
    return [...cards].sort((a, b) => {
      return b.getValue(aceHigh) - a.getValue(aceHigh);
    });
  }

  /**
   * Finds all pairs in the given cards
   * @returns Array of pairs (each pair is an array of 2 cards)
   */
  static findPairs(cards: Card[]): Card[][] {
    const groups = this.groupByRank(cards);
    const pairs: Card[][] = [];

    for (const [_, sameRankCards] of groups) {
      if (sameRankCards.length >= 2) {
        // Create pairs from the cards with the same rank
        for (let i = 0; i < sameRankCards.length - 1; i++) {
          for (let j = i + 1; j < sameRankCards.length; j++) {
            pairs.push([sameRankCards[i], sameRankCards[j]]);
          }
        }
      }
    }

    return pairs;
  }

  /**
   * Finds all three of a kinds in the given cards
   * @returns Array of trips (each trip is an array of 3 cards)
   */
  static findThreeOfAKinds(cards: Card[]): Card[][] {
    const groups = this.groupByRank(cards);
    const trips: Card[][] = [];

    for (const [_, sameRankCards] of groups) {
      if (sameRankCards.length >= 3) {
        // Create 3-card combinations from the cards with the same rank
        for (let i = 0; i < sameRankCards.length - 2; i++) {
          for (let j = i + 1; j < sameRankCards.length - 1; j++) {
            for (let k = j + 1; k < sameRankCards.length; k++) {
              trips.push([
                sameRankCards[i],
                sameRankCards[j],
                sameRankCards[k],
              ]);
            }
          }
        }
      }
    }

    return trips;
  }

  /**
   * Finds all four of a kinds in the given cards
   * @returns Array of quads (each quad is an array of 4 cards)
   */
  static findFourOfAKinds(cards: Card[]): Card[][] {
    const groups = this.groupByRank(cards);
    const quads: Card[][] = [];

    for (const [_, sameRankCards] of groups) {
      if (sameRankCards.length >= 4) {
        // Take any 4 cards with the same rank
        quads.push(sameRankCards.slice(0, 4));
      }
    }

    return quads;
  }

  /**
   * Checks if the given cards form a straight
   * @param aceHigh Whether to treat Ace as high card (default: true)
   * @returns The cards forming a straight, ordered from highest to lowest, or null if no straight
   */
  static findStraight(cards: Card[], aceHigh: boolean = true): Card[] | null {
    if (cards.length < 5) {
      return null;
    }

    // Sort cards by rank
    const sortedCards = this.sortByRank(cards, aceHigh);

    // Create a map to hold the highest card of each rank
    // (to handle multiple cards of the same rank)
    const highestOfRank = new Map<number, Card>();

    for (const card of sortedCards) {
      const value = card.getValue(aceHigh);
      if (
        !highestOfRank.has(value) ||
        card.getValue(aceHigh) > highestOfRank.get(value)!.getValue(aceHigh)
      ) {
        highestOfRank.set(value, card);
      }
    }

    // Handle special case A-5-4-3-2 straight
    if (
      aceHigh &&
      highestOfRank.has(14) && // Has an Ace
      highestOfRank.has(2) &&
      highestOfRank.has(3) &&
      highestOfRank.has(4) &&
      highestOfRank.has(5)
    ) {
      return [
        highestOfRank.get(5)!,
        highestOfRank.get(4)!,
        highestOfRank.get(3)!,
        highestOfRank.get(2)!,
        highestOfRank.get(14)!, // Ace is low in this case
      ];
    }

    // Look for 5 consecutive cards
    const uniqueValues = [...highestOfRank.keys()].sort((a, b) => b - a);

    for (let i = 0; i <= uniqueValues.length - 5; i++) {
      if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
        return [
          highestOfRank.get(uniqueValues[i])!,
          highestOfRank.get(uniqueValues[i + 1])!,
          highestOfRank.get(uniqueValues[i + 2])!,
          highestOfRank.get(uniqueValues[i + 3])!,
          highestOfRank.get(uniqueValues[i + 4])!,
        ];
      }
    }

    return null;
  }

  /**
   * Checks if the given cards form a flush
   * @returns The cards forming a flush (5 cards of the same suit), or null if no flush
   */
  static findFlush(cards: Card[]): Card[] | null {
    if (cards.length < 5) {
      return null;
    }

    const suitGroups = this.groupBySuit(cards);

    for (const [_, suitCards] of suitGroups) {
      if (suitCards.length >= 5) {
        // Return the 5 highest cards of the same suit
        return this.sortByRank(suitCards).slice(0, 5);
      }
    }

    return null;
  }

  /**
   * Checks if the given cards form a straight flush
   * @param aceHigh Whether to treat Ace as high card
   * @returns The cards forming a straight flush, or null if no straight flush
   */
  static findStraightFlush(
    cards: Card[],
    aceHigh: boolean = true
  ): Card[] | null {
    if (cards.length < 5) {
      return null;
    }

    const suitGroups = this.groupBySuit(cards);

    for (const [_, suitCards] of suitGroups) {
      if (suitCards.length >= 5) {
        const straight = this.findStraight(suitCards, aceHigh);
        if (straight) {
          return straight;
        }
      }
    }

    return null;
  }

  /**
   * Checks if the given cards form a royal flush
   * @returns The cards forming a royal flush, or null if no royal flush
   */
  static findRoyalFlush(cards: Card[]): Card[] | null {
    const straightFlush = this.findStraightFlush(cards, true);

    if (straightFlush && straightFlush[0].getValue(true) === 14) {
      return straightFlush;
    }

    return null;
  }

  /**
   * Checks if the given cards form a full house
   * @returns Array with [trips, pair] if found, or null if no full house
   */
  static findFullHouse(cards: Card[]): [Card[], Card[]] | null {
    const groups = this.groupByRank(cards);
    const rankCounts: { rank: Rank; count: number }[] = [];

    for (const [rank, sameRankCards] of groups) {
      rankCounts.push({ rank, count: sameRankCards.length });
    }

    // Sort by count (descending), then by rank value (descending)
    rankCounts.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }

      const cardA = new Card(Suit.SPADES, a.rank);
      const cardB = new Card(Suit.SPADES, b.rank);
      return cardB.getValue() - cardA.getValue();
    });

    // Find at least one three of a kind and at least one pair
    const threeOfAKindRank = rankCounts.find((rc) => rc.count >= 3)?.rank;
    if (!threeOfAKindRank) {
      return null;
    }

    const pairRank = rankCounts.find(
      (rc) => rc.count >= 2 && rc.rank !== threeOfAKindRank
    )?.rank;
    if (!pairRank) {
      return null;
    }

    const threeOfAKindCards = groups.get(threeOfAKindRank)!.slice(0, 3);
    const pairCards = groups.get(pairRank)!.slice(0, 2);

    return [threeOfAKindCards, pairCards];
  }

  /**
   * Finds the best 5-card hand from the given cards
   * @param cards Array of cards to evaluate
   * @param aceHigh Whether to treat Ace as high card
   * @returns Object with hand rank, description, and best 5 cards
   */
  static evaluateHighHand(
    cards: Card[],
    aceHigh: boolean = true
  ): {
    rank: HandRank;
    rankValue: number;
    description: string;
    bestCards: Card[];
    tiebreakers: number[];
  } {
    // Check for royal flush
    const royalFlush = this.findRoyalFlush(cards);
    if (royalFlush) {
      return {
        rank: HandRank.ROYAL_FLUSH,
        rankValue: 10,
        description: "Royal Flush",
        bestCards: royalFlush,
        tiebreakers: [], // No tiebreaker needed for royal flush
      };
    }

    // Check for straight flush
    const straightFlush = this.findStraightFlush(cards, aceHigh);
    if (straightFlush) {
      const highCard = straightFlush[0];
      return {
        rank: HandRank.STRAIGHT_FLUSH,
        rankValue: 9,
        description: `Straight Flush, ${highCard.rank} high`,
        bestCards: straightFlush,
        tiebreakers: [highCard.getValue(aceHigh)],
      };
    }

    // Check for four of a kind
    const fourOfAKind = this.findFourOfAKinds(cards);
    if (fourOfAKind.length > 0) {
      // Sort quads by rank value (highest first)
      fourOfAKind.sort(
        (a, b) => b[0].getValue(aceHigh) - a[0].getValue(aceHigh)
      );

      const quad = fourOfAKind[0];
      const quadRank = quad[0].rank;

      // Find the highest kicker
      const kickers = cards.filter((card) => card.rank !== quadRank);
      this.sortByRank(kickers, aceHigh);
      const kicker = kickers.length > 0 ? kickers[0] : null;

      const bestCards = [...quad];
      if (kicker) {
        bestCards.push(kicker);
      }

      return {
        rank: HandRank.FOUR_OF_A_KIND,
        rankValue: 8,
        description: `Four of a Kind, ${quadRank}s`,
        bestCards,
        tiebreakers: [
          quad[0].getValue(aceHigh),
          kicker ? kicker.getValue(aceHigh) : 0,
        ],
      };
    }

    // Check for full house
    const fullHouse = this.findFullHouse(cards);
    if (fullHouse) {
      const [trips, pair] = fullHouse;
      return {
        rank: HandRank.FULL_HOUSE,
        rankValue: 7,
        description: `Full House, ${trips[0].rank}s over ${pair[0].rank}s`,
        bestCards: [...trips, ...pair],
        tiebreakers: [trips[0].getValue(aceHigh), pair[0].getValue(aceHigh)],
      };
    }

    // Check for flush
    const flush = this.findFlush(cards);
    if (flush) {
      return {
        rank: HandRank.FLUSH,
        rankValue: 6,
        description: `Flush, ${flush[0].rank} high`,
        bestCards: flush,
        tiebreakers: flush.map((card) => card.getValue(aceHigh)),
      };
    }

    // Check for straight
    const straight = this.findStraight(cards, aceHigh);
    if (straight) {
      const highCard = straight[0];
      return {
        rank: HandRank.STRAIGHT,
        rankValue: 5,
        description: `Straight, ${highCard.rank} high`,
        bestCards: straight,
        tiebreakers: [highCard.getValue(aceHigh)],
      };
    }

    // Check for three of a kind
    const threeOfAKinds = this.findThreeOfAKinds(cards);
    if (threeOfAKinds.length > 0) {
      // Sort trips by rank value (highest first)
      threeOfAKinds.sort(
        (a, b) => b[0].getValue(aceHigh) - a[0].getValue(aceHigh)
      );

      const trips = threeOfAKinds[0];
      const tripsRank = trips[0].rank;

      // Find the two highest kickers
      const kickers = cards.filter((card) => card.rank !== tripsRank);
      this.sortByRank(kickers, aceHigh);
      const bestKickers = kickers.slice(0, 2);

      return {
        rank: HandRank.THREE_OF_A_KIND,
        rankValue: 4,
        description: `Three of a Kind, ${tripsRank}s`,
        bestCards: [...trips, ...bestKickers],
        tiebreakers: [
          trips[0].getValue(aceHigh),
          ...bestKickers.map((card) => card.getValue(aceHigh)),
        ],
      };
    }

    // Check for two pair
    const pairs = this.findPairs(cards);
    if (pairs.length >= 2) {
      // Sort pairs by rank value (highest first)
      pairs.sort((a, b) => b[0].getValue(aceHigh) - a[0].getValue(aceHigh));

      const firstPair = pairs[0];
      const secondPair = pairs[1];

      // Find the highest kicker
      const kickers = cards.filter(
        (card) =>
          card.rank !== firstPair[0].rank && card.rank !== secondPair[0].rank
      );
      this.sortByRank(kickers, aceHigh);
      const kicker = kickers.length > 0 ? kickers[0] : null;

      const bestCards = [...firstPair, ...secondPair];
      if (kicker) {
        bestCards.push(kicker);
      }

      return {
        rank: HandRank.TWO_PAIR,
        rankValue: 3,
        description: `Two Pair, ${firstPair[0].rank}s and ${secondPair[0].rank}s`,
        bestCards,
        tiebreakers: [
          firstPair[0].getValue(aceHigh),
          secondPair[0].getValue(aceHigh),
          kicker ? kicker.getValue(aceHigh) : 0,
        ],
      };
    }

    // Check for one pair
    if (pairs.length === 1) {
      const pair = pairs[0];
      const pairRank = pair[0].rank;

      // Find the three highest kickers
      const kickers = cards.filter((card) => card.rank !== pairRank);
      this.sortByRank(kickers, aceHigh);
      const bestKickers = kickers.slice(0, 3);

      return {
        rank: HandRank.PAIR,
        rankValue: 2,
        description: `Pair of ${pairRank}s`,
        bestCards: [...pair, ...bestKickers],
        tiebreakers: [
          pair[0].getValue(aceHigh),
          ...bestKickers.map((card) => card.getValue(aceHigh)),
        ],
      };
    }

    // High card
    const sortedCards = this.sortByRank(cards, aceHigh);
    const bestFive = sortedCards.slice(0, 5);

    return {
      rank: HandRank.HIGH_CARD,
      rankValue: 1,
      description: `High Card, ${bestFive[0].rank}`,
      bestCards: bestFive,
      tiebreakers: bestFive.map((card) => card.getValue(aceHigh)),
    };
  }

  /**
   * Evaluates a low hand (for hi-lo games)
   * Default implementation uses "8 or better" rule
   * @param cards Cards to evaluate
   * @param qualifier Maximum rank value to qualify (typically 8)
   * @returns Low hand evaluation result
   */
  static evaluateLowHand(
    cards: Card[],
    qualifier: number = 8
  ): {
    valid: boolean;
    rankValue: number;
    description: string;
    bestCards: Card[];
    tiebreakers: number[];
  } {
    if (cards.length < 5) {
      return {
        valid: false,
        rankValue: 0,
        description: "Not enough cards for a low hand",
        bestCards: [],
        tiebreakers: [],
      };
    }

    // Filter cards by qualifier (only cards with value <= qualifier)
    const eligibleCards = cards.filter((card) => {
      const value = card.getValue(true);
      return value <= qualifier || value === 14; // Ace counts as low
    });

    // Group by rank to check for pairs
    const rankGroups = this.groupByRank(eligibleCards);

    // Extract only one card per rank (we don't want pairs in a low hand)
    const uniqueRankCards: Card[] = [];
    for (const [_, sameRankCards] of rankGroups) {
      uniqueRankCards.push(sameRankCards[0]);
    }

    // For Ace, ensure it's treated as low (value 1)
    const sortedCards = uniqueRankCards.sort((a, b) => {
      let valueA = a.getValue(true);
      let valueB = b.getValue(true);

      // Treat Ace as 1 for low hand
      if (valueA === 14) valueA = 1;
      if (valueB === 14) valueB = 1;

      return valueA - valueB; // Sort ascending for low hand
    });

    // Check if we have at least 5 cards with distinct ranks
    if (sortedCards.length < 5) {
      return {
        valid: false,
        rankValue: 0,
        description: "Not enough cards for a low hand",
        bestCards: [],
        tiebreakers: [],
      };
    }

    // Take the 5 lowest cards
    const bestFive = sortedCards.slice(0, 5);

    // Check if all cards are 8 or lower (or Ace)
    const allQualify = bestFive.every((card) => {
      const value = card.getValue(true);
      return value <= qualifier || value === 14; // Ace counts as low
    });

    if (!allQualify) {
      return {
        valid: false,
        rankValue: 0,
        description: "Does not qualify as a low hand",
        bestCards: [],
        tiebreakers: [],
      };
    }

    // Calculate low hand value (lower is better)
    // Use bit representation: each bit position represents a card value
    let handValue = 0;

    for (const card of bestFive) {
      let value = card.getValue(true);
      if (value === 14) value = 1; // Ace is low

      // Set the bit for this card value
      handValue = value;
    }

    return {
      valid: true,
      rankValue: handValue,
      description: `${bestFive[0].rank} low`,
      bestCards: bestFive,
      tiebreakers: bestFive.map((card) => {
        let value = card.getValue(true);
        return value === 14 ? 1 : value; // Ace is low (1)
      }),
    };
  }

  /**
   * Generates all possible 5-card combinations from the given cards
   * @param cards Array of cards
   * @returns Array of 5-card combinations
   */
  static generateCombinations(cards: Card[], r: number = 5): Card[][] {
    const combinations: Card[][] = [];

    function backtrack(start: number, current: Card[]) {
      if (current.length === r) {
        combinations.push([...current]);
        return;
      }

      for (let i = start; i < cards.length; i++) {
        current.push(cards[i]);
        backtrack(i + 1, current);
        current.pop();
      }
    }

    backtrack(0, []);
    return combinations;
  }

  /**
   * Generates all valid hand combinations according to Omaha rules
   * (Must use exactly 2 hole cards and 3 community cards)
   */
  static generateOmahaCombinations(
    holeCards: Card[],
    communityCards: Card[]
  ): Card[][] {
    // Generate all 2-card combinations from hole cards
    const holeCombinations = this.generateCombinations(holeCards, 2);

    // Generate all 3-card combinations from community cards
    const communityCombinations = this.generateCombinations(communityCards, 3);

    // Combine each hole card combination with each community card combination
    const allCombinations: Card[][] = [];
    for (const holeComb of holeCombinations) {
      for (const communityComb of communityCombinations) {
        allCombinations.push([...holeComb, ...communityComb]);
      }
    }

    return allCombinations;
  }
}
