"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const types_1 = require("../types");
const Hand_1 = require("./Hand");
class Player {
    constructor(id, name, stack, seatIndex) {
        this._id = id;
        this._name = name;
        this._stack = stack;
        this._hand = new Hand_1.Hand();
        this._position = null;
        this._status = types_1.PlayerStatus.SITTING_OUT;
        this._currentBet = 0;
        this._actionHistory = [];
        this._seatIndex = seatIndex;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get stack() {
        return this._stack;
    }
    set stack(value) {
        // Don't allow negative stack
        this._stack = Math.max(0, value);
    }
    get hand() {
        return this._hand;
    }
    get holeCards() {
        return this._hand.cards;
    }
    /**
     * Deals cards to the player's hand
     */
    dealCards(cards) {
        this._hand.addCards(cards);
    }
    /**
     * Clears the player's hand (end of round)
     */
    clearHand() {
        this._hand.clear();
    }
    get position() {
        return this._position;
    }
    set position(position) {
        this._position = position;
    }
    get status() {
        return this._status;
    }
    set status(status) {
        this._status = status;
    }
    get currentBet() {
        return this._currentBet;
    }
    set currentBet(amount) {
        this._currentBet = amount;
    }
    get actionHistory() {
        return [...this._actionHistory];
    }
    get seatIndex() {
        return this._seatIndex;
    }
    /**
     * Adds to the player's action history
     */
    addAction(street, action, amount) {
        this._actionHistory.push({
            street,
            action,
            amount,
            timestamp: new Date(),
        });
    }
    /**
     * Clears action history (end of hand)
     */
    clearActionHistory() {
        this._actionHistory = [];
    }
    /**
     * Places a bet (reduces stack by amount)
     * @returns The actual amount bet (in case player doesn't have enough)
     */
    placeBet(amount) {
        const actualBet = Math.min(amount, this._stack);
        this._stack -= actualBet;
        this._currentBet += actualBet;
        return actualBet;
    }
    /**
     * Adds winnings to player's stack
     */
    addWinnings(amount) {
        this._stack += amount;
    }
    /**
     * Resets the player's bet amount (end of street)
     */
    resetBet() {
        this._currentBet = 0;
    }
    /**
     * Checks if the player is active in the current hand
     */
    isActive() {
        return this._status === types_1.PlayerStatus.ACTIVE;
    }
    /**
     * Checks if the player is all-in
     */
    isAllIn() {
        return this._status === types_1.PlayerStatus.ALL_IN;
    }
    /**
     * Checks if the player has folded
     */
    hasFolded() {
        return this._status === types_1.PlayerStatus.FOLDED;
    }
    /**
     * Checks if the player is sitting out
     */
    isSittingOut() {
        return this._status === types_1.PlayerStatus.SITTING_OUT;
    }
    /**
     * Checks if the player has any chips left
     */
    hasChips() {
        return this._stack > 0;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map