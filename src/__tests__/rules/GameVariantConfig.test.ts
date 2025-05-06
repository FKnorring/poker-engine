import {
  GameVariantConfig,
  createGameVariantConfig,
  GAME_VARIANTS,
} from "../../rules/GameVariantConfig";
import { BettingStructure, GameVariant } from "../../types";
import { OmahaEvaluator, TexasHoldemEvaluator } from "../../evaluator";

describe("GameVariantConfig", () => {
  describe("createGameVariantConfig", () => {
    it("should create a valid Texas Hold'em no limit configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.TEXAS_HOLDEM,
        BettingStructure.NO_LIMIT
      );

      expect(config.name).toBe("No-Limit Texas Hold'em");
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.NO_LIMIT);
      expect(config.cardsPerPlayer).toBe(2);
      expect(config.communityCards).toBe(5);
      expect(config.minPlayers).toBe(2);
      expect(config.maxPlayers).toBe(10);
      expect(config.evaluator).toBeInstanceOf(TexasHoldemEvaluator);
      expect(config.smallBlindMultiplier).toBe(0.5);
      expect(config.minRaiseMultiplier).toBe(1);
      expect(config.description).toContain("most popular poker variant");
      expect(config.rules).toContain("Each player receives 2 hole cards.");
      expect(config.rules).toContain(
        "No Limit: Players can bet any amount up to their entire stack at any time."
      );
    });

    it("should create a valid Texas Hold'em pot limit configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.TEXAS_HOLDEM,
        BettingStructure.POT_LIMIT
      );

      expect(config.name).toBe("Pot-Limit Texas Hold'em");
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.POT_LIMIT);
      expect(config.rules).toContain(
        "Pot Limit: The maximum bet is the size of the current pot."
      );
    });

    it("should create a valid Texas Hold'em fixed limit configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.TEXAS_HOLDEM,
        BettingStructure.FIXED_LIMIT
      );

      expect(config.name).toBe("Fixed-Limit Texas Hold'em");
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.FIXED_LIMIT);
      expect(config.rules).toContain(
        "Fixed Limit: Bets and raises are in fixed increments, with larger bets on later streets."
      );
    });

    it("should create a valid Texas Hold'em Hi-Lo configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.TEXAS_HOLDEM,
        BettingStructure.NO_LIMIT,
        true, // Hi-Lo
        8 // 8 or better for low
      );

      expect(config.name).toBe("No-Limit Texas Hold'em Hi-Lo");
      expect(config.rules).toContain(
        "The pot is split between the best high hand and the best qualifying low hand (8 or better)."
      );
      expect(config.rules).toContain(
        "For low hands, straights and flushes don't count against you, and Aces are low."
      );

      const evaluator = config.evaluator as TexasHoldemEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(true);
      expect(evaluator["options"].lowHandQualifier).toBe(8);
    });

    it("should create a valid Omaha configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.OMAHA,
        BettingStructure.POT_LIMIT
      );

      expect(config.name).toBe("Pot-Limit Omaha");
      expect(config.variant).toBe(GameVariant.OMAHA);
      expect(config.bettingStructure).toBe(BettingStructure.POT_LIMIT);
      expect(config.cardsPerPlayer).toBe(4);
      expect(config.communityCards).toBe(5);
      expect(config.evaluator).toBeInstanceOf(OmahaEvaluator);
      expect(config.rules).toContain("Each player receives 4 hole cards.");
      expect(config.rules).toContain(
        "Players must use exactly 2 of their hole cards and exactly 3 of the community cards."
      );
    });

    it("should create a valid Omaha Hi-Lo configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.OMAHA,
        BettingStructure.POT_LIMIT,
        true, // Hi-Lo
        8 // 8 or better for low
      );

      expect(config.name).toBe("Pot-Limit Omaha Hi-Lo");
      expect(config.rules).toContain(
        "The pot is split between the best high hand and the best qualifying low hand (8 or better)."
      );

      const evaluator = config.evaluator as OmahaEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(true);
      expect(evaluator["options"].lowHandQualifier).toBe(8);
    });

    it("should create a valid 7-Card Stud configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.SEVEN_CARD_STUD,
        BettingStructure.FIXED_LIMIT
      );

      expect(config.name).toBe("Fixed-Limit 7-Card Stud");
      expect(config.variant).toBe(GameVariant.SEVEN_CARD_STUD);
      expect(config.bettingStructure).toBe(BettingStructure.FIXED_LIMIT);
      expect(config.cardsPerPlayer).toBe(7);
      expect(config.communityCards).toBe(0);
      expect(config.minPlayers).toBe(2);
      expect(config.maxPlayers).toBe(8);
      expect(config.evaluator).toBeInstanceOf(TexasHoldemEvaluator);
      expect(config.rules).toContain("Each player receives 7 cards in total.");
    });

    it("should create a valid 7-Card Stud Hi-Lo configuration", () => {
      const config = createGameVariantConfig(
        GameVariant.SEVEN_CARD_STUD,
        BettingStructure.FIXED_LIMIT,
        true, // Hi-Lo
        8 // 8 or better for low
      );

      expect(config.name).toBe("Fixed-Limit 7-Card Stud Hi-Lo");
      expect(config.rules).toContain(
        "The pot is split between the best high hand and the best qualifying low hand (8 or better)."
      );
    });

    it("should throw an error for invalid game variant", () => {
      expect(() => {
        createGameVariantConfig(
          "INVALID_VARIANT" as GameVariant,
          BettingStructure.NO_LIMIT
        );
      }).toThrow("Unsupported game variant");
    });

    it("should throw an error for invalid betting structure", () => {
      expect(() => {
        createGameVariantConfig(
          GameVariant.TEXAS_HOLDEM,
          "INVALID_STRUCTURE" as BettingStructure
        );
      }).toThrow("Unsupported betting structure");
    });
  });

  describe("GAME_VARIANTS", () => {
    it("should export predefined Texas Hold'em No Limit", () => {
      const config = GAME_VARIANTS.TEXAS_HOLDEM_NO_LIMIT;
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.NO_LIMIT);
    });

    it("should export predefined Texas Hold'em Pot Limit", () => {
      const config = GAME_VARIANTS.TEXAS_HOLDEM_POT_LIMIT;
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.POT_LIMIT);
    });

    it("should export predefined Texas Hold'em Fixed Limit", () => {
      const config = GAME_VARIANTS.TEXAS_HOLDEM_FIXED_LIMIT;
      expect(config.variant).toBe(GameVariant.TEXAS_HOLDEM);
      expect(config.bettingStructure).toBe(BettingStructure.FIXED_LIMIT);
    });

    it("should export predefined Omaha Pot Limit", () => {
      const config = GAME_VARIANTS.OMAHA_POT_LIMIT;
      expect(config.variant).toBe(GameVariant.OMAHA);
      expect(config.bettingStructure).toBe(BettingStructure.POT_LIMIT);

      const evaluator = config.evaluator as OmahaEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(false);
    });

    it("should export predefined Omaha Hi-Lo Pot Limit", () => {
      const config = GAME_VARIANTS.OMAHA_HI_LO_POT_LIMIT;
      expect(config.variant).toBe(GameVariant.OMAHA);
      expect(config.bettingStructure).toBe(BettingStructure.POT_LIMIT);

      const evaluator = config.evaluator as OmahaEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(true);
      expect(evaluator["options"].lowHandQualifier).toBe(8);
    });

    it("should export predefined 7-Card Stud", () => {
      const config = GAME_VARIANTS.SEVEN_CARD_STUD;
      expect(config.variant).toBe(GameVariant.SEVEN_CARD_STUD);
      expect(config.bettingStructure).toBe(BettingStructure.FIXED_LIMIT);

      const evaluator = config.evaluator as TexasHoldemEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(false);
    });

    it("should export predefined 7-Card Stud Hi-Lo", () => {
      const config = GAME_VARIANTS.SEVEN_CARD_STUD_HI_LO;
      expect(config.variant).toBe(GameVariant.SEVEN_CARD_STUD);
      expect(config.bettingStructure).toBe(BettingStructure.FIXED_LIMIT);

      const evaluator = config.evaluator as TexasHoldemEvaluator;
      expect(evaluator["options"].evaluateLow).toBe(true);
      expect(evaluator["options"].lowHandQualifier).toBe(8);
    });
  });
});
