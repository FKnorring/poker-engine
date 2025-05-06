import { Card, Hand } from "../models";
import {
  HandEvaluationResult,
  HandEvaluator,
  HandEvaluatorOptions,
  LowHandEvaluationResult,
} from "./HandEvaluator";
import { HandUtils } from "./HandUtils";

/**
 * Hand evaluator for Omaha and Omaha Hi-Lo
 * In Omaha, must use exactly 2 hole cards and 3 community cards
 */
export class OmahaEvaluator extends HandEvaluator {
  constructor(options: HandEvaluatorOptions = {}) {
    super(options);
  }

  /**
   * Evaluates an Omaha hand
   * @param hand Player's hand (4 hole cards)
   * @param communityCards Community cards on the table (5 cards)
   * @returns The best 5-card hand evaluation
   */
  evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult {
    // Validate inputs
    if (hand.cards.length !== 4) {
      throw new Error("Omaha requires exactly 4 hole cards");
    }

    // Generate all valid Omaha combinations (2 from hole, 3 from community)
    const combinations = HandUtils.generateOmahaCombinations(
      hand.cards,
      communityCards
    );

    // Evaluate each combination and find the best one
    let bestHandResult = HandUtils.evaluateHighHand(
      combinations[0],
      this.options.acesLow !== true
    );

    for (let i = 1; i < combinations.length; i++) {
      const currentHandResult = HandUtils.evaluateHighHand(
        combinations[i],
        this.options.acesLow !== true
      );

      if (
        this.compareHands(
          { ...currentHandResult, hand },
          { ...bestHandResult, hand }
        ) > 0
      ) {
        bestHandResult = currentHandResult;
      }
    }

    // Return the best hand evaluation with the original hand
    return {
      hand,
      rank: bestHandResult.rank,
      rankValue: bestHandResult.rankValue,
      description: bestHandResult.description,
      bestCards: bestHandResult.bestCards,
      tiebreakers: bestHandResult.tiebreakers,
    };
  }

  /**
   * Evaluates a low hand for Omaha Hi-Lo
   * @param cards All cards available (should include both hole and community cards)
   * @returns Low hand evaluation result
   */
  override evaluateLowHand(cards: Card[]): LowHandEvaluationResult {
    // For Omaha, we need to separate hole cards and community cards
    // Assuming the first 4 cards are hole cards and the rest are community
    if (cards.length < 9) {
      // 4 hole + 5 community
      return {
        valid: false,
        rankValue: 0,
        description: "Not enough cards for Omaha low evaluation",
        bestCards: [],
        tiebreakers: [],
      };
    }

    const holeCards = cards.slice(0, 4);
    const communityCards = cards.slice(4);

    // Generate all valid Omaha combinations
    const combinations = HandUtils.generateOmahaCombinations(
      holeCards,
      communityCards
    );

    // Evaluate each combination as a low hand
    let bestLowHand: LowHandEvaluationResult | null = null;

    for (const combo of combinations) {
      const lowEval = HandUtils.evaluateLowHand(
        combo,
        this.options.lowHandQualifier
      );

      // If this is a valid low hand and better than our current best
      if (
        lowEval.valid &&
        (!bestLowHand || lowEval.rankValue < bestLowHand.rankValue)
      ) {
        bestLowHand = lowEval;
      }
    }

    // If no valid low hand was found, return an invalid result
    if (!bestLowHand) {
      return {
        valid: false,
        rankValue: 0,
        description: "No qualifying low hand",
        bestCards: [],
        tiebreakers: [],
      };
    }

    return bestLowHand;
  }

  /**
   * Evaluates both high and low hands for Omaha Hi-Lo
   * @param hand Player's hand (4 hole cards)
   * @param communityCards Community cards on the table (5 cards)
   * @returns Both high and low hand evaluations
   */
  override evaluateHiLo(
    hand: Hand,
    communityCards: Card[]
  ): {
    highHand: HandEvaluationResult;
    lowHand: LowHandEvaluationResult | null;
  } {
    // Evaluate high hand
    const highHand = this.evaluate(hand, communityCards);

    // Evaluate low hand if required
    let lowHand = null;
    if (this.options.evaluateLow) {
      // Combine hole cards and community cards for low evaluation
      // Order matters here - we expect hole cards first
      lowHand = this.evaluateLowHand([...hand.cards, ...communityCards]);
      // If low hand is not valid, set to null
      if (!lowHand.valid) {
        lowHand = null;
      }
    }

    return { highHand, lowHand };
  }
}
