import { Card, Hand } from "../models";
import { HandRank } from "../types";

/**
 * Result of a hand evaluation, containing rank and detailed info
 */
export interface HandEvaluationResult {
  hand: Hand;
  rank: HandRank;
  rankValue: number;
  description: string;
  // Used for tie-breaking within the same rank
  // (e.g., pair of aces beats pair of kings)
  tiebreakers: number[];
  // Best 5 cards used (may differ from hand.cards depending on game rules)
  bestCards: Card[];
}

/**
 * Interface for a low hand evaluation result (used in hi-lo games)
 */
export interface LowHandEvaluationResult {
  valid: boolean; // Whether this hand qualifies as a low hand
  rankValue: number; // Lower is better for low hands
  description: string;
  bestCards: Card[];
  tiebreakers: number[];
}

/**
 * Interface for combined hi-lo evaluation result
 */
export interface HiLoEvaluationResult {
  highHand: HandEvaluationResult;
  lowHand: LowHandEvaluationResult | null;
}

/**
 * Configuration options for hand evaluators
 */
export interface HandEvaluatorOptions {
  // Whether to evaluate low hands
  evaluateLow?: boolean;
  // Card value threshold to qualify as a low hand (typically 8 - "eight or better")
  lowHandQualifier?: number;
  // Whether aces count as low in straights (A-5 straight)
  acesLow?: boolean;
}

/**
 * Base interface for all hand evaluators
 */
export interface IHandEvaluator {
  /**
   * Evaluates a hand according to the specific poker variant rules
   * @param hand The hand to evaluate
   * @param communityCards Community cards on the table
   * @returns Evaluation result
   */
  evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult;

  /**
   * Compares two hands and determines the winner
   * @returns Positive if hand1 wins, negative if hand2 wins, 0 for tie
   */
  compareHands(
    hand1: HandEvaluationResult,
    hand2: HandEvaluationResult
  ): number;

  /**
   * For hi-lo games, evaluates both high and low hands
   * @returns Both high and low hand evaluations
   */
  evaluateHiLo?(hand: Hand, communityCards: Card[]): HiLoEvaluationResult;
}

/**
 * Abstract base class for hand evaluators
 */
export abstract class HandEvaluator implements IHandEvaluator {
  protected options: HandEvaluatorOptions;

  constructor(options: HandEvaluatorOptions = {}) {
    this.options = {
      evaluateLow: false,
      lowHandQualifier: 8,
      acesLow: false,
      ...options,
    };
  }

  /**
   * Each poker variant implements its own evaluation logic
   */
  abstract evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult;

  /**
   * Default comparison logic - can be overridden by specific variants
   */
  compareHands(
    hand1: HandEvaluationResult,
    hand2: HandEvaluationResult
  ): number {
    // First compare by hand rank value (higher is better)
    if (hand1.rankValue !== hand2.rankValue) {
      return hand1.rankValue - hand2.rankValue;
    }

    // If rank values are the same, compare tiebreakers
    const minLength = Math.min(
      hand1.tiebreakers.length,
      hand2.tiebreakers.length
    );

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
  evaluateLowHand(cards: Card[]): LowHandEvaluationResult {
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
  evaluateHiLo(hand: Hand, communityCards: Card[]): HiLoEvaluationResult {
    const highHand = this.evaluate(hand, communityCards);
    let lowHand = null;

    if (this.options.evaluateLow) {
      lowHand = this.evaluateLowHand([...hand.cards, ...communityCards]);
    }

    return { highHand, lowHand };
  }
}
