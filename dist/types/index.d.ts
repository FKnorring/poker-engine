export declare enum Suit {
    HEARTS = "HEARTS",
    DIAMONDS = "DIAMONDS",
    CLUBS = "CLUBS",
    SPADES = "SPADES"
}
export declare enum Rank {
    TWO = "2",
    THREE = "3",
    FOUR = "4",
    FIVE = "5",
    SIX = "6",
    SEVEN = "7",
    EIGHT = "8",
    NINE = "9",
    TEN = "10",
    JACK = "J",
    QUEEN = "Q",
    KING = "K",
    ACE = "A"
}
export declare enum PlayerStatus {
    ACTIVE = "ACTIVE",
    FOLDED = "FOLDED",
    ALL_IN = "ALL_IN",
    SITTING_OUT = "SITTING_OUT"
}
export declare enum PlayerPosition {
    SMALL_BLIND = "SMALL_BLIND",
    BIG_BLIND = "BIG_BLIND",
    UNDER_THE_GUN = "UNDER_THE_GUN",
    MIDDLE_POSITION = "MIDDLE_POSITION",
    CUT_OFF = "CUT_OFF",
    BUTTON = "BUTTON"
}
export declare enum GameState {
    WAITING = "WAITING",
    STARTING = "STARTING",
    PREFLOP = "PREFLOP",
    FLOP = "FLOP",
    TURN = "TURN",
    RIVER = "RIVER",
    SHOWDOWN = "SHOWDOWN",
    FINISHED = "FINISHED"
}
export declare enum ActionType {
    FOLD = "FOLD",
    CHECK = "CHECK",
    CALL = "CALL",
    BET = "BET",
    RAISE = "RAISE",
    ALL_IN = "ALL_IN"
}
export declare enum HandRank {
    HIGH_CARD = "HIGH_CARD",
    PAIR = "PAIR",
    TWO_PAIR = "TWO_PAIR",
    THREE_OF_A_KIND = "THREE_OF_A_KIND",
    STRAIGHT = "STRAIGHT",
    FLUSH = "FLUSH",
    FULL_HOUSE = "FULL_HOUSE",
    FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
    STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
    ROYAL_FLUSH = "ROYAL_FLUSH"
}
export declare enum GameVariant {
    TEXAS_HOLDEM = "TEXAS_HOLDEM",
    OMAHA = "OMAHA",
    SEVEN_CARD_STUD = "SEVEN_CARD_STUD"
}
export declare enum BettingStructure {
    NO_LIMIT = "NO_LIMIT",
    POT_LIMIT = "POT_LIMIT",
    FIXED_LIMIT = "FIXED_LIMIT"
}
export declare enum GameEngineEventType {
    GAME_STARTED = "gameStarted",
    PLAYER_ACTION = "playerAction",
    STATE_CHANGED = "stateChanged",
    ROUND_COMPLETE = "roundComplete",
    HAND_COMPLETE = "handComplete",
    GAME_ERROR = "gameError",
    PLAYER_TURN = "playerTurn"
}
export interface GameStartedEvent {
    table: import("../models/Table").Table;
    players: import("../models/Player").Player[];
    dealerPosition: number;
    blinds: {
        small: number;
        big: number;
    };
}
export interface PlayerActionEvent {
    player: import("../models/Player").Player;
    action: import("../models/Action").Action;
}
export interface StateChangedEvent {
    oldState: GameState;
    newState: GameState;
    cards?: import("../models/Card").Card[];
}
export interface HandCompleteEvent {
    winners: import("../engine/GameEngine").HandWinner[];
}
export interface PlayerTurnEvent {
    playerId: string;
    timeoutInSeconds: number;
}
export interface GameErrorEvent {
    message: string;
    error?: any;
}
export interface RoundCompleteEvent {
    round: GameState;
}
export type GameEngineEventPayload = GameStartedEvent | PlayerActionEvent | StateChangedEvent | HandCompleteEvent | PlayerTurnEvent | GameErrorEvent | RoundCompleteEvent;
