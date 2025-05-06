import { BettingStructure, GameState, GameVariant } from "../types";
import { Card } from "./Card";
import { Player } from "./Player";
import { PotManager } from "./Pot";
export interface TableOptions {
    id: string;
    name: string;
    maxPlayers: number;
    smallBlind: number;
    bigBlind: number;
    minBuyIn: number;
    maxBuyIn: number;
    gameVariant: GameVariant;
    bettingStructure: BettingStructure;
}
export interface TableSnapshot {
    id: string;
    name: string;
    players: Player[];
    communityCards: Card[];
    potAmount: number;
    currentState: GameState;
    buttonPosition: number;
    activePlayerIndex: number;
    smallBlind: number;
    bigBlind: number;
    currentBet: number;
    minRaise: number;
}
export declare class Table {
    private readonly _id;
    private readonly _name;
    private readonly _maxPlayers;
    private readonly _smallBlind;
    private readonly _bigBlind;
    private readonly _minBuyIn;
    private readonly _maxBuyIn;
    private readonly _gameVariant;
    private readonly _bettingStructure;
    private _players;
    private _communityCards;
    private _potManager;
    private _state;
    private _buttonPosition;
    private _activePlayerIndex;
    private _currentBet;
    private _minRaise;
    private _handNumber;
    constructor(options: TableOptions);
    get id(): string;
    get name(): string;
    get maxPlayers(): number;
    get smallBlind(): number;
    get bigBlind(): number;
    get minBuyIn(): number;
    get maxBuyIn(): number;
    get gameVariant(): GameVariant;
    get bettingStructure(): BettingStructure;
    get players(): (Player | null)[];
    get activePlayers(): Player[];
    get communityCards(): Card[];
    get potManager(): PotManager;
    get totalPot(): number;
    get state(): GameState;
    set state(state: GameState);
    get buttonPosition(): number;
    get activePlayerIndex(): number;
    set activePlayerIndex(index: number);
    get activePlayer(): Player | null;
    get currentBet(): number;
    set currentBet(amount: number);
    get minRaise(): number;
    set minRaise(amount: number);
    get handNumber(): number;
    /**
     * Adds a community card to the table
     */
    addCommunityCard(card: Card): void;
    /**
     * Adds multiple community cards to the table
     */
    addCommunityCards(cards: Card[]): void;
    /**
     * Clears all community cards from the table
     */
    clearCommunityCards(): void;
    /**
     * Tries to seat a player at the table
     * @returns true if player was seated, false if table is full
     */
    seatPlayer(player: Player, seatIndex: number): boolean;
    /**
     * Removes a player from the table
     */
    removePlayer(playerId: string): boolean;
    /**
     * Moves the button to the next active player
     */
    moveButton(): void;
    /**
     * Increments the hand number
     */
    startNewHand(): void;
    /**
     * Returns a snapshot of the current table state
     */
    getSnapshot(): TableSnapshot;
    /**
     * Helper method to get indices of seats with active players
     */
    private _getActiveSeatIndices;
    /**
     * Debug helper to log all player information
     */
    logPlayerDetails(): void;
    /**
     * Direct method to force add a player to a seat (for debugging)
     */
    forceAddPlayer(player: Player, seatIndex: number): boolean;
}
