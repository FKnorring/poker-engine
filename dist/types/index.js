"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngineEventType = exports.BettingStructure = exports.GameVariant = exports.HandRank = exports.ActionType = exports.GameState = exports.PlayerPosition = exports.PlayerStatus = exports.Rank = exports.Suit = void 0;
// Card types
var Suit;
(function (Suit) {
    Suit["HEARTS"] = "HEARTS";
    Suit["DIAMONDS"] = "DIAMONDS";
    Suit["CLUBS"] = "CLUBS";
    Suit["SPADES"] = "SPADES";
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank["TWO"] = "2";
    Rank["THREE"] = "3";
    Rank["FOUR"] = "4";
    Rank["FIVE"] = "5";
    Rank["SIX"] = "6";
    Rank["SEVEN"] = "7";
    Rank["EIGHT"] = "8";
    Rank["NINE"] = "9";
    Rank["TEN"] = "10";
    Rank["JACK"] = "J";
    Rank["QUEEN"] = "Q";
    Rank["KING"] = "K";
    Rank["ACE"] = "A";
})(Rank || (exports.Rank = Rank = {}));
// Player types
var PlayerStatus;
(function (PlayerStatus) {
    PlayerStatus["ACTIVE"] = "ACTIVE";
    PlayerStatus["FOLDED"] = "FOLDED";
    PlayerStatus["ALL_IN"] = "ALL_IN";
    PlayerStatus["SITTING_OUT"] = "SITTING_OUT";
})(PlayerStatus || (exports.PlayerStatus = PlayerStatus = {}));
var PlayerPosition;
(function (PlayerPosition) {
    PlayerPosition["SMALL_BLIND"] = "SMALL_BLIND";
    PlayerPosition["BIG_BLIND"] = "BIG_BLIND";
    PlayerPosition["UNDER_THE_GUN"] = "UNDER_THE_GUN";
    PlayerPosition["MIDDLE_POSITION"] = "MIDDLE_POSITION";
    PlayerPosition["CUT_OFF"] = "CUT_OFF";
    PlayerPosition["BUTTON"] = "BUTTON";
})(PlayerPosition || (exports.PlayerPosition = PlayerPosition = {}));
// Game state types
var GameState;
(function (GameState) {
    GameState["WAITING"] = "WAITING";
    GameState["STARTING"] = "STARTING";
    GameState["PREFLOP"] = "PREFLOP";
    GameState["FLOP"] = "FLOP";
    GameState["TURN"] = "TURN";
    GameState["RIVER"] = "RIVER";
    GameState["SHOWDOWN"] = "SHOWDOWN";
    GameState["FINISHED"] = "FINISHED";
})(GameState || (exports.GameState = GameState = {}));
// Action types
var ActionType;
(function (ActionType) {
    ActionType["FOLD"] = "FOLD";
    ActionType["CHECK"] = "CHECK";
    ActionType["CALL"] = "CALL";
    ActionType["BET"] = "BET";
    ActionType["RAISE"] = "RAISE";
    ActionType["ALL_IN"] = "ALL_IN";
})(ActionType || (exports.ActionType = ActionType = {}));
// Hand ranking types
var HandRank;
(function (HandRank) {
    HandRank["HIGH_CARD"] = "HIGH_CARD";
    HandRank["PAIR"] = "PAIR";
    HandRank["TWO_PAIR"] = "TWO_PAIR";
    HandRank["THREE_OF_A_KIND"] = "THREE_OF_A_KIND";
    HandRank["STRAIGHT"] = "STRAIGHT";
    HandRank["FLUSH"] = "FLUSH";
    HandRank["FULL_HOUSE"] = "FULL_HOUSE";
    HandRank["FOUR_OF_A_KIND"] = "FOUR_OF_A_KIND";
    HandRank["STRAIGHT_FLUSH"] = "STRAIGHT_FLUSH";
    HandRank["ROYAL_FLUSH"] = "ROYAL_FLUSH";
})(HandRank || (exports.HandRank = HandRank = {}));
// Game variants
var GameVariant;
(function (GameVariant) {
    GameVariant["TEXAS_HOLDEM"] = "TEXAS_HOLDEM";
    GameVariant["OMAHA"] = "OMAHA";
    GameVariant["SEVEN_CARD_STUD"] = "SEVEN_CARD_STUD";
})(GameVariant || (exports.GameVariant = GameVariant = {}));
// Betting structure
var BettingStructure;
(function (BettingStructure) {
    BettingStructure["NO_LIMIT"] = "NO_LIMIT";
    BettingStructure["POT_LIMIT"] = "POT_LIMIT";
    BettingStructure["FIXED_LIMIT"] = "FIXED_LIMIT";
})(BettingStructure || (exports.BettingStructure = BettingStructure = {}));
// Game engine event types and payloads
var GameEngineEventType;
(function (GameEngineEventType) {
    GameEngineEventType["GAME_STARTED"] = "gameStarted";
    GameEngineEventType["PLAYER_ACTION"] = "playerAction";
    GameEngineEventType["STATE_CHANGED"] = "stateChanged";
    GameEngineEventType["ROUND_COMPLETE"] = "roundComplete";
    GameEngineEventType["HAND_COMPLETE"] = "handComplete";
    GameEngineEventType["GAME_ERROR"] = "gameError";
    GameEngineEventType["PLAYER_TURN"] = "playerTurn";
})(GameEngineEventType || (exports.GameEngineEventType = GameEngineEventType = {}));
//# sourceMappingURL=index.js.map