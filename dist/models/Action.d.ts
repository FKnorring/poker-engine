import { ActionType } from "../types";
import { Player } from "./Player";
export declare class Action {
    private readonly _player;
    private readonly _type;
    private readonly _amount;
    private readonly _timestamp;
    constructor(player: Player, type: ActionType, amount?: number);
    get player(): Player;
    get type(): ActionType;
    get amount(): number;
    get timestamp(): Date;
    /**
     * Returns true if the action is a fold
     */
    isFold(): boolean;
    /**
     * Returns true if the action is a check
     */
    isCheck(): boolean;
    /**
     * Returns true if the action is a call
     */
    isCall(): boolean;
    /**
     * Returns true if the action is a bet
     */
    isBet(): boolean;
    /**
     * Returns true if the action is a raise
     */
    isRaise(): boolean;
    /**
     * Returns true if the action is an all-in
     */
    isAllIn(): boolean;
    /**
     * Returns a string representation of the action
     */
    toString(): string;
}
