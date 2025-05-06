import { Card, Hand } from "../models";
import { HandEvaluationResult, HandEvaluator, HandEvaluatorOptions, LowHandEvaluationResult } from "./HandEvaluator";
/**
 * Hand evaluator for Texas Hold'em
 * In Hold'em, the best 5-card hand is chosen from 7 cards (2 hole cards + 5 community cards)
 */
export declare class TexasHoldemEvaluator extends HandEvaluator {
    constructor(options?: HandEvaluatorOptions);
    /**
     * Evaluates a Texas Hold'em hand
     * @param hand Player's hand (hole cards)
     * @param communityCards Community cards on the table
     * @returns The best 5-card hand evaluation
     */
    evaluate(hand: Hand, communityCards: Card[]): HandEvaluationResult;
    /**
     * Evaluates a low hand for Texas Hold'em Hi-Lo
     * @param cards All available cards (hole + community)
     * @returns Low hand evaluation result
     */
    evaluateLowHand(cards: Card[]): LowHandEvaluationResult;
}
