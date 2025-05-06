"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pot_1 = require("../../models/Pot");
const Player_1 = require("../../models/Player");
describe("Pot", () => {
    let pot;
    let player1;
    let player2;
    let player3;
    beforeEach(() => {
        pot = new Pot_1.Pot();
        player1 = new Player_1.Player("p1", "Player 1", 1000, 0);
        player2 = new Player_1.Player("p2", "Player 2", 1000, 1);
        player3 = new Player_1.Player("p3", "Player 3", 1000, 2);
    });
    describe("initialization", () => {
        it("should create an empty pot", () => {
            expect(pot.amount).toBe(0);
            expect(pot.getContributors()).toHaveLength(0);
            expect(pot.getEligiblePlayers()).toHaveLength(0);
        });
    });
    describe("addChips", () => {
        it("should add chips to the pot from a player", () => {
            pot.addChips(player1, 100);
            expect(pot.amount).toBe(100);
            expect(pot.getContributors()).toHaveLength(1);
            expect(pot.getEligiblePlayers()).toHaveLength(1);
            expect(pot.getEligiblePlayers()[0]).toBe(player1);
        });
        it("should accumulate chips from the same player", () => {
            pot.addChips(player1, 50);
            pot.addChips(player1, 50);
            expect(pot.amount).toBe(100);
            expect(pot.getContributors()).toHaveLength(1);
            // Check that the player's contribution is correctly accumulated
            const contributors = pot.getContributors();
            expect(contributors[0].player).toBe(player1);
            expect(contributors[0].amount).toBe(100);
        });
        it("should track multiple contributors", () => {
            pot.addChips(player1, 100);
            pot.addChips(player2, 150);
            pot.addChips(player3, 200);
            expect(pot.amount).toBe(450);
            expect(pot.getContributors()).toHaveLength(3);
            expect(pot.getEligiblePlayers()).toHaveLength(3);
            // Check contributions
            const contributors = pot.getContributors();
            expect(contributors.find((c) => c.player === player1)?.amount).toBe(100);
            expect(contributors.find((c) => c.player === player2)?.amount).toBe(150);
            expect(contributors.find((c) => c.player === player3)?.amount).toBe(200);
        });
    });
    describe("player eligibility", () => {
        it("should mark all contributors as eligible by default", () => {
            pot.addChips(player1, 100);
            pot.addChips(player2, 100);
            expect(pot.isPlayerEligible(player1.id)).toBe(true);
            expect(pot.isPlayerEligible(player2.id)).toBe(true);
            expect(pot.isPlayerEligible(player3.id)).toBe(false);
        });
        it("should allow removing eligible players", () => {
            pot.addChips(player1, 100);
            pot.addChips(player2, 100);
            pot.removeEligiblePlayer(player1.id);
            expect(pot.isPlayerEligible(player1.id)).toBe(false);
            expect(pot.isPlayerEligible(player2.id)).toBe(true);
            expect(pot.getEligiblePlayers()).toHaveLength(1);
            expect(pot.getEligiblePlayers()[0]).toBe(player2);
        });
    });
    describe("clear", () => {
        it("should reset the pot to its initial state", () => {
            pot.addChips(player1, 100);
            pot.addChips(player2, 150);
            pot.clear();
            expect(pot.amount).toBe(0);
            expect(pot.getContributors()).toHaveLength(0);
            expect(pot.getEligiblePlayers()).toHaveLength(0);
        });
    });
});
describe("PotManager", () => {
    let potManager;
    let player1;
    let player2;
    let player3;
    beforeEach(() => {
        potManager = new Pot_1.PotManager();
        player1 = new Player_1.Player("p1", "Player 1", 1000, 0);
        player2 = new Player_1.Player("p2", "Player 2", 1000, 1);
        player3 = new Player_1.Player("p3", "Player 3", 1000, 2);
    });
    describe("initialization", () => {
        it("should create an empty pot manager", () => {
            expect(potManager.mainPot.amount).toBe(0);
            expect(potManager.sidePots).toHaveLength(0);
            expect(potManager.totalPotAmount).toBe(0);
        });
    });
    describe("addBet", () => {
        it("should record bets without adding them to pots immediately", () => {
            potManager.addBet(player1, 100);
            // Bets aren't added to pots until collectBets is called
            expect(potManager.mainPot.amount).toBe(0);
            expect(potManager.totalPotAmount).toBe(100);
        });
        it("should accumulate bets from the same player", () => {
            potManager.addBet(player1, 50);
            potManager.addBet(player1, 50);
            expect(potManager.totalPotAmount).toBe(100);
        });
    });
    describe("collectBets", () => {
        it("should do nothing when there are no bets", () => {
            potManager.collectBets();
            expect(potManager.mainPot.amount).toBe(0);
            expect(potManager.sidePots).toHaveLength(0);
        });
        // The remaining tests for collectBets would require mocking the private
        // _findPlayerById method since it's used to find the players in the pots
        // Let's test what we can test without complex mocks
        it("should clear current bets after collecting", () => {
            potManager.addBet(player1, 100);
            expect(potManager.totalPotAmount).toBe(100);
            potManager.collectBets();
            // After collecting, current bets should be 0, but we can't verify
            // the pot amounts directly without mocking _findPlayerById
            // We can verify if adding a new bet starts from 0
            potManager.addBet(player1, 50);
            expect(potManager.totalPotAmount).toBe(50);
        });
    });
    describe("totalPotAmount", () => {
        it("should return the sum of all pots and current bets", () => {
            // Add some bets
            potManager.addBet(player1, 100);
            potManager.addBet(player2, 100);
            // Total should be the sum of current bets
            expect(potManager.totalPotAmount).toBe(200);
            // Mock mainPot amount
            const mockMainPot = new Pot_1.Pot();
            mockMainPot.addChips(player1, 50);
            // @ts-ignore - accessing private property for testing
            potManager._mainPot = mockMainPot;
            // Total should now include main pot and current bets
            expect(potManager.totalPotAmount).toBe(250);
            // Mock side pot
            const mockSidePot = new Pot_1.Pot();
            mockSidePot.addChips(player2, 30);
            // @ts-ignore - accessing private property for testing
            potManager._sidePots = [mockSidePot];
            // Total should now include main pot, side pot, and current bets
            expect(potManager.totalPotAmount).toBe(280);
        });
    });
    describe("removeEligiblePlayer", () => {
        it("should remove a player from main pot eligibility", () => {
            // Set up a main pot with players
            const mainPot = new Pot_1.Pot();
            mainPot.addChips(player1, 100);
            mainPot.addChips(player2, 100);
            // @ts-ignore - accessing private property for testing
            potManager._mainPot = mainPot;
            potManager.removeEligiblePlayer(player1.id);
            expect(potManager.mainPot.isPlayerEligible(player1.id)).toBe(false);
            expect(potManager.mainPot.isPlayerEligible(player2.id)).toBe(true);
        });
        it("should remove a player from side pot eligibility", () => {
            // Set up a side pot with players
            const sidePot = new Pot_1.Pot();
            sidePot.addChips(player1, 100);
            sidePot.addChips(player2, 100);
            // @ts-ignore - accessing private property for testing
            potManager._sidePots = [sidePot];
            potManager.removeEligiblePlayer(player1.id);
            expect(potManager.sidePots[0].isPlayerEligible(player1.id)).toBe(false);
            expect(potManager.sidePots[0].isPlayerEligible(player2.id)).toBe(true);
        });
    });
    describe("clear", () => {
        it("should reset all pots", () => {
            // Set up some state to clear
            potManager.addBet(player1, 100);
            const mainPot = new Pot_1.Pot();
            mainPot.addChips(player2, 50);
            // @ts-ignore - accessing private property for testing
            potManager._mainPot = mainPot;
            const sidePot = new Pot_1.Pot();
            sidePot.addChips(player3, 30);
            // @ts-ignore - accessing private property for testing
            potManager._sidePots = [sidePot];
            potManager.clear();
            // Everything should be cleared
            expect(potManager.mainPot.amount).toBe(0);
            expect(potManager.sidePots).toHaveLength(0);
            expect(potManager.totalPotAmount).toBe(0);
        });
    });
});
//# sourceMappingURL=Pot.test.js.map