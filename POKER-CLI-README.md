# Command-Line Poker Client/Server

This project provides a simple command-line interface to test the poker engine.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

## Usage

### Starting the Server

```
npm run server [port]
```

Where:
- `port` is optional and defaults to 3000

Example:
```
npm run server 3001
```

### Starting a Client

```
npm run client [host] [port]
```

Where:
- `host` is optional and defaults to "localhost"
- `port` is optional and defaults to 3000

Example:
```
npm run client localhost 3001
```

You can run multiple clients to simulate multiple players.

## Client Commands

### General Commands

- `start` - Start the game (requires at least 2 players)
- `help` - Show available commands
- `quit` - Disconnect from the server

### Action Commands

These are available when it's your turn:

- `fold` - Fold your hand
- `check` - Check (if allowed)
- `call` - Call the current bet
- `bet <amount>` - Make a bet/raise
- `allin` - Go all in

## Gameplay Guide

1. Start the server: `npm run server`
2. Start 2+ clients in separate terminals: `npm run client`
3. In each client, enter a username when prompted
4. In any client, type `start` to begin the game when all players have joined
5. Players will be prompted for actions when it's their turn
6. After a hand completes, type `start` again to play another hand

## Example Session

Server:
```
npm run server
> Poker server started on port 3000
```

Client 1:
```
npm run client
> Connected to server at localhost:3000
> Enter your username: Alice
> Login successful! You are in seat 0 with 1000 chips.
> start
> Game started!
```

Client 2:
```
npm run client
> Connected to server at localhost:3000
> Enter your username: Bob
> Login successful! You are in seat 1 with 1000 chips.
> [When it's your turn] call
```