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
    tiebreakers: number[];
    bestCards: Card[];
}
/**
 * Interface for a low hand evaluation result (used in hi-lo games)
 */
export interface LowHandEvaluationResult {
    valid: boolean;
    rankValue: number;
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
    evaluateLow?: boolean;
    lowHandQualifier?: number;
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
    compareHands(hand1: HandEvaluationResult, hand2: HandEvaluationResult): number;
    /**
     * For hi-lo games, evaluates both high and low hands
     * @returns Both high and low hand evaluations
     */
    evaluateHiLo?(hand: Hand, communityCards: Card[]): HiLoEvaluationResult;
}
/**
 * Abstract base class for hand evaluators
 */
export declare abstract class HandEvaluator implements IHandEvaluator {
    protected options: HandEvaluatorOptions;
    constructor(options?: HandEvaluatorOptions);
    /**
     * Each poker variant implements its own evaluation logic
     */
    abstract evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult;
    /**
     * Default comparison logic - can be overridden by specific variants
     */
    compareHands(hand1: HandEvaluationResult, hand2: HandEvaluationResult): number;
    /**
     * Evaluates low hands for hi-lo games
     * Default implementation that can be overridden
     */
    evaluateLowHand(cards: Card[]): LowHandEvaluationResult;
    /**
     * Default hi-lo evaluation that can be overridden
     */
    evaluateHiLo(hand: Hand, communityCards: Card[]): HiLoEvaluationResult;
}
