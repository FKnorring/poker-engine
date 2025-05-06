import { Card, Hand } from "../models";
import { OmahaEvaluator, TexasHoldemEvaluator } from "../evaluator";
import { GAME_VARIANTS } from "../rules";
import { Rank, Suit } from "../types";

// Create example cards
const aceHearts = new Card(Suit.HEARTS, Rank.ACE);
const aceSpades = new Card(Suit.SPADES, Rank.ACE);
const kingHearts = new Card(Suit.HEARTS, Rank.KING);
const queenHearts = new Card(Suit.HEARTS, Rank.QUEEN);
const jackHearts = new Card(Suit.HEARTS, Rank.JACK);
const tenHearts = new Card(Suit.HEARTS, Rank.TEN);
const nineSpades = new Card(Suit.SPADES, Rank.NINE);
const eightClubs = new Card(Suit.CLUBS, Rank.EIGHT);
const sevenDiamonds = new Card(Suit.DIAMONDS, Rank.SEVEN);
const sixClubs = new Card(Suit.CLUBS, Rank.SIX);
const fiveSpades = new Card(Suit.SPADES, Rank.FIVE);
const fourDiamonds = new Card(Suit.DIAMONDS, Rank.FOUR);
const threeClubs = new Card(Suit.CLUBS, Rank.THREE);
const twoSpades = new Card(Suit.SPADES, Rank.TWO);

function runHoldemExample() {
  console.log("========== TEXAS HOLD'EM EXAMPLE ==========");

  // Create a player hand with two hole cards
  const holdemHand = new Hand([aceHearts, kingHearts]);
  console.log("Player hole cards:", holdemHand.toString());

  // Create community cards
  const communityCards = [
    aceSpades,
    queenHearts,
    jackHearts,
    tenHearts,
    twoSpades,
  ];
  console.log(
    "Community cards:",
    communityCards.map((card) => card.toString()).join(" ")
  );

  // Evaluate with Texas Hold'em rules
  const holdemEvaluator = new TexasHoldemEvaluator({ acesLow: false });
  const result = holdemEvaluator.evaluate(holdemHand, communityCards);

  console.log("Hand rank:", result.rank);
  console.log("Description:", result.description);
  console.log(
    "Best 5 cards:",
    result.bestCards.map((card) => card.toString()).join(" ")
  );
  console.log();
}

function runOmahaExample() {
  console.log("========== OMAHA EXAMPLE ==========");

  // Create a player hand with four hole cards
  const omahaHand = new Hand([aceHearts, kingHearts, twoSpades, threeClubs]);
  console.log("Player hole cards:", omahaHand.toString());

  // Create community cards
  const communityCards = [
    aceSpades,
    queenHearts,
    jackHearts,
    tenHearts,
    fourDiamonds,
  ];
  console.log(
    "Community cards:",
    communityCards.map((card) => card.toString()).join(" ")
  );

  // Evaluate with Omaha rules
  const omahaEvaluator = new OmahaEvaluator({ acesLow: false });
  const result = omahaEvaluator.evaluate(omahaHand, communityCards);

  console.log("Hand rank:", result.rank);
  console.log("Description:", result.description);
  console.log(
    "Best 5 cards:",
    result.bestCards.map((card) => card.toString()).join(" ")
  );
  console.log();
}

function runOmahaHiLoExample() {
  console.log("========== OMAHA HI-LO EXAMPLE ==========");

  // Create a player hand with four hole cards (good for both high and low)
  const omahaHand = new Hand([aceHearts, twoSpades, threeClubs, fiveSpades]);
  console.log("Player hole cards:", omahaHand.toString());

  // Create community cards
  const communityCards = [
    aceSpades,
    fourDiamonds,
    sixClubs,
    queenHearts,
    kingHearts,
  ];
  console.log(
    "Community cards:",
    communityCards.map((card) => card.toString()).join(" ")
  );

  // Evaluate with Omaha Hi-Lo rules
  const omahaHiLoEvaluator = new OmahaEvaluator({
    evaluateLow: true,
    lowHandQualifier: 8,
    acesLow: true,
  });

  const result = omahaHiLoEvaluator.evaluateHiLo(omahaHand, communityCards);

  console.log("HIGH HAND:");
  console.log("Hand rank:", result.highHand.rank);
  console.log("Description:", result.highHand.description);
  console.log(
    "Best high 5 cards:",
    result.highHand.bestCards.map((card) => card.toString()).join(" ")
  );

  console.log("\nLOW HAND:");
  if (result.lowHand) {
    console.log("Valid low hand:", result.lowHand.valid);
    console.log("Description:", result.lowHand.description);
    console.log(
      "Best low 5 cards:",
      result.lowHand.bestCards.map((card) => card.toString()).join(" ")
    );
  } else {
    console.log("No qualifying low hand");
  }
  console.log();
}

function runUsingGameVariantConfig() {
  console.log("========== USING GAME VARIANT CONFIG ==========");

  // Create a hand for Texas Hold'em
  const holdemHand = new Hand([aceHearts, kingHearts]);
  const holdemCommunity = [
    aceSpades,
    queenHearts,
    jackHearts,
    tenHearts,
    twoSpades,
  ];

  // Use the predefined Texas Hold'em configuration
  const holdemConfig = GAME_VARIANTS.TEXAS_HOLDEM_NO_LIMIT;
  console.log(`Game variant: ${holdemConfig.name}`);
  console.log("Player hole cards:", holdemHand.toString());
  console.log(
    "Community cards:",
    holdemCommunity.map((card) => card.toString()).join(" ")
  );

  const holdemResult = holdemConfig.evaluator.evaluate(
    holdemHand,
    holdemCommunity
  );
  console.log("Hand rank:", holdemResult.rank);
  console.log("Description:", holdemResult.description);
  console.log();

  // Create a hand for Omaha Hi-Lo
  const omahaHand = new Hand([aceHearts, twoSpades, threeClubs, fiveSpades]);
  const omahaCommunity = [
    aceSpades,
    fourDiamonds,
    sixClubs,
    queenHearts,
    kingHearts,
  ];

  // Use the predefined Omaha Hi-Lo configuration
  const omahaHiLoConfig = GAME_VARIANTS.OMAHA_HI_LO_POT_LIMIT;
  console.log(`Game variant: ${omahaHiLoConfig.name}`);
  console.log("Player hole cards:", omahaHand.toString());
  console.log(
    "Community cards:",
    omahaCommunity.map((card) => card.toString()).join(" ")
  );

  const omahaHiLoResult = omahaHiLoConfig.evaluator.evaluateHiLo!(
    omahaHand,
    omahaCommunity
  );
  console.log("HIGH HAND:", omahaHiLoResult.highHand.description);

  if (omahaHiLoResult.lowHand) {
    console.log("LOW HAND:", omahaHiLoResult.lowHand.description);
  } else {
    console.log("No qualifying low hand");
  }
}

// Run examples
runHoldemExample();
runOmahaExample();
runOmahaHiLoExample();
runUsingGameVariantConfig();
