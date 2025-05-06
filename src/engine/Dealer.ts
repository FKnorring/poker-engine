import { Card } from "../models/Card";
import { Deck } from "../models/Deck";
import { Player } from "../models/Player";
import { Table } from "../models/Table";

/**
 * Dealer - Manages deck and card dealing logic
 *
 * The Dealer component abstracts all card dealing operations from the game engine,
 * providing a clean interface for handling the deck and dealing cards to players
 * and the community board.
 */
export class Dealer {
  private deck: Deck;
  private burnCards: Card[] = [];

  constructor() {
    this.deck = new Deck();
    this.reset();
  }

  /**
   * Reset the dealer's deck and burned cards
   */
  public reset(): void {
    this.deck = new Deck();
    this.deck.shuffle();
    this.burnCards = [];
  }

  /**
   * Deal hole cards to players
   * @param players Array of players to deal cards to
   * @param cardsPerPlayer Number of hole cards per player (2 for Hold'em, 4 for Omaha)
   * @returns Map of player IDs to their dealt cards
   */
  public dealHoleCards(
    players: Player[],
    cardsPerPlayer: number = 2
  ): Map<string, Card[]> {
    const dealtCards = new Map<string, Card[]>();

    // Clear any existing cards from players' hands
    players.forEach((player) => {
      if (player) {
        player.hand.clear();
      }
    });

    // Deal cards in a round-robin fashion (as in real poker)
    for (let round = 0; round < cardsPerPlayer; round++) {
      for (const player of players) {
        if (player && player.isActive()) {
          const card = this.deck.draw();
          if (card) {
            player.hand.addCard(card);

            // Track dealt cards
            if (!dealtCards.has(player.id)) {
              dealtCards.set(player.id, []);
            }
            const playerCards = dealtCards.get(player.id);
            if (playerCards) {
              playerCards.push(card);
            }
          }
        }
      }
    }

    return dealtCards;
  }

  /**
   * Burn a card before dealing community cards (standard poker procedure)
   * @returns The burned card
   */
  public burnCard(): Card | undefined {
    const burnCard = this.deck.draw();
    if (burnCard) {
      this.burnCards.push(burnCard);
    }
    return burnCard;
  }

  /**
   * Deal the flop (first 3 community cards)
   * @param table The table to deal community cards to
   * @returns The 3 flop cards
   */
  public dealFlop(table: Table): Card[] {
    // Burn a card first
    this.burnCard();

    // Deal 3 cards for the flop
    const flopCards = this.deck.drawMultiple(3);
    table.addCommunityCards(flopCards);

    return flopCards;
  }

  /**
   * Deal the turn (4th community card)
   * @param table The table to deal the turn card to
   * @returns The turn card
   */
  public dealTurn(table: Table): Card | undefined {
    // Burn a card first
    this.burnCard();

    // Deal the turn card
    const turnCard = this.deck.draw();
    if (turnCard) {
      table.addCommunityCards([turnCard]);
    }

    return turnCard;
  }

  /**
   * Deal the river (5th community card)
   * @param table The table to deal the river card to
   * @returns The river card
   */
  public dealRiver(table: Table): Card | undefined {
    // Burn a card first
    this.burnCard();

    // Deal the river card
    const riverCard = this.deck.draw();
    if (riverCard) {
      table.addCommunityCards([riverCard]);
    }

    return riverCard;
  }

  /**
   * Deal specific community cards for testing purposes
   * @param table The table to deal cards to
   * @param cards The specific cards to deal
   */
  public dealSpecificCommunityCards(table: Table, cards: Card[]): void {
    table.addCommunityCards(cards);
  }

  /**
   * Get the number of cards remaining in the deck
   */
  public getRemainingCardCount(): number {
    return this.deck.remainingCards;
  }

  /**
   * Get all burned cards (for testing/debugging)
   */
  public getBurnedCards(): Card[] {
    return [...this.burnCards];
  }

  /**
   * Deal a specific number of cards from the deck
   * @param count Number of cards to deal
   * @returns Array of dealt cards
   */
  public dealCards(count: number): Card[] {
    return this.deck.drawMultiple(count);
  }
}
