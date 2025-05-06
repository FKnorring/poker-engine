import { Card, Hand } from "../models";
import { HandEvaluationResult, HandEvaluator, HandEvaluatorOptions, LowHandEvaluationResult } from "./HandEvaluator";
/**
 * Hand evaluator for Omaha and Omaha Hi-Lo
 * In Omaha, must use exactly 2 hole cards and 3 community cards
 */
export declare class OmahaEvaluator extends HandEvaluator {
    constructor(options?: HandEvaluatorOptions);
    /**
     * Evaluates an Omaha hand
     * @param hand Player's hand (4 hole cards)
     * @param communityCards Community cards on the table (5 cards)
     * @returns The best 5-card hand evaluation
     */
    evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult;
    /**
     * Evaluates a low hand for Omaha Hi-Lo
     * @param cards All cards available (should include both hole and community cards)
     * @returns Low hand evaluation result
     */
    evaluateLowHand(cards: Card[]): LowHandEvaluationResult;
    /**
     * Evaluates both high and low hands for Omaha Hi-Lo
     * @param hand Player's hand (4 hole cards)
     * @param communityCards Community cards on the table (5 cards)
     * @returns Both high and low hand evaluations
     */
    evaluateHiLo(hand: Hand, communityCards: Card[]): {
        highHand: HandEvaluationResult;
        lowHand: LowHandEvaluationResult | null;
    };
}
