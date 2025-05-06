// Card types
export enum Suit {
  HEARTS = "HEARTS",
  DIAMONDS = "DIAMONDS",
  CLUBS = "CLUBS",
  SPADES = "SPADES",
}

export enum Rank {
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
  ACE = "A",
}

// Player types
export enum PlayerStatus {
  ACTIVE = "ACTIVE",
  FOLDED = "FOLDED",
  ALL_IN = "ALL_IN",
  SITTING_OUT = "SITTING_OUT",
}

export enum PlayerPosition {
  SMALL_BLIND = "SMALL_BLIND",
  BIG_BLIND = "BIG_BLIND",
  UNDER_THE_GUN = "UNDER_THE_GUN",
  MIDDLE_POSITION = "MIDDLE_POSITION",
  CUT_OFF = "CUT_OFF",
  BUTTON = "BUTTON",
}

// Game state types
export enum GameState {
  WAITING = "WAITING",
  STARTING = "STARTING",
  PREFLOP = "PREFLOP",
  FLOP = "FLOP",
  TURN = "TURN",
  RIVER = "RIVER",
  SHOWDOWN = "SHOWDOWN",
  FINISHED = "FINISHED",
}

// Action types
export enum ActionType {
  FOLD = "FOLD",
  CHECK = "CHECK",
  CALL = "CALL",
  BET = "BET",
  RAISE = "RAISE",
  ALL_IN = "ALL_IN",
}

// Hand ranking types
export enum HandRank {
  HIGH_CARD = "HIGH_CARD",
  PAIR = "PAIR",
  TWO_PAIR = "TWO_PAIR",
  THREE_OF_A_KIND = "THREE_OF_A_KIND",
  STRAIGHT = "STRAIGHT",
  FLUSH = "FLUSH",
  FULL_HOUSE = "FULL_HOUSE",
  FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  ROYAL_FLUSH = "ROYAL_FLUSH",
}

// Game variants
export enum GameVariant {
  TEXAS_HOLDEM = "TEXAS_HOLDEM",
  OMAHA = "OMAHA",
  SEVEN_CARD_STUD = "SEVEN_CARD_STUD",
}

// Betting structure
export enum BettingStructure {
  NO_LIMIT = "NO_LIMIT",
  POT_LIMIT = "POT_LIMIT",
  FIXED_LIMIT = "FIXED_LIMIT",
}

// Game engine event types and payloads
export enum GameEngineEventType {
  GAME_STARTED = "gameStarted",
  PLAYER_ACTION = "playerAction",
  STATE_CHANGED = "stateChanged",
  ROUND_COMPLETE = "roundComplete",
  HAND_COMPLETE = "handComplete",
  GAME_ERROR = "gameError",
  PLAYER_TURN = "playerTurn",
}

// Payload for the 'gameStarted' event
export interface GameStartedEvent {
  table: import("../models/Table").Table;
  players: import("../models/Player").Player[];
  dealerPosition: number;
  blinds: {
    small: number;
    big: number;
  };
}

// Payload for the 'playerAction' event
export interface PlayerActionEvent {
  player: import("../models/Player").Player;
  action: import("../models/Action").Action;
}

// Payload for the 'stateChanged' event
export interface StateChangedEvent {
  oldState: GameState;
  newState: GameState;
  cards?: import("../models/Card").Card[];
}

// Payload for the 'handComplete' event
export interface HandCompleteEvent {
  winners: import("../engine/GameEngine").HandWinner[];
}

// Payload for the 'playerTurn' event
export interface PlayerTurnEvent {
  playerId: string;
  timeoutInSeconds: number;
}

// Payload for the 'gameError' event (not currently used, but for future-proofing)
export interface GameErrorEvent {
  message: string;
  error?: any;
}

// Payload for the 'roundComplete' event (not currently used, but for future-proofing)
export interface RoundCompleteEvent {
  round: GameState;
}

// Union type for all event payloads
export type GameEngineEventPayload =
  | GameStartedEvent
  | PlayerActionEvent
  | StateChangedEvent
  | HandCompleteEvent
  | PlayerTurnEvent
  | GameErrorEvent
  | RoundCompleteEvent;
