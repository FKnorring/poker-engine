import { Dealer } from "../../engine/Dealer";
import { Player } from "../../models/Player";
import { Table } from "../../models/Table";
import { BettingStructure, GameVariant, PlayerStatus } from "../../types";

describe("Dealer", () => {
  let dealer: Dealer;
  let table: Table;
  let players: Player[];

  beforeEach(() => {
    // Create a fresh dealer instance for each test
    dealer = new Dealer();

    // Create a table
    table = new Table({
      id: "test-table",
      name: "Test Table",
      maxPlayers: 9,
      smallBlind: 1,
      bigBlind: 2,
      minBuyIn: 20,
      maxBuyIn: 200,
      gameVariant: GameVariant.TEXAS_HOLDEM,
      bettingStructure: BettingStructure.NO_LIMIT,
    });

    // Create some test players
    players = [
      new Player("p1", "Player 1", 100, 0),
      new Player("p2", "Player 2", 100, 1),
      new Player("p3", "Player 3", 100, 2),
    ];

    // Set players as active
    players.forEach((player) => {
      player.status = PlayerStatus.ACTIVE;
    });
  });

  test("should initialize with a shuffled deck", () => {
    // A deck should have 52 cards
    expect(dealer.getRemainingCardCount()).toBe(52);
  });

  test("should deal hole cards to active players", () => {
    // Deal 2 cards to each player
    const dealtCards = dealer.dealHoleCards(players);

    // Each player should have received 2 cards
    expect(players[0].hand.size).toBe(2);
    expect(players[1].hand.size).toBe(2);
    expect(players[2].hand.size).toBe(2);

    // The deck should have 52 - (3 players * 2 cards) = 46 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(46);

    // The returned map should contain the dealt cards
    expect(dealtCards.size).toBe(3);
    expect(dealtCards.get("p1")?.length).toBe(2);
    expect(dealtCards.get("p2")?.length).toBe(2);
    expect(dealtCards.get("p3")?.length).toBe(2);
  });

  test("should deal hole cards in round-robin fashion", () => {
    // Mark player 2 as inactive
    players[1].status = PlayerStatus.FOLDED;

    // Deal 2 cards to each active player
    dealer.dealHoleCards(players);

    // Active players should have cards
    expect(players[0].hand.size).toBe(2);
    expect(players[2].hand.size).toBe(2);

    // Inactive player should not have cards
    expect(players[1].hand.size).toBe(0);

    // The deck should have 52 - (2 active players * 2 cards) = 48 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(48);
  });

  test("should burn a card before dealing community cards", () => {
    const burnCard = dealer.burnCard();

    // The burn card should be defined
    expect(burnCard).toBeDefined();

    // The deck should have 51 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(51);

    // The burned cards array should contain the burned card
    expect(dealer.getBurnedCards().length).toBe(1);
    expect(dealer.getBurnedCards()[0]).toBe(burnCard);
  });

  test("should deal the flop (3 cards)", () => {
    // Deal the flop
    const flopCards = dealer.dealFlop(table);

    // The flop should consist of 3 cards
    expect(flopCards.length).toBe(3);

    // The community cards on the table should contain the flop
    expect(table.communityCards.length).toBe(3);

    // The deck should have 52 - (1 burn + 3 flop) = 48 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(48);

    // There should be 1 burned card
    expect(dealer.getBurnedCards().length).toBe(1);
  });

  test("should deal the turn (4th card)", () => {
    // First deal the flop
    dealer.dealFlop(table);

    // Then deal the turn
    const turnCard = dealer.dealTurn(table);

    // The turn card should be defined
    expect(turnCard).toBeDefined();

    // The community cards on the table should now have 4 cards
    expect(table.communityCards.length).toBe(4);

    // The deck should have 52 - (2 burns + 3 flop + 1 turn) = 46 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(46);

    // There should be 2 burned cards
    expect(dealer.getBurnedCards().length).toBe(2);
  });

  test("should deal the river (5th card)", () => {
    // First deal the flop and turn
    dealer.dealFlop(table);
    dealer.dealTurn(table);

    // Then deal the river
    const riverCard = dealer.dealRiver(table);

    // The river card should be defined
    expect(riverCard).toBeDefined();

    // The community cards on the table should now have 5 cards
    expect(table.communityCards.length).toBe(5);

    // The deck should have 52 - (3 burns + 3 flop + 1 turn + 1 river) = 44 cards remaining
    expect(dealer.getRemainingCardCount()).toBe(44);

    // There should be 3 burned cards
    expect(dealer.getBurnedCards().length).toBe(3);
  });

  test("should reset the deck and burned cards", () => {
    // Deal some cards first
    dealer.dealHoleCards(players);
    dealer.dealFlop(table);

    // Verify some cards were dealt and burned
    expect(dealer.getRemainingCardCount()).toBeLessThan(52);
    expect(dealer.getBurnedCards().length).toBeGreaterThan(0);

    // Reset the dealer
    dealer.reset();

    // The deck should be reset to 52 cards
    expect(dealer.getRemainingCardCount()).toBe(52);

    // The burned cards should be cleared
    expect(dealer.getBurnedCards().length).toBe(0);
  });
});
