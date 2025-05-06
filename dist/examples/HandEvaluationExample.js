"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
const evaluator_1 = require("../evaluator");
const rules_1 = require("../rules");
const types_1 = require("../types");
// Create example cards
const aceHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.ACE);
const aceSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.ACE);
const kingHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.KING);
const queenHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.QUEEN);
const jackHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.JACK);
const tenHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.TEN);
const nineSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.NINE);
const eightClubs = new models_1.Card(types_1.Suit.CLUBS, types_1.Rank.EIGHT);
const sevenDiamonds = new models_1.Card(types_1.Suit.DIAMONDS, types_1.Rank.SEVEN);
const sixClubs = new models_1.Card(types_1.Suit.CLUBS, types_1.Rank.SIX);
const fiveSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.FIVE);
const fourDiamonds = new models_1.Card(types_1.Suit.DIAMONDS, types_1.Rank.FOUR);
const threeClubs = new models_1.Card(types_1.Suit.CLUBS, types_1.Rank.THREE);
const twoSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.TWO);
function runHoldemExample() {
    console.log("========== TEXAS HOLD'EM EXAMPLE ==========");
    // Create a player hand with two hole cards
    const holdemHand = new models_1.Hand([aceHearts, kingHearts]);
    console.log("Player hole cards:", holdemHand.toString());
    // Create community cards
    const communityCards = [
        aceSpades,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
    ];
    console.log("Community cards:", communityCards.map((card) => card.toString()).join(" "));
    // Evaluate with Texas Hold'em rules
    const holdemEvaluator = new evaluator_1.TexasHoldemEvaluator({ acesLow: false });
    const result = holdemEvaluator.evaluate(holdemHand, communityCards);
    console.log("Hand rank:", result.rank);
    console.log("Description:", result.description);
    console.log("Best 5 cards:", result.bestCards.map((card) => card.toString()).join(" "));
    console.log();
}
function runOmahaExample() {
    console.log("========== OMAHA EXAMPLE ==========");
    // Create a player hand with four hole cards
    const omahaHand = new models_1.Hand([aceHearts, kingHearts, twoSpades, threeClubs]);
    console.log("Player hole cards:", omahaHand.toString());
    // Create community cards
    const communityCards = [
        aceSpades,
        queenHearts,
        jackHearts,
        tenHearts,
        fourDiamonds,
    ];
    console.log("Community cards:", communityCards.map((card) => card.toString()).join(" "));
    // Evaluate with Omaha rules
    const omahaEvaluator = new evaluator_1.OmahaEvaluator({ acesLow: false });
    const result = omahaEvaluator.evaluate(omahaHand, communityCards);
    console.log("Hand rank:", result.rank);
    console.log("Description:", result.description);
    console.log("Best 5 cards:", result.bestCards.map((card) => card.toString()).join(" "));
    console.log();
}
function runOmahaHiLoExample() {
    console.log("========== OMAHA HI-LO EXAMPLE ==========");
    // Create a player hand with four hole cards (good for both high and low)
    const omahaHand = new models_1.Hand([aceHearts, twoSpades, threeClubs, fiveSpades]);
    console.log("Player hole cards:", omahaHand.toString());
    // Create community cards
    const communityCards = [
        aceSpades,
        fourDiamonds,
        sixClubs,
        queenHearts,
        kingHearts,
    ];
    console.log("Community cards:", communityCards.map((card) => card.toString()).join(" "));
    // Evaluate with Omaha Hi-Lo rules
    const omahaHiLoEvaluator = new evaluator_1.OmahaEvaluator({
        evaluateLow: true,
        lowHandQualifier: 8,
        acesLow: true,
    });
    const result = omahaHiLoEvaluator.evaluateHiLo(omahaHand, communityCards);
    console.log("HIGH HAND:");
    console.log("Hand rank:", result.highHand.rank);
    console.log("Description:", result.highHand.description);
    console.log("Best high 5 cards:", result.highHand.bestCards.map((card) => card.toString()).join(" "));
    console.log("\nLOW HAND:");
    if (result.lowHand) {
        console.log("Valid low hand:", result.lowHand.valid);
        console.log("Description:", result.lowHand.description);
        console.log("Best low 5 cards:", result.lowHand.bestCards.map((card) => card.toString()).join(" "));
    }
    else {
        console.log("No qualifying low hand");
    }
    console.log();
}
function runUsingGameVariantConfig() {
    console.log("========== USING GAME VARIANT CONFIG ==========");
    // Create a hand for Texas Hold'em
    const holdemHand = new models_1.Hand([aceHearts, kingHearts]);
    const holdemCommunity = [
        aceSpades,
        queenHearts,
        jackHearts,
        tenHearts,
        twoSpades,
    ];
    // Use the predefined Texas Hold'em configuration
    const holdemConfig = rules_1.GAME_VARIANTS.TEXAS_HOLDEM_NO_LIMIT;
    console.log(`Game variant: ${holdemConfig.name}`);
    console.log("Player hole cards:", holdemHand.toString());
    console.log("Community cards:", holdemCommunity.map((card) => card.toString()).join(" "));
    const holdemResult = holdemConfig.evaluator.evaluate(holdemHand, holdemCommunity);
    console.log("Hand rank:", holdemResult.rank);
    console.log("Description:", holdemResult.description);
    console.log();
    // Create a hand for Omaha Hi-Lo
    const omahaHand = new models_1.Hand([aceHearts, twoSpades, threeClubs, fiveSpades]);
    const omahaCommunity = [
        aceSpades,
        fourDiamonds,
        sixClubs,
        queenHearts,
        kingHearts,
    ];
    // Use the predefined Omaha Hi-Lo configuration
    const omahaHiLoConfig = rules_1.GAME_VARIANTS.OMAHA_HI_LO_POT_LIMIT;
    console.log(`Game variant: ${omahaHiLoConfig.name}`);
    console.log("Player hole cards:", omahaHand.toString());
    console.log("Community cards:", omahaCommunity.map((card) => card.toString()).join(" "));
    const omahaHiLoResult = omahaHiLoConfig.evaluator.evaluateHiLo(omahaHand, omahaCommunity);
    console.log("HIGH HAND:", omahaHiLoResult.highHand.description);
    if (omahaHiLoResult.lowHand) {
        console.log("LOW HAND:", omahaHiLoResult.lowHand.description);
    }
    else {
        console.log("No qualifying low hand");
    }
}
// Run examples
runHoldemExample();
runOmahaExample();
runOmahaHiLoExample();
runUsingGameVariantConfig();
//# sourceMappingURL=HandEvaluationExample.js.map