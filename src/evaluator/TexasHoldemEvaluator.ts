import { Card, Hand } from "../models";
import {
  HandEvaluationResult,
  HandEvaluator,
  HandEvaluatorOptions,
  LowHandEvaluationResult,
} from "./HandEvaluator";
import { HandUtils } from "./HandUtils";

/**
 * Hand evaluator for Texas Hold'em
 * In Hold'em, the best 5-card hand is chosen from 7 cards (2 hole cards + 5 community cards)
 */
export class TexasHoldemEvaluator extends HandEvaluator {
  constructor(options: HandEvaluatorOptions = {}) {
    super(options);
  }

  /**
   * Evaluates a Texas Hold'em hand
   * @param hand Player's hand (hole cards)
   * @param communityCards Community cards on the table
   * @returns The best 5-card hand evaluation
   */
  evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult {
    // Combine hole cards and community cards
    const allCards = [...hand.cards, ...communityCards];

    // Generate all possible 5-card combinations
    const combinations = HandUtils.generateCombinations(
      allCards,
      Math.min(allCards.length, 5)
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
   * Evaluates a low hand for Texas Hold'em Hi-Lo
   * @param cards All available cards (hole + community)
   * @returns Low hand evaluation result
   */
  override evaluateLowHand(cards: Card[]): LowHandEvaluationResult {
    // Generate all possible 5-card combinations
    const combinations = HandUtils.generateCombinations(
      cards,
      Math.min(cards.length, 5)
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
}
