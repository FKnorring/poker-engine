import { HandEvaluator } from "../evaluator";
import { BettingStructure, GameVariant } from "../types";
/**
 * Interface for game variant configuration
 */
export interface GameVariantConfig {
    name: string;
    variant: GameVariant;
    bettingStructure: BettingStructure;
    minPlayers: number;
    maxPlayers: number;
    cardsPerPlayer: number;
    communityCards: number;
    evaluator: HandEvaluator;
    smallBlindMultiplier: number;
    minRaiseMultiplier: number;
    description: string;
    rules: string[];
}
/**
 * Factory function to create a game variant configuration
 */
export declare function createGameVariantConfig(variant: GameVariant, bettingStructure: BettingStructure, evaluateHiLo?: boolean, lowHandQualifier?: number): GameVariantConfig;
/**
 * Predefined game configurations
 */
export declare const GAME_VARIANTS: {
    TEXAS_HOLDEM_NO_LIMIT: GameVariantConfig;
    TEXAS_HOLDEM_POT_LIMIT: GameVariantConfig;
    TEXAS_HOLDEM_FIXED_LIMIT: GameVariantConfig;
    OMAHA_POT_LIMIT: GameVariantConfig;
    OMAHA_HI_LO_POT_LIMIT: GameVariantConfig;
    SEVEN_CARD_STUD: GameVariantConfig;
    SEVEN_CARD_STUD_HI_LO: GameVariantConfig;
};
