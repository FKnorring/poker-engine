import { PlayerPosition, PlayerStatus } from "../types";
import { Card } from "./Card";
import { Hand } from "./Hand";
export interface PlayerActionHistory {
    street: string;
    action: string;
    amount: number;
    timestamp: Date;
}
export declare class Player {
    private _id;
    private _name;
    private _stack;
    private _hand;
    private _position;
    private _status;
    private _currentBet;
    private _actionHistory;
    private _seatIndex;
    constructor(id: string, name: string, stack: number, seatIndex: number);
    get id(): string;
    get name(): string;
    get stack(): number;
    set stack(value: number);
    get hand(): Hand;
    get holeCards(): Card[];
    /**
     * Deals cards to the player's hand
     */
    dealCards(cards: Card[]): void;
    /**
     * Clears the player's hand (end of round)
     */
    clearHand(): void;
    get position(): PlayerPosition | null;
    set position(position: PlayerPosition | null);
    get status(): PlayerStatus;
    set status(status: PlayerStatus);
    get currentBet(): number;
    set currentBet(amount: number);
    get actionHistory(): PlayerActionHistory[];
    get seatIndex(): number;
    /**
     * Adds to the player's action history
     */
    addAction(street: string, action: string, amount: number): void;
    /**
     * Clears action history (end of hand)
     */
    clearActionHistory(): void;
    /**
     * Places a bet (reduces stack by amount)
     * @returns The actual amount bet (in case player doesn't have enough)
     */
    placeBet(amount: number): number;
    /**
     * Adds winnings to player's stack
     */
    addWinnings(amount: number): void;
    /**
     * Resets the player's bet amount (end of street)
     */
    resetBet(): void;
    /**
     * Checks if the player is active in the current hand
     */
    isActive(): boolean;
    /**
     * Checks if the player is all-in
     */
    isAllIn(): boolean;
    /**
     * Checks if the player has folded
     */
    hasFolded(): boolean;
    /**
     * Checks if the player is sitting out
     */
    isSittingOut(): boolean;
    /**
     * Checks if the player has any chips left
     */
    hasChips(): boolean;
}
