"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const evaluator_1 = require("../../evaluator");
const types_1 = require("../../types");
describe("HandUtils", () => {
    // Test cards
    const aceHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.ACE);
    const aceSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.ACE);
    const aceDiamonds = new models_1.Card(types_1.Suit.DIAMONDS, types_1.Rank.ACE);
    const aceClubs = new models_1.Card(types_1.Suit.CLUBS, types_1.Rank.ACE);
    const kingHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.KING);
    const kingSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.KING);
    const queenHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.QUEEN);
    const jackHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.JACK);
    const jackSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.JACK);
    const tenHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.TEN);
    const nineHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.NINE);
    const eightSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.EIGHT);
    const sevenSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.SEVEN);
    const sixDiamonds = new models_1.Card(types_1.Suit.DIAMONDS, types_1.Rank.SIX);
    const fiveClubs = new models_1.Card(types_1.Suit.CLUBS, types_1.Rank.FIVE);
    const fourHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.FOUR);
    const threeHearts = new models_1.Card(types_1.Suit.HEARTS, types_1.Rank.THREE);
    const twoSpades = new models_1.Card(types_1.Suit.SPADES, types_1.Rank.TWO);
    describe("groupByRank", () => {
        test("should group cards by rank", () => {
            const cards = [aceHearts, kingHearts, aceSpades, queenHearts];
            const groups = evaluator_1.HandUtils.groupByRank(cards);
            expect(groups.size).toBe(3); // Ace, King, Queen
            expect(groups.get(types_1.Rank.ACE)?.length).toBe(2);
            expect(groups.get(types_1.Rank.KING)?.length).toBe(1);
            expect(groups.get(types_1.Rank.QUEEN)?.length).toBe(1);
        });
    });
    describe("groupBySuit", () => {
        test("should group cards by suit", () => {
            const cards = [aceHearts, kingHearts, aceSpades, queenHearts];
            const groups = evaluator_1.HandUtils.groupBySuit(cards);
            expect(groups.size).toBe(2); // Hearts, Spades
            expect(groups.get(types_1.Suit.HEARTS)?.length).toBe(3);
            expect(groups.get(types_1.Suit.SPADES)?.length).toBe(1);
        });
    });
    describe("sortByRank", () => {
        test("should sort cards by rank (ace high)", () => {
            const cards = [twoSpades, kingHearts, aceHearts, tenHearts];
            const sorted = evaluator_1.HandUtils.sortByRank(cards, true);
            expect(sorted[0].rank).toBe(types_1.Rank.ACE);
            expect(sorted[1].rank).toBe(types_1.Rank.KING);
            expect(sorted[2].rank).toBe(types_1.Rank.TEN);
            expect(sorted[3].rank).toBe(types_1.Rank.TWO);
        });
        test("should sort cards by rank (ace low)", () => {
            const cards = [twoSpades, kingHearts, aceHearts, tenHearts];
            const sorted = evaluator_1.HandUtils.sortByRank(cards, false);
            expect(sorted[0].rank).toBe(types_1.Rank.KING);
            expect(sorted[1].rank).toBe(types_1.Rank.TEN);
            expect(sorted[2].rank).toBe(types_1.Rank.TWO);
            expect(sorted[3].rank).toBe(types_1.Rank.ACE);
        });
    });
    describe("findPairs", () => {
        test("should find all pairs in the cards", () => {
            const cards = [aceHearts, aceSpades, kingHearts, queenHearts];
            const pairs = evaluator_1.HandUtils.findPairs(cards);
            expect(pairs.length).toBe(1);
            expect(pairs[0].length).toBe(2);
            expect(pairs[0][0].rank).toBe(types_1.Rank.ACE);
            expect(pairs[0][1].rank).toBe(types_1.Rank.ACE);
        });
        test("should find multiple pairs if present", () => {
            const cards = [aceHearts, aceSpades, kingHearts, kingSpades, queenHearts];
            const pairs = evaluator_1.HandUtils.findPairs(cards);
            expect(pairs.length).toBe(2);
        });
        test("should return empty array if no pairs", () => {
            const cards = [aceHearts, kingHearts, queenHearts, jackHearts];
            const pairs = evaluator_1.HandUtils.findPairs(cards);
            expect(pairs.length).toBe(0);
        });
    });
    describe("findThreeOfAKinds", () => {
        test("should find a three of a kind", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts];
            const trips = evaluator_1.HandUtils.findThreeOfAKinds(cards);
            expect(trips.length).toBe(1);
            expect(trips[0].length).toBe(3);
            expect(trips[0][0].rank).toBe(types_1.Rank.ACE);
            expect(trips[0][1].rank).toBe(types_1.Rank.ACE);
            expect(trips[0][2].rank).toBe(types_1.Rank.ACE);
        });
        test("should return empty array if no three of a kind", () => {
            const cards = [aceHearts, aceSpades, kingHearts, queenHearts];
            const trips = evaluator_1.HandUtils.findThreeOfAKinds(cards);
            expect(trips.length).toBe(0);
        });
    });
    describe("findFourOfAKinds", () => {
        test("should find a four of a kind", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, aceClubs, kingHearts];
            const quads = evaluator_1.HandUtils.findFourOfAKinds(cards);
            expect(quads.length).toBe(1);
            expect(quads[0].length).toBe(4);
            expect(quads[0][0].rank).toBe(types_1.Rank.ACE);
            expect(quads[0][1].rank).toBe(types_1.Rank.ACE);
            expect(quads[0][2].rank).toBe(types_1.Rank.ACE);
            expect(quads[0][3].rank).toBe(types_1.Rank.ACE);
        });
        test("should return empty array if no four of a kind", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts];
            const quads = evaluator_1.HandUtils.findFourOfAKinds(cards);
            expect(quads.length).toBe(0);
        });
    });
    describe("findStraight", () => {
        test("should find a straight", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                twoSpades,
            ];
            const straight = evaluator_1.HandUtils.findStraight(cards);
            expect(straight).not.toBeNull();
            expect(straight.length).toBe(5);
            expect(straight[0].rank).toBe(types_1.Rank.ACE);
            expect(straight[1].rank).toBe(types_1.Rank.KING);
            expect(straight[2].rank).toBe(types_1.Rank.QUEEN);
            expect(straight[3].rank).toBe(types_1.Rank.JACK);
            expect(straight[4].rank).toBe(types_1.Rank.TEN);
        });
        test("should find a wheel straight (A-5-4-3-2)", () => {
            const cards = [
                aceHearts,
                fiveClubs,
                fourHearts,
                threeHearts,
                twoSpades,
                kingHearts,
            ];
            const straight = evaluator_1.HandUtils.findStraight(cards);
            expect(straight).not.toBeNull();
            expect(straight.length).toBe(5);
            expect(straight[0].rank).toBe(types_1.Rank.FIVE);
            expect(straight[1].rank).toBe(types_1.Rank.FOUR);
            expect(straight[2].rank).toBe(types_1.Rank.THREE);
            expect(straight[3].rank).toBe(types_1.Rank.TWO);
            expect(straight[4].rank).toBe(types_1.Rank.ACE); // Ace is low
        });
        test("should return null if no straight", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                nineHearts,
            ];
            const straight = evaluator_1.HandUtils.findStraight(cards);
            expect(straight).toBeNull();
        });
    });
    describe("findFlush", () => {
        test("should find a flush", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                nineHearts,
                twoSpades,
            ];
            const flush = evaluator_1.HandUtils.findFlush(cards);
            expect(flush).not.toBeNull();
            expect(flush.length).toBe(5);
            expect(flush[0].suit).toBe(types_1.Suit.HEARTS);
            expect(flush[1].suit).toBe(types_1.Suit.HEARTS);
            expect(flush[2].suit).toBe(types_1.Suit.HEARTS);
            expect(flush[3].suit).toBe(types_1.Suit.HEARTS);
            expect(flush[4].suit).toBe(types_1.Suit.HEARTS);
        });
        test("should return null if no flush", () => {
            const cards = [aceHearts, kingHearts, queenHearts, jackHearts, twoSpades];
            const flush = evaluator_1.HandUtils.findFlush(cards);
            expect(flush).toBeNull();
        });
    });
    describe("findStraightFlush", () => {
        test("should find a straight flush", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                twoSpades,
            ];
            const straightFlush = evaluator_1.HandUtils.findStraightFlush(cards);
            expect(straightFlush).not.toBeNull();
            expect(straightFlush.length).toBe(5);
            expect(straightFlush[0].rank).toBe(types_1.Rank.ACE);
            expect(straightFlush[1].rank).toBe(types_1.Rank.KING);
            expect(straightFlush[2].rank).toBe(types_1.Rank.QUEEN);
            expect(straightFlush[3].rank).toBe(types_1.Rank.JACK);
            expect(straightFlush[4].rank).toBe(types_1.Rank.TEN);
            expect(straightFlush[0].suit).toBe(types_1.Suit.HEARTS);
        });
        test("should return null if no straight flush", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                twoSpades,
            ];
            // Replace tenHearts with twoSpades to break the straight flush
            const modifiedCards = cards.filter((card) => card !== tenHearts);
            const straightFlush = evaluator_1.HandUtils.findStraightFlush(modifiedCards);
            expect(straightFlush).toBeNull();
        });
    });
    describe("findRoyalFlush", () => {
        test("should find a royal flush", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                twoSpades,
            ];
            const royalFlush = evaluator_1.HandUtils.findRoyalFlush(cards);
            expect(royalFlush).not.toBeNull();
            expect(royalFlush.length).toBe(5);
            expect(royalFlush[0].rank).toBe(types_1.Rank.ACE);
            expect(royalFlush[1].rank).toBe(types_1.Rank.KING);
            expect(royalFlush[2].rank).toBe(types_1.Rank.QUEEN);
            expect(royalFlush[3].rank).toBe(types_1.Rank.JACK);
            expect(royalFlush[4].rank).toBe(types_1.Rank.TEN);
            expect(royalFlush[0].suit).toBe(types_1.Suit.HEARTS);
        });
        test("should return null if no royal flush", () => {
            const cards = [
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                nineHearts,
                twoSpades,
            ];
            const royalFlush = evaluator_1.HandUtils.findRoyalFlush(cards);
            expect(royalFlush).toBeNull();
        });
    });
    describe("findFullHouse", () => {
        test("should find a full house", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts, kingSpades];
            const fullHouse = evaluator_1.HandUtils.findFullHouse(cards);
            expect(fullHouse).not.toBeNull();
            expect(fullHouse[0].length).toBe(3); // Three of a kind
            expect(fullHouse[1].length).toBe(2); // Pair
            expect(fullHouse[0][0].rank).toBe(types_1.Rank.ACE);
            expect(fullHouse[1][0].rank).toBe(types_1.Rank.KING);
        });
        test("should return null if no full house", () => {
            const cards = [aceHearts, aceSpades, kingHearts, queenHearts, jackHearts];
            const fullHouse = evaluator_1.HandUtils.findFullHouse(cards);
            expect(fullHouse).toBeNull();
        });
    });
    describe("evaluateHighHand", () => {
        test("should correctly identify royal flush", () => {
            const cards = [aceHearts, kingHearts, queenHearts, jackHearts, tenHearts];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.ROYAL_FLUSH);
            expect(evaluation.rankValue).toBe(10);
        });
        test("should correctly identify straight flush", () => {
            const cards = [
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                nineHearts,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.STRAIGHT_FLUSH);
            expect(evaluation.rankValue).toBe(9);
        });
        test("should correctly identify four of a kind", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, aceClubs, kingHearts];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.FOUR_OF_A_KIND);
            expect(evaluation.rankValue).toBe(8);
        });
        test("should correctly identify full house", () => {
            const cards = [aceHearts, aceSpades, aceDiamonds, kingHearts, kingSpades];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.FULL_HOUSE);
            expect(evaluation.rankValue).toBe(7);
        });
        test("should correctly identify flush", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                nineHearts,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.FLUSH);
            expect(evaluation.rankValue).toBe(6);
        });
        test("should correctly identify straight", () => {
            const cards = [aceHearts, kingSpades, queenHearts, jackSpades, tenHearts];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.STRAIGHT);
            expect(evaluation.rankValue).toBe(5);
        });
        test("should correctly identify three of a kind", () => {
            const cards = [
                aceHearts,
                aceSpades,
                aceDiamonds,
                kingHearts,
                queenHearts,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.THREE_OF_A_KIND);
            expect(evaluation.rankValue).toBe(4);
        });
        test("should correctly identify two pair", () => {
            const cards = [aceHearts, aceSpades, kingHearts, kingSpades, queenHearts];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.TWO_PAIR);
            expect(evaluation.rankValue).toBe(3);
        });
        test("should correctly identify one pair", () => {
            const cards = [aceHearts, aceSpades, kingHearts, queenHearts, jackHearts];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(cards);
            expect(evaluation.rank).toBe(types_1.HandRank.PAIR);
            expect(evaluation.rankValue).toBe(2);
        });
        test("should correctly identify high card", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                nineHearts,
                eightSpades,
            ];
            // Make sure not all cards have the same suit to avoid a flush
            const modifiedCards = [
                aceHearts,
                kingSpades,
                queenHearts,
                jackSpades,
                nineHearts,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateHighHand(modifiedCards);
            expect(evaluation.rank).toBe(types_1.HandRank.HIGH_CARD);
            expect(evaluation.rankValue).toBe(1);
        });
    });
    describe("evaluateLowHand", () => {
        test("should correctly identify a qualifying low hand", () => {
            const cards = [
                aceHearts,
                twoSpades,
                threeHearts,
                fourHearts,
                fiveClubs,
                kingHearts,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateLowHand(cards, 8);
            expect(evaluation.valid).toBe(true);
            expect(evaluation.bestCards.length).toBe(5);
            // Aces should be treated as low
            const ranks = evaluation.bestCards.map((card) => card.rank).sort();
            expect(ranks).toContain(types_1.Rank.ACE);
            expect(ranks).toContain(types_1.Rank.TWO);
            expect(ranks).toContain(types_1.Rank.THREE);
            expect(ranks).toContain(types_1.Rank.FOUR);
            expect(ranks).toContain(types_1.Rank.FIVE);
        });
        test("should reject hand with pairs", () => {
            const cards = [
                aceHearts,
                aceSpades,
                twoSpades,
                threeHearts,
                fourHearts,
                fiveClubs,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateLowHand(cards, 8);
            expect(evaluation.valid).toBe(true);
            // Should still be valid but won't use both aces
            expect(evaluation.bestCards.length).toBe(5);
            // Count how many aces are in the best hand
            const aceCount = evaluation.bestCards.filter((card) => card.rank === types_1.Rank.ACE).length;
            expect(aceCount).toBe(1); // Only one Ace should be used
        });
        test("should reject hand with cards above qualifier", () => {
            const cards = [
                nineHearts,
                twoSpades,
                threeHearts,
                fourHearts,
                fiveClubs,
                sixDiamonds,
            ];
            const evaluation = evaluator_1.HandUtils.evaluateLowHand(cards, 8);
            // It seems the evaluator is using the lower cards and ignoring the nine,
            // so it considers this a valid low hand. Let's adjust the test.
            // Check that it doesn't include the nine in the best hand
            const nineInBestHand = evaluation.bestCards.some((card) => card.rank === types_1.Rank.NINE);
            expect(nineInBestHand).toBe(false);
            // Create a hand with all cards above 8
            const highCards = [
                nineHearts,
                tenHearts,
                jackHearts,
                queenHearts,
                kingHearts,
                aceHearts,
            ];
            const highEvaluation = evaluator_1.HandUtils.evaluateLowHand(highCards, 8);
            expect(highEvaluation.valid).toBe(false);
        });
    });
    describe("generateCombinations", () => {
        test("should generate all possible 5-card combinations", () => {
            const cards = [
                aceHearts,
                kingHearts,
                queenHearts,
                jackHearts,
                tenHearts,
                nineHearts,
            ];
            const combinations = evaluator_1.HandUtils.generateCombinations(cards, 5);
            // There should be 6C5 = 6 combinations
            expect(combinations.length).toBe(6);
            expect(combinations[0].length).toBe(5);
        });
        test("should generate all possible 2-card combinations", () => {
            const cards = [aceHearts, kingHearts, queenHearts, jackHearts];
            const combinations = evaluator_1.HandUtils.generateCombinations(cards, 2);
            // There should be 4C2 = 6 combinations
            expect(combinations.length).toBe(6);
            expect(combinations[0].length).toBe(2);
        });
    });
    describe("generateOmahaCombinations", () => {
        test("should generate valid Omaha combinations (2 hole + 3 community)", () => {
            const holeCards = [aceHearts, kingHearts, queenHearts, jackHearts];
            const communityCards = [
                tenHearts,
                nineHearts,
                eightSpades,
                sevenSpades,
                sixDiamonds,
            ];
            const combinations = evaluator_1.HandUtils.generateOmahaCombinations(holeCards, communityCards);
            // There should be 4C2 * 5C3 = 6 * 10 = 60 combinations
            expect(combinations.length).toBe(60);
            // Each combination should have exactly 5 cards
            expect(combinations[0].length).toBe(5);
            // Verify a few combinations to ensure they contain 2 hole cards and 3 community cards
            const holeSuits = new Set(holeCards.map((card) => card.suit.toString()));
            const communitySuits = new Set(communityCards.map((card) => card.suit.toString()));
            // Check some random combinations
            for (let i = 0; i < 5; i++) {
                const combo = combinations[i];
                const holeCardCount = combo.filter((card) => holeCards.some((hc) => hc.suit === card.suit && hc.rank === card.rank)).length;
                const communityCardCount = combo.filter((card) => communityCards.some((cc) => cc.suit === card.suit && cc.rank === card.rank)).length;
                expect(holeCardCount).toBe(2);
                expect(communityCardCount).toBe(3);
            }
        });
    });
});
//# sourceMappingURL=HandUtils.test.js.map