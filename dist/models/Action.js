"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const types_1 = require("../types");
class Action {
    constructor(player, type, amount = 0) {
        if (type === types_1.ActionType.BET || type === types_1.ActionType.RAISE) {
            if (amount <= 0 || !amount) {
                throw new Error("Amount must be positive");
            }
        }
        this._player = player;
        this._type = type;
        this._amount = amount;
        this._timestamp = new Date();
    }
    get player() {
        return this._player;
    }
    get type() {
        return this._type;
    }
    get amount() {
        return this._amount;
    }
    get timestamp() {
        return this._timestamp;
    }
    /**
     * Returns true if the action is a fold
     */
    isFold() {
        return this._type === types_1.ActionType.FOLD;
    }
    /**
     * Returns true if the action is a check
     */
    isCheck() {
        return this._type === types_1.ActionType.CHECK;
    }
    /**
     * Returns true if the action is a call
     */
    isCall() {
        return this._type === types_1.ActionType.CALL;
    }
    /**
     * Returns true if the action is a bet
     */
    isBet() {
        return this._type === types_1.ActionType.BET;
    }
    /**
     * Returns true if the action is a raise
     */
    isRaise() {
        return this._type === types_1.ActionType.RAISE;
    }
    /**
     * Returns true if the action is an all-in
     */
    isAllIn() {
        return this._type === types_1.ActionType.ALL_IN;
    }
    /**
     * Returns a string representation of the action
     */
    toString() {
        switch (this._type) {
            case types_1.ActionType.FOLD:
                return `${this._player.name} folds`;
            case types_1.ActionType.CHECK:
                return `${this._player.name} checks`;
            case types_1.ActionType.CALL:
                return `${this._player.name} calls ${this._amount}`;
            case types_1.ActionType.BET:
                return `${this._player.name} bets ${this._amount}`;
            case types_1.ActionType.RAISE:
                return `${this._player.name} raises to ${this._amount}`;
            case types_1.ActionType.ALL_IN:
                return `${this._player.name} is all-in for ${this._amount}`;
            default:
                return `${this._player.name} performs an unknown action`;
        }
    }
}
exports.Action = Action;
//# sourceMappingURL=Action.js.map