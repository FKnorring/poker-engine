import { ActionType } from "../types";
import { Player } from "./Player";

export class Action {
  private readonly _player: Player;
  private readonly _type: ActionType;
  private readonly _amount: number;
  private readonly _timestamp: Date;

  constructor(player: Player, type: ActionType, amount: number = 0) {
    if (type === ActionType.BET || type === ActionType.RAISE) {
      if (amount <= 0 || !amount) {
        throw new Error("Amount must be positive");
      }
    }

    this._player = player;
    this._type = type;
    this._amount = amount;
    this._timestamp = new Date();
  }

  get player(): Player {
    return this._player;
  }

  get type(): ActionType {
    return this._type;
  }

  get amount(): number {
    return this._amount;
  }

  get timestamp(): Date {
    return this._timestamp;
  }

  /**
   * Returns true if the action is a fold
   */
  isFold(): boolean {
    return this._type === ActionType.FOLD;
  }

  /**
   * Returns true if the action is a check
   */
  isCheck(): boolean {
    return this._type === ActionType.CHECK;
  }

  /**
   * Returns true if the action is a call
   */
  isCall(): boolean {
    return this._type === ActionType.CALL;
  }

  /**
   * Returns true if the action is a bet
   */
  isBet(): boolean {
    return this._type === ActionType.BET;
  }

  /**
   * Returns true if the action is a raise
   */
  isRaise(): boolean {
    return this._type === ActionType.RAISE;
  }

  /**
   * Returns true if the action is an all-in
   */
  isAllIn(): boolean {
    return this._type === ActionType.ALL_IN;
  }

  /**
   * Returns a string representation of the action
   */
  toString(): string {
    switch (this._type) {
      case ActionType.FOLD:
        return `${this._player.name} folds`;
      case ActionType.CHECK:
        return `${this._player.name} checks`;
      case ActionType.CALL:
        return `${this._player.name} calls ${this._amount}`;
      case ActionType.BET:
        return `${this._player.name} bets ${this._amount}`;
      case ActionType.RAISE:
        return `${this._player.name} raises to ${this._amount}`;
      case ActionType.ALL_IN:
        return `${this._player.name} is all-in for ${this._amount}`;
      default:
        return `${this._player.name} performs an unknown action`;
    }
  }
}
