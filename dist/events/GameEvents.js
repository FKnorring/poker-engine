"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEventType = void 0;
/**
 * Enum defining all possible game events
 */
var GameEventType;
(function (GameEventType) {
    // Game lifecycle events
    GameEventType["GAME_CREATED"] = "game:created";
    GameEventType["GAME_STARTED"] = "game:started";
    GameEventType["GAME_ENDED"] = "game:ended";
    // State machine events
    GameEventType["STATE_CHANGED"] = "state:changed";
    // Player events
    GameEventType["PLAYER_JOINED"] = "player:joined";
    GameEventType["PLAYER_LEFT"] = "player:left";
    GameEventType["PLAYER_READY"] = "player:ready";
    GameEventType["PLAYER_SITTING_OUT"] = "player:sittingOut";
    GameEventType["PLAYER_ACTION"] = "player:action";
    // Dealer events
    GameEventType["HAND_DEALT"] = "hand:dealt";
    GameEventType["COMMUNITY_CARDS_DEALT"] = "community:cardsDealt";
    // Betting events
    GameEventType["BLINDS_POSTED"] = "betting:blindsPosted";
    GameEventType["BETTING_ROUND_STARTED"] = "betting:roundStarted";
    GameEventType["BETTING_ROUND_ENDED"] = "betting:roundEnded";
    // Showdown events
    GameEventType["SHOWDOWN_STARTED"] = "showdown:started";
    GameEventType["HAND_REVEALED"] = "hand:revealed";
    GameEventType["HAND_WINNERS"] = "hand:winners";
    // Pot events
    GameEventType["POT_CREATED"] = "pot:created";
    GameEventType["POT_UPDATED"] = "pot:updated";
    GameEventType["POT_AWARDED"] = "pot:awarded";
    // Timer events
    GameEventType["TIMER_STARTED"] = "timer:started";
    GameEventType["TIMER_ENDED"] = "timer:ended";
    // Error events
    GameEventType["ERROR"] = "error";
})(GameEventType || (exports.GameEventType = GameEventType = {}));
//# sourceMappingURL=GameEvents.js.map