import { Card } from "../models/Card";
import { Player } from "../models/Player";
import { Pot } from "../models/Pot";
import { Action } from "../models/Action";
import { GameState } from "../types";
/**
 * Enum defining all possible game events
 */
export declare enum GameEventType {
    GAME_CREATED = "game:created",
    GAME_STARTED = "game:started",
    GAME_ENDED = "game:ended",
    STATE_CHANGED = "state:changed",
    PLAYER_JOINED = "player:joined",
    PLAYER_LEFT = "player:left",
    PLAYER_READY = "player:ready",
    PLAYER_SITTING_OUT = "player:sittingOut",
    PLAYER_ACTION = "player:action",
    HAND_DEALT = "hand:dealt",
    COMMUNITY_CARDS_DEALT = "community:cardsDealt",
    BLINDS_POSTED = "betting:blindsPosted",
    BETTING_ROUND_STARTED = "betting:roundStarted",
    BETTING_ROUND_ENDED = "betting:roundEnded",
    SHOWDOWN_STARTED = "showdown:started",
    HAND_REVEALED = "hand:revealed",
    HAND_WINNERS = "hand:winners",
    POT_CREATED = "pot:created",
    POT_UPDATED = "pot:updated",
    POT_AWARDED = "pot:awarded",
    TIMER_STARTED = "timer:started",
    TIMER_ENDED = "timer:ended",
    ERROR = "error"
}
/**
 * Data type definitions for game events
 */
export interface GameEventData {
    [GameEventType.GAME_CREATED]: {
        gameId: string;
        timestamp: number;
        maxPlayers: number;
        blinds: {
            small: number;
            big: number;
        };
    };
    [GameEventType.GAME_STARTED]: {
        gameId: string;
        timestamp: number;
        players: Player[];
        dealerPosition: number;
    };
    [GameEventType.GAME_ENDED]: {
        gameId: string;
        timestamp: number;
        players: Player[];
        duration: number;
    };
    [GameEventType.STATE_CHANGED]: {
        previousState: GameState;
        currentState: GameState;
        timestamp: number;
    };
    [GameEventType.PLAYER_JOINED]: {
        playerId: string;
        player: Player;
        seatIndex: number;
        timestamp: number;
    };
    [GameEventType.PLAYER_LEFT]: {
        playerId: string;
        seatIndex: number;
        timestamp: number;
    };
    [GameEventType.PLAYER_READY]: {
        playerId: string;
        timestamp: number;
    };
    [GameEventType.PLAYER_SITTING_OUT]: {
        playerId: string;
        timestamp: number;
    };
    [GameEventType.PLAYER_ACTION]: {
        playerId: string;
        action: Action;
        timestamp: number;
    };
    [GameEventType.HAND_DEALT]: {
        playerId: string;
        holeCards: Card[];
        timestamp: number;
    };
    [GameEventType.COMMUNITY_CARDS_DEALT]: {
        cards: Card[];
        street: GameState;
        timestamp: number;
    };
    [GameEventType.BLINDS_POSTED]: {
        smallBlind: {
            player: Player;
            amount: number;
        };
        bigBlind: {
            player: Player;
            amount: number;
        };
        timestamp: number;
    };
    [GameEventType.BETTING_ROUND_STARTED]: {
        street: GameState;
        activePlayer: Player;
        timestamp: number;
    };
    [GameEventType.BETTING_ROUND_ENDED]: {
        street: GameState;
        pot: number;
        timestamp: number;
    };
    [GameEventType.SHOWDOWN_STARTED]: {
        timestamp: number;
    };
    [GameEventType.HAND_REVEALED]: {
        playerId: string;
        holeCards: Card[];
        handDescription: string;
        timestamp: number;
    };
    [GameEventType.HAND_WINNERS]: {
        winners: Array<{
            playerId: string;
            handDescription: string;
            winAmount: number;
        }>;
        timestamp: number;
    };
    [GameEventType.POT_CREATED]: {
        pot: Pot;
        timestamp: number;
    };
    [GameEventType.POT_UPDATED]: {
        pot: Pot;
        timestamp: number;
    };
    [GameEventType.POT_AWARDED]: {
        pot: Pot;
        winners: Player[];
        amounts: Record<string, number>;
        timestamp: number;
    };
    [GameEventType.TIMER_STARTED]: {
        playerId: string;
        durationMs: number;
        timestamp: number;
    };
    [GameEventType.TIMER_ENDED]: {
        playerId: string;
        timestamp: number;
    };
    [GameEventType.ERROR]: {
        code: string;
        message: string;
        timestamp: number;
    };
}
