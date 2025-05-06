import {
  HandEvaluator,
  OmahaEvaluator,
  TexasHoldemEvaluator,
} from "../evaluator";
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
  smallBlindMultiplier: number; // Relative to the big blind
  minRaiseMultiplier: number; // Minimum raise is this multiple of the big blind
  description: string;
  rules: string[];
}

/**
 * Factory function to create a game variant configuration
 */
export function createGameVariantConfig(
  variant: GameVariant,
  bettingStructure: BettingStructure,
  evaluateHiLo: boolean = false,
  lowHandQualifier: number = 8
): GameVariantConfig {
  // Default configuration values
  const config: Partial<GameVariantConfig> = {
    variant,
    bettingStructure,
    smallBlindMultiplier: 0.5,
    minRaiseMultiplier: 1,
  };

  // Configure based on variant
  switch (variant) {
    case GameVariant.TEXAS_HOLDEM:
      config.name = `${getBettingStructureName(
        bettingStructure
      )} Texas Hold'em${evaluateHiLo ? " Hi-Lo" : ""}`;
      config.cardsPerPlayer = 2;
      config.communityCards = 5;
      config.minPlayers = 2;
      config.maxPlayers = 10;
      config.evaluator = new TexasHoldemEvaluator({
        evaluateLow: evaluateHiLo,
        lowHandQualifier,
      });
      config.description =
        "The most popular poker variant. Each player gets 2 hole cards and combines them with 5 community cards.";
      config.rules = [
        "Each player receives 2 hole cards.",
        "5 community cards are dealt face up in the middle.",
        "Players make the best 5-card hand using any combination of their hole cards and the community cards.",
      ];
      if (evaluateHiLo) {
        config.rules.push(
          `The pot is split between the best high hand and the best qualifying low hand (${lowHandQualifier} or better).`,
          "For low hands, straights and flushes don't count against you, and Aces are low."
        );
      }
      break;

    case GameVariant.OMAHA:
      config.name = `${getBettingStructureName(bettingStructure)} Omaha${
        evaluateHiLo ? " Hi-Lo" : ""
      }`;
      config.cardsPerPlayer = 4;
      config.communityCards = 5;
      config.minPlayers = 2;
      config.maxPlayers = 10;
      config.evaluator = new OmahaEvaluator({
        evaluateLow: evaluateHiLo,
        lowHandQualifier,
      });
      config.description =
        "A variant where players must use exactly 2 of their 4 hole cards and 3 of the 5 community cards.";
      config.rules = [
        "Each player receives 4 hole cards.",
        "5 community cards are dealt face up in the middle.",
        "Players must use exactly 2 of their hole cards and exactly 3 of the community cards.",
      ];
      if (evaluateHiLo) {
        config.rules.push(
          `The pot is split between the best high hand and the best qualifying low hand (${lowHandQualifier} or better).`,
          "For low hands, straights and flushes don't count against you, and Aces are low."
        );
      }
      break;

    case GameVariant.SEVEN_CARD_STUD:
      config.name = `${getBettingStructureName(bettingStructure)} 7-Card Stud${
        evaluateHiLo ? " Hi-Lo" : ""
      }`;
      config.cardsPerPlayer = 7;
      config.communityCards = 0;
      config.minPlayers = 2;
      config.maxPlayers = 8;
      config.evaluator = new TexasHoldemEvaluator({
        evaluateLow: evaluateHiLo,
        lowHandQualifier,
      });
      config.description =
        "A classic poker variant where players receive 7 cards, with some face up and some face down.";
      config.rules = [
        "Each player receives 7 cards in total.",
        "2 cards face down, 1 card face up, followed by 3 more face up, and 1 final card face down.",
        "Players make the best 5-card hand from their 7 cards.",
      ];
      if (evaluateHiLo) {
        config.rules.push(
          `The pot is split between the best high hand and the best qualifying low hand (${lowHandQualifier} or better).`,
          "For low hands, straights and flushes don't count against you, and Aces are low."
        );
      }
      break;

    default:
      throw new Error(`Unsupported game variant: ${variant}`);
  }

  // Configure based on betting structure
  switch (bettingStructure) {
    case BettingStructure.NO_LIMIT:
      config.rules.push(
        "No Limit: Players can bet any amount up to their entire stack at any time."
      );
      break;

    case BettingStructure.POT_LIMIT:
      config.rules.push(
        "Pot Limit: The maximum bet is the size of the current pot."
      );
      break;

    case BettingStructure.FIXED_LIMIT:
      config.rules.push(
        "Fixed Limit: Bets and raises are in fixed increments, with larger bets on later streets."
      );
      break;

    default:
      throw new Error(`Unsupported betting structure: ${bettingStructure}`);
  }

  return config as GameVariantConfig;
}

/**
 * Helper function to get a nice name for the betting structure
 */
function getBettingStructureName(bettingStructure: BettingStructure): string {
  switch (bettingStructure) {
    case BettingStructure.NO_LIMIT:
      return "No-Limit";
    case BettingStructure.POT_LIMIT:
      return "Pot-Limit";
    case BettingStructure.FIXED_LIMIT:
      return "Fixed-Limit";
    default:
      return "";
  }
}

/**
 * Predefined game configurations
 */
export const GAME_VARIANTS = {
  TEXAS_HOLDEM_NO_LIMIT: createGameVariantConfig(
    GameVariant.TEXAS_HOLDEM,
    BettingStructure.NO_LIMIT
  ),

  TEXAS_HOLDEM_POT_LIMIT: createGameVariantConfig(
    GameVariant.TEXAS_HOLDEM,
    BettingStructure.POT_LIMIT
  ),

  TEXAS_HOLDEM_FIXED_LIMIT: createGameVariantConfig(
    GameVariant.TEXAS_HOLDEM,
    BettingStructure.FIXED_LIMIT
  ),

  OMAHA_POT_LIMIT: createGameVariantConfig(
    GameVariant.OMAHA,
    BettingStructure.POT_LIMIT
  ),

  OMAHA_HI_LO_POT_LIMIT: createGameVariantConfig(
    GameVariant.OMAHA,
    BettingStructure.POT_LIMIT,
    true, // Hi-Lo
    8 // 8 or better for low
  ),

  SEVEN_CARD_STUD: createGameVariantConfig(
    GameVariant.SEVEN_CARD_STUD,
    BettingStructure.FIXED_LIMIT
  ),

  SEVEN_CARD_STUD_HI_LO: createGameVariantConfig(
    GameVariant.SEVEN_CARD_STUD,
    BettingStructure.FIXED_LIMIT,
    true, // Hi-Lo
    8 // 8 or better for low
  ),
};
