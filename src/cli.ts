import { GameEngine } from "./engine/GameEngine";
import { Action, Player } from "./models";
import {
  ActionType,
  GameEngineEventType,
  GameState,
  PlayerStatus,
} from "./types";
import chalk from "chalk";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const engine = new GameEngine();

const players = [
  new Player("id1", "Player 1", 5000, 0),
  new Player("id2", "Player 2", 5000, 1),
  new Player("id3", "Player 3", 5000, 2),
];

players.forEach((player) => {
  engine.addPlayer(player);
});

function printTable() {
  console.clear();
  console.log(chalk.bold("\n=== Poker Table ==="));
  console.log(
    chalk.bold("Pot:"),
    chalk.yellow(engine.getTable().totalPot || 0)
  );
  if (engine.getTable().communityCards.length > 0) {
    console.log(
      chalk.bold("Community Cards:"),
      engine
        .getTable()
        .communityCards.map((c) => `${c.rank}${c.suit[0]}`)
        .join(" ")
    );
  }
  console.log("");
  players.forEach((player) => {
    let name = player.name;
    let bet = player.currentBet || 0;
    let status = player.status;
    let isCurrent =
      player.id ===
      engine.getTable().players[engine.getCurrentPlayerIndex()]?.id;
    let line =
      (isCurrent ? chalk.bgGreen.black(name) : name) +
      ` | Stack: ${player.stack}` +
      ` | Bet: ${bet}` +
      ` | Status: ${status}`;

    // Show user cards
    const cards = player.holeCards || [];
    line +=
      " | Cards: " +
      (cards.length > 0
        ? cards.map((c) => chalk.cyan(`${c.rank}${c.suit[0]}`)).join(" ")
        : "?");

    console.log(line);
  });
  console.log("");
}

function printEngineState() {
  console.log(chalk.bold("\n=== Engine State Debug ==="));
  // Print current game state
  console.log("Game State:", chalk.yellow(engine.getGameState()));

  // Print table snapshot
  const table = engine.getTable();
  const snapshot = table.getSnapshot();
  console.log("Table ID:", snapshot.id);
  console.log("Table Name:", snapshot.name);
  console.log("Current State:", snapshot.currentState);
  console.log("Button Position:", snapshot.buttonPosition);
  console.log("Active Player Index:", snapshot.activePlayerIndex);
  console.log("Small Blind:", snapshot.smallBlind);
  console.log("Big Blind:", snapshot.bigBlind);
  console.log("Current Bet:", snapshot.currentBet);
  console.log("Min Raise:", snapshot.minRaise);
  console.log("Pot Amount:", snapshot.potAmount);
  console.log(
    "Community Cards:",
    snapshot.communityCards.map((c) => `${c.rank}${c.suit[0]}`).join(" ") || "-"
  );
}

function askUserAction(
  validActions: ActionType[],
  cb: (action: ActionType, amount?: number) => void
) {
  const actionStr = validActions.map((a, i) => `${i + 1}. ${a}`).join("  ");
  rl.question(chalk.bold(`Your move (${actionStr}): `), (answer) => {
    const idx = parseInt(answer.trim()) - 1;
    if (idx >= 0 && idx < validActions.length) {
      const action = validActions[idx];
      if (action === ActionType.BET || action === ActionType.RAISE) {
        rl.question("Enter amount: ", (amt) => {
          const amount = parseInt(amt.trim());
          cb(action, amount);
        });
      } else {
        cb(action);
      }
    } else {
      console.log(chalk.red("Invalid choice."));
      askUserAction(validActions, cb);
    }
  });
}

engine.on(GameEngineEventType.GAME_ERROR, ({ error }) => {
  console.log(chalk.red("Game error: "), error);
});

engine.on(GameEngineEventType.PLAYER_TURN, ({ playerId }) => {
  console.log(chalk.bold("Player turn: "), playerId);
  printTable();
  printEngineState();
  const player = players.find((p) => p.id === playerId);
  if (!player) return;
  if (
    playerId === engine.getTable().players[engine.getCurrentPlayerIndex()]?.id
  ) {
    // User's turn
    // For demo, allow all actions
    const validActions = [
      ActionType.FOLD,
      ActionType.CHECK,
      ActionType.CALL,
      ActionType.BET,
      ActionType.RAISE,
      ActionType.ALL_IN,
    ];
    askUserAction(validActions, (action, amount) => {
      engine.handleAction(playerId, new Action(player, action, amount));
    });
  } else {
    console.log(chalk.gray("Waiting for player to act..."));
  }
});

engine.on(GameEngineEventType.PLAYER_ACTION, ({ action, player }) => {
  printTable();
  printEngineState();
});

engine.on(
  GameEngineEventType.STATE_CHANGED,
  ({ oldState, newState, cards }) => {
    printTable();
    printEngineState();
  }
);

engine.on(GameEngineEventType.ROUND_COMPLETE, ({ round }) => {
  printTable();
  printEngineState();
  console.log(chalk.magenta(`\nRound complete: ${round}`));
});

engine.on(GameEngineEventType.HAND_COMPLETE, ({ winners }) => {
  printTable();
  printEngineState();
  if (winners && winners.length > 0) {
    winners.forEach((w) => {
      console.log(
        chalk.green(
          `Winner: ${w.player.name} (+${w.potAmount}) with ${w.handRank}`
        )
      );
    });
  } else {
    console.log(chalk.yellow("No winner this hand."));
  }
  rl.question("Play another hand? (y/n): ", (ans) => {
    if (ans.trim().toLowerCase() === "y") {
      engine.startGame();
    } else {
      rl.close();
      process.exit(0);
    }
  });
});

engine.on(GameEngineEventType.GAME_STARTED, ({ players: gamePlayers }) => {
  printTable();
  printEngineState();
});

engine.startGame();
