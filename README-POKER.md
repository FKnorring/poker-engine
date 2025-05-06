# Poker Game Client/Server

This implementation lets you run a simple poker game with multiple clients connecting to a central server.

## Setup

First, make sure you have all dependencies installed:

```bash
npm install
```

Then build the project:

```bash
npm run build
```

## Running the Server

Start the poker server:

```bash
npm run server
```

This will start the server on port 3000 by default. You can specify a different port:

```bash
npm run server 8080
```

## Running Clients

You can start multiple client instances to play against yourself. Open separate terminal windows for each player.

Start a client:

```bash
npm run client [playerName] [serverUrl]
```

Examples:
```bash
# Default player name, connect to localhost:3000
npm run client

# Specific player name, connect to localhost:3000
npm run client Alice

# Specific player name and server
npm run client Bob ws://localhost:8080
```

## Client Commands

Once a client is running, you can use these commands:

- `help` - Show available commands
- `rooms` - List available game rooms
- `join <roomId> [buyIn]` - Join a room with optional buy-in amount
- `start` - Start the game (if enough players have joined)
- `fold` - Fold your hand
- `check` - Check
- `call` - Call the current bet
- `bet <amount>` - Place a bet
- `raise <amount>` - Raise to amount
- `quit` - Disconnect and quit

## Playing the Game

A typical gameplay sequence:

1. Start the server: `npm run server`
2. Start 2+ clients in separate terminals: `npm run client Alice` and `npm run client Bob`
3. In each client, see available rooms: `rooms`
4. Join a room in each client: `join <roomId>` (use the room ID displayed from the rooms command)
5. From one client, start the game: `start`
6. Play the game by responding to prompts for actions

## Limitations

This is a simple implementation that demonstrates the basic functionality of the poker engine:

- The game state display is text-based in the console
- Error handling is minimal
- The server doesn't persist game state between sessions
- Some game rules may not be fully implemented

## Troubleshooting

- If you see connection errors, make sure the server is running
- If clients can't join a room, make sure the room ID is correct
- If the game won't start, make sure at least 2 players have joined 