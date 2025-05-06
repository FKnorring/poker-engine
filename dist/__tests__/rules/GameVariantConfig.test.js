"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameVariantConfig_1 = require("../../rules/GameVariantConfig");
const types_1 = require("../../types");
const evaluator_1 = require("../../evaluator");
describe("GameVariantConfig", () => {
    describe("createGameVariantConfig", () => {
        it("should create a valid Texas Hold'em no limit configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.TEXAS_HOLDEM, types_1.BettingStructure.NO_LIMIT);
            expect(config.name).toBe("No-Limit Texas Hold'em");
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.NO_LIMIT);
            expect(config.cardsPerPlayer).toBe(2);
            expect(config.communityCards).toBe(5);
            expect(config.minPlayers).toBe(2);
            expect(config.maxPlayers).toBe(10);
            expect(config.evaluator).toBeInstanceOf(evaluator_1.TexasHoldemEvaluator);
            expect(config.smallBlindMultiplier).toBe(0.5);
            expect(config.minRaiseMultiplier).toBe(1);
            expect(config.description).toContain("most popular poker variant");
            expect(config.rules).toContain("Each player receives 2 hole cards.");
            expect(config.rules).toContain("No Limit: Players can bet any amount up to their entire stack at any time.");
        });
        it("should create a valid Texas Hold'em pot limit configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.TEXAS_HOLDEM, types_1.BettingStructure.POT_LIMIT);
            expect(config.name).toBe("Pot-Limit Texas Hold'em");
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
            expect(config.rules).toContain("Pot Limit: The maximum bet is the size of the current pot.");
        });
        it("should create a valid Texas Hold'em fixed limit configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.TEXAS_HOLDEM, types_1.BettingStructure.FIXED_LIMIT);
            expect(config.name).toBe("Fixed-Limit Texas Hold'em");
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.FIXED_LIMIT);
            expect(config.rules).toContain("Fixed Limit: Bets and raises are in fixed increments, with larger bets on later streets.");
        });
        it("should create a valid Texas Hold'em Hi-Lo configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.TEXAS_HOLDEM, types_1.BettingStructure.NO_LIMIT, true, // Hi-Lo
            8 // 8 or better for low
            );
            expect(config.name).toBe("No-Limit Texas Hold'em Hi-Lo");
            expect(config.rules).toContain("The pot is split between the best high hand and the best qualifying low hand (8 or better).");
            expect(config.rules).toContain("For low hands, straights and flushes don't count against you, and Aces are low.");
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(true);
            expect(evaluator["options"].lowHandQualifier).toBe(8);
        });
        it("should create a valid Omaha configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.OMAHA, types_1.BettingStructure.POT_LIMIT);
            expect(config.name).toBe("Pot-Limit Omaha");
            expect(config.variant).toBe(types_1.GameVariant.OMAHA);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
            expect(config.cardsPerPlayer).toBe(4);
            expect(config.communityCards).toBe(5);
            expect(config.evaluator).toBeInstanceOf(evaluator_1.OmahaEvaluator);
            expect(config.rules).toContain("Each player receives 4 hole cards.");
            expect(config.rules).toContain("Players must use exactly 2 of their hole cards and exactly 3 of the community cards.");
        });
        it("should create a valid Omaha Hi-Lo configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.OMAHA, types_1.BettingStructure.POT_LIMIT, true, // Hi-Lo
            8 // 8 or better for low
            );
            expect(config.name).toBe("Pot-Limit Omaha Hi-Lo");
            expect(config.rules).toContain("The pot is split between the best high hand and the best qualifying low hand (8 or better).");
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(true);
            expect(evaluator["options"].lowHandQualifier).toBe(8);
        });
        it("should create a valid 7-Card Stud configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.SEVEN_CARD_STUD, types_1.BettingStructure.FIXED_LIMIT);
            expect(config.name).toBe("Fixed-Limit 7-Card Stud");
            expect(config.variant).toBe(types_1.GameVariant.SEVEN_CARD_STUD);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.FIXED_LIMIT);
            expect(config.cardsPerPlayer).toBe(7);
            expect(config.communityCards).toBe(0);
            expect(config.minPlayers).toBe(2);
            expect(config.maxPlayers).toBe(8);
            expect(config.evaluator).toBeInstanceOf(evaluator_1.TexasHoldemEvaluator);
            expect(config.rules).toContain("Each player receives 7 cards in total.");
        });
        it("should create a valid 7-Card Stud Hi-Lo configuration", () => {
            const config = (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.SEVEN_CARD_STUD, types_1.BettingStructure.FIXED_LIMIT, true, // Hi-Lo
            8 // 8 or better for low
            );
            expect(config.name).toBe("Fixed-Limit 7-Card Stud Hi-Lo");
            expect(config.rules).toContain("The pot is split between the best high hand and the best qualifying low hand (8 or better).");
        });
        it("should throw an error for invalid game variant", () => {
            expect(() => {
                (0, GameVariantConfig_1.createGameVariantConfig)("INVALID_VARIANT", types_1.BettingStructure.NO_LIMIT);
            }).toThrow("Unsupported game variant");
        });
        it("should throw an error for invalid betting structure", () => {
            expect(() => {
                (0, GameVariantConfig_1.createGameVariantConfig)(types_1.GameVariant.TEXAS_HOLDEM, "INVALID_STRUCTURE");
            }).toThrow("Unsupported betting structure");
        });
    });
    describe("GAME_VARIANTS", () => {
        it("should export predefined Texas Hold'em No Limit", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.TEXAS_HOLDEM_NO_LIMIT;
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.NO_LIMIT);
        });
        it("should export predefined Texas Hold'em Pot Limit", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.TEXAS_HOLDEM_POT_LIMIT;
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
        });
        it("should export predefined Texas Hold'em Fixed Limit", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.TEXAS_HOLDEM_FIXED_LIMIT;
            expect(config.variant).toBe(types_1.GameVariant.TEXAS_HOLDEM);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.FIXED_LIMIT);
        });
        it("should export predefined Omaha Pot Limit", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.OMAHA_POT_LIMIT;
            expect(config.variant).toBe(types_1.GameVariant.OMAHA);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(false);
        });
        it("should export predefined Omaha Hi-Lo Pot Limit", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.OMAHA_HI_LO_POT_LIMIT;
            expect(config.variant).toBe(types_1.GameVariant.OMAHA);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.POT_LIMIT);
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(true);
            expect(evaluator["options"].lowHandQualifier).toBe(8);
        });
        it("should export predefined 7-Card Stud", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.SEVEN_CARD_STUD;
            expect(config.variant).toBe(types_1.GameVariant.SEVEN_CARD_STUD);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.FIXED_LIMIT);
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(false);
        });
        it("should export predefined 7-Card Stud Hi-Lo", () => {
            const config = GameVariantConfig_1.GAME_VARIANTS.SEVEN_CARD_STUD_HI_LO;
            expect(config.variant).toBe(types_1.GameVariant.SEVEN_CARD_STUD);
            expect(config.bettingStructure).toBe(types_1.BettingStructure.FIXED_LIMIT);
            const evaluator = config.evaluator;
            expect(evaluator["options"].evaluateLow).toBe(true);
            expect(evaluator["options"].lowHandQualifier).toBe(8);
        });
    });
});
//# sourceMappingURL=GameVariantConfig.test.js.map