import { Action } from "../../models/Action";
import { Player } from "../../models/Player";
import { ActionType } from "../../types";

describe("Action", () => {
  let player: Player;

  beforeEach(() => {
    player = new Player("p1", "Player 1", 1000, 0);
  });

  test("should create an action with correct properties", () => {
    const action = new Action(player, ActionType.BET, 50);

    expect(action.player).toBe(player);
    expect(action.type).toBe(ActionType.BET);
    expect(action.amount).toBe(50);
    expect(action.timestamp).toBeInstanceOf(Date);
  });

  test("should validate action type", () => {
    // FOLD doesn't require an amount
    expect(() => new Action(player, ActionType.FOLD)).not.toThrow();

    // CHECK doesn't require an amount
    expect(() => new Action(player, ActionType.CHECK)).not.toThrow();

    // CALL doesn't require an explicit amount (will be determined by game state)
    expect(() => new Action(player, ActionType.CALL)).not.toThrow();

    // BET requires an amount
    expect(() => new Action(player, ActionType.BET)).toThrow();
    expect(() => new Action(player, ActionType.BET, 50)).not.toThrow();

    // RAISE requires an amount
    expect(() => new Action(player, ActionType.RAISE)).toThrow();
    expect(() => new Action(player, ActionType.RAISE, 100)).not.toThrow();

    // ALL_IN doesn't require an amount
    expect(() => new Action(player, ActionType.ALL_IN)).not.toThrow();
  });

  test("should validate bet/raise amounts", () => {
    // BET with zero or negative amount should throw
    expect(() => new Action(player, ActionType.BET, 0)).toThrow();
    expect(() => new Action(player, ActionType.BET, -10)).toThrow();

    // RAISE with zero or negative amount should throw
    expect(() => new Action(player, ActionType.RAISE, 0)).toThrow();
    expect(() => new Action(player, ActionType.RAISE, -10)).toThrow();
  });

  test("should create string representation of action", () => {
    // Test each action type's toString implementation
    const foldAction = new Action(player, ActionType.FOLD);
    expect(foldAction.toString()).toContain("folds");
    expect(foldAction.toString()).toContain(player.name);

    const checkAction = new Action(player, ActionType.CHECK);
    expect(checkAction.toString()).toContain("checks");
    expect(checkAction.toString()).toContain(player.name);

    const callAction = new Action(player, ActionType.CALL);
    expect(callAction.toString()).toContain("calls");
    expect(callAction.toString()).toContain(player.name);

    const betAction = new Action(player, ActionType.BET, 50);
    expect(betAction.toString()).toContain("bets");
    expect(betAction.toString()).toContain("50");
    expect(betAction.toString()).toContain(player.name);

    const raiseAction = new Action(player, ActionType.RAISE, 100);
    expect(raiseAction.toString()).toContain("raises");
    expect(raiseAction.toString()).toContain("100");
    expect(raiseAction.toString()).toContain(player.name);

    const allInAction = new Action(player, ActionType.ALL_IN);
    expect(allInAction.toString()).toContain("all-in");
    expect(allInAction.toString()).toContain(player.name);
  });

  test("should correctly identify action types", () => {
    const foldAction = new Action(player, ActionType.FOLD);
    expect(foldAction.isFold()).toBe(true);
    expect(foldAction.isCheck()).toBe(false);
    expect(foldAction.isCall()).toBe(false);
    expect(foldAction.isBet()).toBe(false);
    expect(foldAction.isRaise()).toBe(false);
    expect(foldAction.isAllIn()).toBe(false);

    const checkAction = new Action(player, ActionType.CHECK);
    expect(checkAction.isFold()).toBe(false);
    expect(checkAction.isCheck()).toBe(true);
    expect(checkAction.isCall()).toBe(false);
    expect(checkAction.isBet()).toBe(false);
    expect(checkAction.isRaise()).toBe(false);
    expect(checkAction.isAllIn()).toBe(false);

    const callAction = new Action(player, ActionType.CALL);
    expect(callAction.isFold()).toBe(false);
    expect(callAction.isCheck()).toBe(false);
    expect(callAction.isCall()).toBe(true);
    expect(callAction.isBet()).toBe(false);
    expect(callAction.isRaise()).toBe(false);
    expect(callAction.isAllIn()).toBe(false);

    const betAction = new Action(player, ActionType.BET, 50);
    expect(betAction.isFold()).toBe(false);
    expect(betAction.isCheck()).toBe(false);
    expect(betAction.isCall()).toBe(false);
    expect(betAction.isBet()).toBe(true);
    expect(betAction.isRaise()).toBe(false);
    expect(betAction.isAllIn()).toBe(false);

    const raiseAction = new Action(player, ActionType.RAISE, 100);
    expect(raiseAction.isFold()).toBe(false);
    expect(raiseAction.isCheck()).toBe(false);
    expect(raiseAction.isCall()).toBe(false);
    expect(raiseAction.isBet()).toBe(false);
    expect(raiseAction.isRaise()).toBe(true);
    expect(raiseAction.isAllIn()).toBe(false);

    const allInAction = new Action(player, ActionType.ALL_IN);
    expect(allInAction.isFold()).toBe(false);
    expect(allInAction.isCheck()).toBe(false);
    expect(allInAction.isCall()).toBe(false);
    expect(allInAction.isBet()).toBe(false);
    expect(allInAction.isRaise()).toBe(false);
    expect(allInAction.isAllIn()).toBe(true);
  });
});
