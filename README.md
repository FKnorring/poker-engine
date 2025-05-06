# Poker Engine

A modular TypeScript poker game engine that can be used for various poker variants. The engine handles game state, player actions, hand evaluation, and pot management.

## Project Structure

```
poker-engine/
├── src/
│   ├── models/            # Data structures
│   ├── engine/            # Core game logic
│   ├── rules/             # Game variant rules
│   ├── evaluator/         # Hand evaluation
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript types/interfaces
│   ├── server/            # Server-side components
│   └── events/            # Event system
├── tests/                 # Test files
├── package.json
└── tsconfig.json
```

## Current Implementation Status

- [x] Core data models (Card, Deck, Hand, Player, Action, Pot, Table)
- [x] Type definitions (Suits, Ranks, Actions, Game States)
- [x] Hand evaluator (Texas Hold'em, Omaha, Hi-Lo)
- [x] Game variant configurations
- [ ] Game engine and state machine
- [ ] Server-side networking
- [ ] Client-server architecture

## Features

### Models

The project includes the following core models:

- **Card**: Representation of a playing card with suit and rank
- **Deck**: Standard deck of 52 cards with shuffling and dealing
- **Hand**: Collection of cards with evaluation placeholders
- **Player**: Player representation with stack, cards, and betting
- **Action**: Player actions (fold, check, call, bet, raise)
- **Pot**: Pot management with support for side pots
- **Table**: Game table with players, community cards, and game state

### Hand Evaluator

The hand evaluator supports different poker variants:

- **Texas Hold'em**: Best 5 cards from 7 (2 hole cards + 5 community)
- **Omaha**: Must use exactly 2 hole cards and 3 community cards
- **Hi-Lo Variants**: Support for evaluating both high and low hands
- **Configurable**: Ace can be high or low, customizable low hand qualifier

### Game Variants

Predefined game configurations include:

- No-Limit Texas Hold'em
- Pot-Limit Omaha
- Pot-Limit Omaha Hi-Lo (8 or better)
- Fixed-Limit 7-Card Stud
- Fixed-Limit 7-Card Stud Hi-Lo (8 or better)

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/poker-engine.git
cd poker-engine

# Install dependencies
npm install

# Build the project
npm run build

# Run the project
npm start

# Run the hand evaluation example
npm run example
```

## Example Usage

```typescript
import { Card, Hand } from './models';
import { TexasHoldemEvaluator } from './evaluator';
import { Rank, Suit } from './types';

// Create some cards
const aceSpades = new Card(Suit.SPADES, Rank.ACE);
const kingSpades = new Card(Suit.SPADES, Rank.KING);
const queenSpades = new Card(Suit.SPADES, Rank.QUEEN);
const jackSpades = new Card(Suit.SPADES, Rank.JACK);
const tenSpades = new Card(Suit.SPADES, Rank.TEN);
const twoHearts = new Card(Suit.HEARTS, Rank.TWO);
const threeHearts = new Card(Suit.HEARTS, Rank.THREE);

// Create a player's hand
const playerHand = new Hand([aceSpades, kingSpades]);

// Community cards
const communityCards = [queenSpades, jackSpades, tenSpades, twoHearts, threeHearts];

// Evaluate the hand
const evaluator = new TexasHoldemEvaluator();
const result = evaluator.evaluate(playerHand, communityCards);

console.log(`Hand rank: ${result.rank}`);
console.log(`Description: ${result.description}`);
```

## Next Steps

1. Implement game engine and state machine
2. Add more game rule variations
3. Build server-side networking for multiplayer
4. Create React UI components

## License

This project is licensed under the MIT License - see the LICENSE file for details. 