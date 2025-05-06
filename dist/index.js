"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameEngine_1 = require("./engine/GameEngine");
const models_1 = require("./models");
const types_1 = require("./types");
const engine = new GameEngine_1.GameEngine();
const players = [
    new models_1.Player("id1", "Player 1", 5000, 0),
    new models_1.Player("id2", "Player 2", 5000, 1),
    new models_1.Player("id3", "Player 3", 5000, 2),
];
let gameStarted = false;
players.map((player) => engine.addPlayer(player));
engine.on(types_1.GameEngineEventType.GAME_ERROR, ({ error }) => {
    console.error("Game error: ", error);
});
engine.on(types_1.GameEngineEventType.PLAYER_TURN, ({ playerId }) => {
    console.log("Player turn: ", playerId);
});
engine.on(types_1.GameEngineEventType.PLAYER_ACTION, ({ action, player }) => {
    console.log("Player action: ", player, action);
});
engine.on(types_1.GameEngineEventType.STATE_CHANGED, ({ oldState, newState }) => {
    console.log("State changed: ", oldState, newState);
    console.log("Current bet: ", engine.getTable().currentBet);
    console.log("Total pot: ", engine.getPotManager().totalPotAmount);
    const currentPlayer = engine.getTable().players[engine.getCurrentPlayerIndex()];
    console.log("Current player: ", currentPlayer?.id);
    console.log("Current player stack: ", currentPlayer?.stack);
    console.log("Current player bet: ", currentPlayer?.currentBet);
    console.log("Current player hand: ", currentPlayer?.hand);
    console.log("Current player hole cards: ", currentPlayer?.holeCards);
    console.log("Current player position: ", currentPlayer?.position);
    console.log("Current player status: ", currentPlayer?.status);
});
engine.on(types_1.GameEngineEventType.ROUND_COMPLETE, () => {
    console.log("Round complete");
});
engine.on(types_1.GameEngineEventType.HAND_COMPLETE, () => {
    console.log("Hand complete");
});
engine.on(types_1.GameEngineEventType.GAME_STARTED, () => {
    console.log("Game started");
    gameStarted = true;
});
engine.startGame();
while (gameStarted) {
    console.log("Game started");
    engine.handleAction(players[0].id, new models_1.Action(players[0], types_1.ActionType.CALL));
    engine.handleAction(players[1].id, new models_1.Action(players[1], types_1.ActionType.CALL));
    engine.handleAction(players[2].id, new models_1.Action(players[2], types_1.ActionType.CALL));
    break;
}
//# sourceMappingURL=index.js.map