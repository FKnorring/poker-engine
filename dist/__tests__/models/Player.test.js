"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("../../models/Player");
const types_1 = require("../../types");
const Card_1 = require("../../models/Card");
const types_2 = require("../../types");
describe("Player", () => {
    let player;
    beforeEach(() => {
        // Create a new player for each test
        player = new Player_1.Player("p1", "Player 1", 1000, 2);
    });
    test("should initialize with correct properties", () => {
        expect(player.id).toBe("p1");
        expect(player.name).toBe("Player 1");
        expect(player.stack).toBe(1000);
        expect(player.hand).toBeDefined();
        expect(player.hand.size).toBe(0);
        expect(player.position).toBeNull();
        expect(player.status).toBe(types_1.PlayerStatus.SITTING_OUT);
        expect(player.currentBet).toBe(0);
        expect(player.actionHistory).toEqual([]);
        expect(player.seatIndex).toBe(2);
    });
    test("should not allow negative stack", () => {
        player.stack = -100;
        expect(player.stack).toBe(0); // Should clamp to 0
    });
    test("should handle dealing cards", () => {
        const card1 = new Card_1.Card(types_2.Suit.HEARTS, types_2.Rank.ACE);
        const card2 = new Card_1.Card(types_2.Suit.SPADES, types_2.Rank.KING);
        player.dealCards([card1, card2]);
        expect(player.hand.size).toBe(2);
        expect(player.holeCards).toContain(card1);
        expect(player.holeCards).toContain(card2);
    });
    test("should clear hand", () => {
        // First deal some cards
        const card1 = new Card_1.Card(types_2.Suit.HEARTS, types_2.Rank.ACE);
        const card2 = new Card_1.Card(types_2.Suit.SPADES, types_2.Rank.KING);
        player.dealCards([card1, card2]);
        // Then clear hand
        player.clearHand();
        expect(player.hand.size).toBe(0);
    });
    test("should set and get position", () => {
        expect(player.position).toBeNull();
        player.position = types_1.PlayerPosition.BUTTON;
        expect(player.position).toBe(types_1.PlayerPosition.BUTTON);
        player.position = types_1.PlayerPosition.SMALL_BLIND;
        expect(player.position).toBe(types_1.PlayerPosition.SMALL_BLIND);
        player.position = null;
        expect(player.position).toBeNull();
    });
    test("should set and get status", () => {
        expect(player.status).toBe(types_1.PlayerStatus.SITTING_OUT);
        player.status = types_1.PlayerStatus.ACTIVE;
        expect(player.status).toBe(types_1.PlayerStatus.ACTIVE);
        player.status = types_1.PlayerStatus.FOLDED;
        expect(player.status).toBe(types_1.PlayerStatus.FOLDED);
        player.status = types_1.PlayerStatus.ALL_IN;
        expect(player.status).toBe(types_1.PlayerStatus.ALL_IN);
    });
    test("should handle action history", () => {
        // Initially empty
        expect(player.actionHistory).toEqual([]);
        // Add an action
        player.addAction("preflop", "bet", 50);
        expect(player.actionHistory.length).toBe(1);
        expect(player.actionHistory[0].street).toBe("preflop");
        expect(player.actionHistory[0].action).toBe("bet");
        expect(player.actionHistory[0].amount).toBe(50);
        expect(player.actionHistory[0].timestamp).toBeInstanceOf(Date);
        // Add another action
        player.addAction("flop", "check", 0);
        expect(player.actionHistory.length).toBe(2);
        expect(player.actionHistory[1].street).toBe("flop");
        expect(player.actionHistory[1].action).toBe("check");
        expect(player.actionHistory[1].amount).toBe(0);
        // Clear action history
        player.clearActionHistory();
        expect(player.actionHistory).toEqual([]);
    });
    test("should handle placing bets", () => {
        // Initial stack and bet
        expect(player.stack).toBe(1000);
        expect(player.currentBet).toBe(0);
        // Place a bet
        const betAmount = player.placeBet(200);
        expect(betAmount).toBe(200);
        expect(player.stack).toBe(800);
        expect(player.currentBet).toBe(200);
        // Place another bet
        const betAmount2 = player.placeBet(300);
        expect(betAmount2).toBe(300);
        expect(player.stack).toBe(500);
        expect(player.currentBet).toBe(500);
        // Try to bet more than available
        const betAmount3 = player.placeBet(1000);
        expect(betAmount3).toBe(500); // Only remaining stack
        expect(player.stack).toBe(0);
        expect(player.currentBet).toBe(1000);
    });
    test("should add winnings to stack", () => {
        expect(player.stack).toBe(1000);
        player.addWinnings(500);
        expect(player.stack).toBe(1500);
        player.addWinnings(300);
        expect(player.stack).toBe(1800);
    });
    test("should reset bet amount", () => {
        // Place a bet first
        player.placeBet(200);
        expect(player.currentBet).toBe(200);
        // Reset bet
        player.resetBet();
        expect(player.currentBet).toBe(0);
    });
    test("should correctly identify player status", () => {
        // Test ACTIVE status
        player.status = types_1.PlayerStatus.ACTIVE;
        expect(player.isActive()).toBe(true);
        expect(player.isAllIn()).toBe(false);
        expect(player.hasFolded()).toBe(false);
        expect(player.isSittingOut()).toBe(false);
        // Test ALL_IN status
        player.status = types_1.PlayerStatus.ALL_IN;
        expect(player.isActive()).toBe(false);
        expect(player.isAllIn()).toBe(true);
        expect(player.hasFolded()).toBe(false);
        expect(player.isSittingOut()).toBe(false);
        // Test FOLDED status
        player.status = types_1.PlayerStatus.FOLDED;
        expect(player.isActive()).toBe(false);
        expect(player.isAllIn()).toBe(false);
        expect(player.hasFolded()).toBe(true);
        expect(player.isSittingOut()).toBe(false);
        // Test SITTING_OUT status
        player.status = types_1.PlayerStatus.SITTING_OUT;
        expect(player.isActive()).toBe(false);
        expect(player.isAllIn()).toBe(false);
        expect(player.hasFolded()).toBe(false);
        expect(player.isSittingOut()).toBe(true);
    });
    test("should correctly identify if player has chips", () => {
        expect(player.hasChips()).toBe(true);
        player.stack = 0;
        expect(player.hasChips()).toBe(false);
        player.stack = 1;
        expect(player.hasChips()).toBe(true);
    });
});
//# sourceMappingURL=Player.test.js.map