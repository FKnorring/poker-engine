import { Player } from "./Player";
export interface PotContributor {
    player: Player;
    amount: number;
}
export declare class Pot {
    private _amount;
    private _contributors;
    private _eligiblePlayers;
    constructor();
    get amount(): number;
    /**
     * Adds chips to the pot from a player
     */
    addChips(player: Player, amount: number): void;
    /**
     * Returns all players who have contributed to this pot
     */
    getContributors(): PotContributor[];
    /**
     * Returns all players eligible to win this pot
     */
    getEligiblePlayers(): Player[];
    /**
     * Checks if a player is eligible to win this pot
     */
    isPlayerEligible(playerId: string): boolean;
    /**
     * Marks a player as ineligible to win this pot (e.g., after folding)
     */
    removeEligiblePlayer(playerId: string): void;
    /**
     * Resets the pot for a new hand
     */
    clear(): void;
}
export declare class PotManager {
    private _mainPot;
    private _sidePots;
    private _currentBets;
    constructor();
    get mainPot(): Pot;
    get sidePots(): Pot[];
    get totalPotAmount(): number;
    /**
     * Records a bet from a player for the current street
     */
    addBet(player: Player, amount: number): void;
    /**
     * Moves all current bets into the pot(s) at the end of a betting round
     * Creates side pots if necessary when players are all-in
     */
    collectBets(): void;
    /**
     * Marks a player as ineligible to win pots (e.g., after folding)
     */
    removeEligiblePlayer(playerId: string): void;
    /**
     * Resets all pots for a new hand
     */
    clear(): void;
    /**
     * Helper method to find a player by ID
     * In a real implementation, this would likely be handled by a PlayerManager
     */
    private _findPlayerById;
}
