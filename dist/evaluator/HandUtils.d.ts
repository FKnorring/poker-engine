import { Card } from "../models";
import { HandRank, Rank, Suit } from "../types";
/**
 * Utility functions for poker hand evaluation
 */
export declare class HandUtils {
    /**
     * Groups cards by rank
     * @returns Map where key is rank and value is array of cards with that rank
     */
    static groupByRank(cards: Card[]): Map<Rank, Card[]>;
    /**
     * Groups cards by suit
     * @returns Map where key is suit and value is array of cards with that suit
     */
    static groupBySuit(cards: Card[]): Map<Suit, Card[]>;
    /**
     * Sorts cards by rank (highest to lowest)
     * @param aceHigh Whether to treat Ace as high card (default: true)
     */
    static sortByRank(cards: Card[], aceHigh?: boolean): Card[];
    /**
     * Finds all pairs in the given cards
     * @returns Array of pairs (each pair is an array of 2 cards)
     */
    static findPairs(cards: Card[]): Card[][];
    /**
     * Finds all three of a kinds in the given cards
     * @returns Array of trips (each trip is an array of 3 cards)
     */
    static findThreeOfAKinds(cards: Card[]): Card[][];
    /**
     * Finds all four of a kinds in the given cards
     * @returns Array of quads (each quad is an array of 4 cards)
     */
    static findFourOfAKinds(cards: Card[]): Card[][];
    /**
     * Checks if the given cards form a straight
     * @param aceHigh Whether to treat Ace as high card (default: true)
     * @returns The cards forming a straight, ordered from highest to lowest, or null if no straight
     */
    static findStraight(cards: Card[], aceHigh?: boolean): Card[] | null;
    /**
     * Checks if the given cards form a flush
     * @returns The cards forming a flush (5 cards of the same suit), or null if no flush
     */
    static findFlush(cards: Card[]): Card[] | null;
    /**
     * Checks if the given cards form a straight flush
     * @param aceHigh Whether to treat Ace as high card
     * @returns The cards forming a straight flush, or null if no straight flush
     */
    static findStraightFlush(cards: Card[], aceHigh?: boolean): Card[] | null;
    /**
     * Checks if the given cards form a royal flush
     * @returns The cards forming a royal flush, or null if no royal flush
     */
    static findRoyalFlush(cards: Card[]): Card[] | null;
    /**
     * Checks if the given cards form a full house
     * @returns Array with [trips, pair] if found, or null if no full house
     */
    static findFullHouse(cards: Card[]): [Card[], Card[]] | null;
    /**
     * Finds the best 5-card hand from the given cards
     * @param cards Array of cards to evaluate
     * @param aceHigh Whether to treat Ace as high card
     * @returns Object with hand rank, description, and best 5 cards
     */
    static evaluateHighHand(cards: Card[], aceHigh?: boolean): {
        rank: HandRank;
        rankValue: number;
        description: string;
        bestCards: Card[];
        tiebreakers: number[];
    };
    /**
     * Evaluates a low hand (for hi-lo games)
     * Default implementation uses "8 or better" rule
     * @param cards Cards to evaluate
     * @param qualifier Maximum rank value to qualify (typically 8)
     * @returns Low hand evaluation result
     */
    static evaluateLowHand(cards: Card[], qualifier?: number): {
        valid: boolean;
        rankValue: number;
        description: string;
        bestCards: Card[];
        tiebreakers: number[];
    };
    /**
     * Generates all possible 5-card combinations from the given cards
     * @param cards Array of cards
     * @returns Array of 5-card combinations
     */
    static generateCombinations(cards: Card[], r?: number): Card[][];
    /**
     * Generates all valid hand combinations according to Omaha rules
     * (Must use exactly 2 hole cards and 3 community cards)
     */
    static generateOmahaCombinations(holeCards: Card[], communityCards: Card[]): Card[][];
}
