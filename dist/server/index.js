"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PokerServer_1 = require("./PokerServer");
// Create and start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const server = new PokerServer_1.PokerServer(port);
server.start();
// Handle shutdown gracefully
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.stop();
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("Shutting down server...");
    server.stop();
    process.exit(0);
});
//# sourceMappingURL=index.js.map