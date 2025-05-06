import { GameEngine } from "./engine/GameEngine";
import { Action, Player } from "./models";
import { ActionType, GameEngineEventType, GameState } from "./types";

const engine = new GameEngine();

const players = [
  new Player("id1", "Player 1", 5000, 0),
  new Player("id2", "Player 2", 5000, 1),
  new Player("id3", "Player 3", 5000, 2),
];

let gameStarted = false;

players.map((player) => engine.addPlayer(player));

engine.on(GameEngineEventType.GAME_ERROR, ({ error }) => {
  console.error("Game error: ", error);
});

engine.on(GameEngineEventType.PLAYER_TURN, ({ playerId }) => {
  console.log("Player turn: ", playerId);
});

engine.on(GameEngineEventType.PLAYER_ACTION, ({ action, player }) => {
  console.log("Player action: ", player, action);
});

engine.on(
  GameEngineEventType.STATE_CHANGED,
  ({ oldState, newState, cards }) => {}
);

engine.on(GameEngineEventType.ROUND_COMPLETE, ({ round }) => {
  console.log("Round complete");
});

engine.on(GameEngineEventType.HAND_COMPLETE, () => {
  console.log("Hand complete");
});

engine.on(GameEngineEventType.GAME_STARTED, () => {
  console.log("Game started");
  gameStarted = true;
});

engine.startGame();

while (gameStarted) {
  console.log("Game started");
  engine.handleAction(players[0].id, new Action(players[0], ActionType.CALL));
  engine.handleAction(players[1].id, new Action(players[1], ActionType.CALL));
  engine.handleAction(players[2].id, new Action(players[2], ActionType.CALL));
  break;
}
