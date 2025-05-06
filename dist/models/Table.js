"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
const types_1 = require("../types");
const Pot_1 = require("./Pot");
class Table {
    constructor(options) {
        this._id = options.id;
        this._name = options.name;
        this._maxPlayers = options.maxPlayers;
        this._smallBlind = options.smallBlind;
        this._bigBlind = options.bigBlind;
        this._minBuyIn = options.minBuyIn;
        this._maxBuyIn = options.maxBuyIn;
        this._gameVariant = options.gameVariant;
        this._bettingStructure = options.bettingStructure;
        // Initialize empty seats
        this._players = Array(this._maxPlayers).fill(null);
        this._communityCards = [];
        this._potManager = new Pot_1.PotManager();
        this._state = types_1.GameState.WAITING;
        this._buttonPosition = 0;
        this._activePlayerIndex = -1;
        this._currentBet = 0;
        this._minRaise = this._bigBlind;
        this._handNumber = 0;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get maxPlayers() {
        return this._maxPlayers;
    }
    get smallBlind() {
        return this._smallBlind;
    }
    get bigBlind() {
        return this._bigBlind;
    }
    get minBuyIn() {
        return this._minBuyIn;
    }
    get maxBuyIn() {
        return this._maxBuyIn;
    }
    get gameVariant() {
        return this._gameVariant;
    }
    get bettingStructure() {
        return this._bettingStructure;
    }
    get players() {
        return [...this._players];
    }
    get activePlayers() {
        const active = this._players.filter((player) => player !== null && (player.isActive() || player.isAllIn()));
        return active;
    }
    get communityCards() {
        return [...this._communityCards];
    }
    get potManager() {
        return this._potManager;
    }
    get totalPot() {
        return this._potManager.totalPotAmount;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
    }
    get buttonPosition() {
        return this._buttonPosition;
    }
    get activePlayerIndex() {
        return this._activePlayerIndex;
    }
    set activePlayerIndex(index) {
        this._activePlayerIndex = index;
    }
    get activePlayer() {
        if (this._activePlayerIndex < 0 ||
            this._activePlayerIndex >= this._players.length) {
            return null;
        }
        return this._players[this._activePlayerIndex];
    }
    get currentBet() {
        return this._currentBet;
    }
    set currentBet(amount) {
        this._currentBet = amount;
    }
    get minRaise() {
        return this._minRaise;
    }
    set minRaise(amount) {
        this._minRaise = amount;
    }
    get handNumber() {
        return this._handNumber;
    }
    /**
     * Adds a community card to the table
     */
    addCommunityCard(card) {
        this._communityCards.push(card);
    }
    /**
     * Adds multiple community cards to the table
     */
    addCommunityCards(cards) {
        this._communityCards.push(...cards);
    }
    /**
     * Clears all community cards from the table
     */
    clearCommunityCards() {
        this._communityCards = [];
    }
    /**
     * Tries to seat a player at the table
     * @returns true if player was seated, false if table is full
     */
    seatPlayer(player, seatIndex) {
        if (seatIndex < 0 || seatIndex >= this._maxPlayers) {
            return false;
        }
        if (this._players[seatIndex] !== null) {
            return false;
        }
        // Add the player to the seat
        this._players[seatIndex] = player;
        return true;
    }
    /**
     * Removes a player from the table
     */
    removePlayer(playerId) {
        const playerIndex = this._players.findIndex((player) => player !== null && player.id === playerId);
        if (playerIndex === -1) {
            return false;
        }
        this._players[playerIndex] = null;
        return true;
    }
    /**
     * Moves the button to the next active player
     */
    moveButton() {
        const activeSeatIndices = this._getActiveSeatIndices();
        if (activeSeatIndices.length <= 1) {
            return; // Can't move button with 0 or 1 players
        }
        let nextPos = (this._buttonPosition + 1) % this._maxPlayers;
        // Find the next seat with an active player
        while (!activeSeatIndices.includes(nextPos)) {
            nextPos = (nextPos + 1) % this._maxPlayers;
        }
        this._buttonPosition = nextPos;
    }
    /**
     * Increments the hand number
     */
    startNewHand() {
        this._handNumber++;
        this._currentBet = 0;
        this._minRaise = this._bigBlind;
        this.clearCommunityCards();
        this._potManager.clear();
    }
    /**
     * Returns a snapshot of the current table state
     */
    getSnapshot() {
        const activePlayers = this.activePlayers;
        return {
            id: this._id,
            name: this._name,
            players: activePlayers,
            communityCards: this.communityCards,
            potAmount: this.totalPot,
            currentState: this._state,
            buttonPosition: this._buttonPosition,
            activePlayerIndex: this._activePlayerIndex,
            smallBlind: this._smallBlind,
            bigBlind: this._bigBlind,
            currentBet: this._currentBet,
            minRaise: this._minRaise,
        };
    }
    /**
     * Helper method to get indices of seats with active players
     */
    _getActiveSeatIndices() {
        return this._players
            .map((player, index) => ({ player, index }))
            .filter((item) => item.player !== null)
            .map((item) => item.index);
    }
    /**
     * Debug helper to log all player information
     */
    logPlayerDetails() {
        console.log(`DEBUG: Table.logPlayerDetails - Table ${this._name} (${this._id}) players:`);
        this._players.forEach((player, index) => {
            if (player === null) {
                console.log(`  Seat ${index}: Empty`);
            }
            else {
                console.log(`  Seat ${index}: ${player.name} (${player.id}), Status: ${player.status}, Stack: ${player.stack}`);
            }
        });
        console.log(`  Active players: ${this.activePlayers.length}`);
        console.log(`  Total non-null players: ${this._players.filter((p) => p !== null).length}`);
    }
    /**
     * Direct method to force add a player to a seat (for debugging)
     */
    forceAddPlayer(player, seatIndex) {
        if (seatIndex < 0 || seatIndex >= this.maxPlayers) {
            return false;
        }
        // Set player directly in the players array
        this._players[seatIndex] = player;
        // Verify
        return this._players[seatIndex] === player;
    }
}
exports.Table = Table;
//# sourceMappingURL=Table.js.map