import { Player } from "./Player";

export interface PotContributor {
  player: Player;
  amount: number;
}

export class Pot {
  private _amount: number;
  private _contributors: Map<string, PotContributor>;
  private _eligiblePlayers: Set<string>;

  constructor() {
    this._amount = 0;
    this._contributors = new Map<string, PotContributor>();
    this._eligiblePlayers = new Set<string>();
  }

  get amount(): number {
    return this._amount;
  }

  /**
   * Adds chips to the pot from a player
   */
  addChips(player: Player, amount: number): void {
    this._amount += amount;

    const playerId = player.id;
    const existingContribution = this._contributors.get(playerId);

    if (existingContribution) {
      existingContribution.amount += amount;
    } else {
      this._contributors.set(playerId, { player, amount });
    }

    // Player who contributes to a pot is eligible to win it
    this._eligiblePlayers.add(playerId);
  }

  /**
   * Returns all players who have contributed to this pot
   */
  getContributors(): PotContributor[] {
    return Array.from(this._contributors.values());
  }

  /**
   * Returns all players eligible to win this pot
   */
  getEligiblePlayers(): Player[] {
    return Array.from(this._eligiblePlayers)
      .map((id) => this._contributors.get(id)?.player)
      .filter((player): player is Player => player !== undefined);
  }

  /**
   * Checks if a player is eligible to win this pot
   */
  isPlayerEligible(playerId: string): boolean {
    return this._eligiblePlayers.has(playerId);
  }

  /**
   * Marks a player as ineligible to win this pot (e.g., after folding)
   */
  removeEligiblePlayer(playerId: string): void {
    this._eligiblePlayers.delete(playerId);
  }

  /**
   * Resets the pot for a new hand
   */
  clear(): void {
    this._amount = 0;
    this._contributors.clear();
    this._eligiblePlayers.clear();
  }
}

export class PotManager {
  private _mainPot: Pot;
  private _sidePots: Pot[];
  private _currentBets: Map<string, number>;

  constructor() {
    this._mainPot = new Pot();
    this._sidePots = [];
    this._currentBets = new Map<string, number>();
  }

  get mainPot(): Pot {
    return this._mainPot;
  }

  get sidePots(): Pot[] {
    return [...this._sidePots];
  }

  get totalPotAmount(): number {
    const mainAmount = this._mainPot.amount;
    const sideAmount = this._sidePots.reduce((sum, pot) => sum + pot.amount, 0);
    const currentBetsAmount = Array.from(this._currentBets.values()).reduce(
      (sum, bet) => sum + bet,
      0
    );

    return mainAmount + sideAmount + currentBetsAmount;
  }

  /**
   * Records a bet from a player for the current street
   */
  addBet(playerId: string, amount: number): void {
    const currentBet = this._currentBets.get(playerId) || 0;
    this._currentBets.set(playerId, currentBet + amount);
  }

  /**
   * Moves all current bets into the pot(s) at the end of a betting round
   * Creates side pots if necessary when players are all-in
   */
  collectBets(): void {
    // If there are no bets, nothing to do
    if (this._currentBets.size === 0) {
      return;
    }

    // Sort players by their bet amount to identify potential side pots
    const bets = Array.from(this._currentBets.entries())
      .map(([playerId, amount]) => ({
        playerId,
        amount,
      }))
      .sort((a, b) => a.amount - b.amount);

    // Process bets and create side pots
    let prevAmount = 0;
    for (let i = 0; i < bets.length; i++) {
      const { playerId, amount } = bets[i];

      // Skip players who didn't bet
      if (amount === 0) continue;

      // Get the player who made this bet
      const player = this._findPlayerById(playerId);
      if (!player) continue;

      // The amount this player contributes to the current level
      const contribution = amount - prevAmount;

      if (contribution > 0) {
        // If this is the first player or contributing to main pot
        if (i === 0 || this._sidePots.length === 0) {
          this._mainPot.addChips(player, contribution);
        } else {
          // This creates or adds to the side pot for this level
          const sidePotIndex = i - 1;

          // Create new side pot if needed
          if (sidePotIndex >= this._sidePots.length) {
            this._sidePots.push(new Pot());
          }

          // Add chips to the appropriate side pot
          this._sidePots[sidePotIndex].addChips(player, contribution);
        }
      }

      // For the next player, we start from this amount
      prevAmount = amount;
    }

    // Clear current bets after collecting
    this._currentBets.clear();
  }

  /**
   * Marks a player as ineligible to win pots (e.g., after folding)
   */
  removeEligiblePlayer(playerId: string): void {
    this._mainPot.removeEligiblePlayer(playerId);
    this._sidePots.forEach((pot) => pot.removeEligiblePlayer(playerId));
  }

  /**
   * Resets all pots for a new hand
   */
  clear(): void {
    this._mainPot.clear();
    this._sidePots = [];
    this._currentBets.clear();
  }

  /**
   * Helper method to find a player by ID
   * In a real implementation, this would likely be handled by a PlayerManager
   */
  private _findPlayerById(playerId: string): Player | undefined {
    // In a real implementation, we would have a reference to all players
    // For now, we'll look through the main pot contributors
    const contributor = this._mainPot
      .getContributors()
      .find((c) => c.player.id === playerId);
    return contributor?.player;
  }
}
