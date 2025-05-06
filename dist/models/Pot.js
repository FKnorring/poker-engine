"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PotManager = exports.Pot = void 0;
class Pot {
    constructor() {
        this._amount = 0;
        this._contributors = new Map();
        this._eligiblePlayers = new Set();
    }
    get amount() {
        return this._amount;
    }
    /**
     * Adds chips to the pot from a player
     */
    addChips(player, amount) {
        this._amount += amount;
        const playerId = player.id;
        const existingContribution = this._contributors.get(playerId);
        if (existingContribution) {
            existingContribution.amount += amount;
        }
        else {
            this._contributors.set(playerId, { player, amount });
        }
        // Player who contributes to a pot is eligible to win it
        this._eligiblePlayers.add(playerId);
    }
    /**
     * Returns all players who have contributed to this pot
     */
    getContributors() {
        return Array.from(this._contributors.values());
    }
    /**
     * Returns all players eligible to win this pot
     */
    getEligiblePlayers() {
        return Array.from(this._eligiblePlayers)
            .map((id) => this._contributors.get(id)?.player)
            .filter((player) => player !== undefined);
    }
    /**
     * Checks if a player is eligible to win this pot
     */
    isPlayerEligible(playerId) {
        return this._eligiblePlayers.has(playerId);
    }
    /**
     * Marks a player as ineligible to win this pot (e.g., after folding)
     */
    removeEligiblePlayer(playerId) {
        this._eligiblePlayers.delete(playerId);
    }
    /**
     * Resets the pot for a new hand
     */
    clear() {
        this._amount = 0;
        this._contributors.clear();
        this._eligiblePlayers.clear();
    }
}
exports.Pot = Pot;
class PotManager {
    constructor() {
        this._mainPot = new Pot();
        this._sidePots = [];
        this._currentBets = new Map();
    }
    get mainPot() {
        return this._mainPot;
    }
    get sidePots() {
        return [...this._sidePots];
    }
    get totalPotAmount() {
        const mainAmount = this._mainPot.amount;
        const sideAmount = this._sidePots.reduce((sum, pot) => sum + pot.amount, 0);
        const currentBetsAmount = Array.from(this._currentBets.values()).reduce((sum, bet) => sum + bet, 0);
        return mainAmount + sideAmount + currentBetsAmount;
    }
    /**
     * Records a bet from a player for the current street
     */
    addBet(player, amount) {
        const currentBet = this._currentBets.get(player.id) || 0;
        this._currentBets.set(player.id, currentBet + amount);
    }
    /**
     * Moves all current bets into the pot(s) at the end of a betting round
     * Creates side pots if necessary when players are all-in
     */
    collectBets() {
        // If there are no bets, nothing to do
        if (this._currentBets.size === 0) {
            return;
        }
        // Sort players by their bet amount to identify potential side pots
        const bets = Array.from(this._currentBets.entries())
            .map(([playerId, amount]) => ({
            playerId,
            amount,
        }))
            .sort((a, b) => a.amount - b.amount);
        // Process bets and create side pots
        let prevAmount = 0;
        for (let i = 0; i < bets.length; i++) {
            const { playerId, amount } = bets[i];
            // Skip players who didn't bet
            if (amount === 0)
                continue;
            // Get the player who made this bet
            const player = this._findPlayerById(playerId);
            if (!player)
                continue;
            // The amount this player contributes to the current level
            const contribution = amount - prevAmount;
            if (contribution > 0) {
                // If this is the first player or contributing to main pot
                if (i === 0 || this._sidePots.length === 0) {
                    this._mainPot.addChips(player, contribution);
                }
                else {
                    // This creates or adds to the side pot for this level
                    const sidePotIndex = i - 1;
                    // Create new side pot if needed
                    if (sidePotIndex >= this._sidePots.length) {
                        this._sidePots.push(new Pot());
                    }
                    // Add chips to the appropriate side pot
                    this._sidePots[sidePotIndex].addChips(player, contribution);
                }
            }
            // For the next player, we start from this amount
            prevAmount = amount;
        }
        // Clear current bets after collecting
        this._currentBets.clear();
    }
    /**
     * Marks a player as ineligible to win pots (e.g., after folding)
     */
    removeEligiblePlayer(playerId) {
        this._mainPot.removeEligiblePlayer(playerId);
        this._sidePots.forEach((pot) => pot.removeEligiblePlayer(playerId));
    }
    /**
     * Resets all pots for a new hand
     */
    clear() {
        this._mainPot.clear();
        this._sidePots = [];
        this._currentBets.clear();
    }
    /**
     * Helper method to find a player by ID
     * In a real implementation, this would likely be handled by a PlayerManager
     */
    _findPlayerById(playerId) {
        // In a real implementation, we would have a reference to all players
        // For now, we'll look through the main pot contributors
        const contributor = this._mainPot
            .getContributors()
            .find((c) => c.player.id === playerId);
        return contributor?.player;
    }
}
exports.PotManager = PotManager;
//# sourceMappingURL=Pot.js.map