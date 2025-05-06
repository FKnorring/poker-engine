"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PokerClient_1 = require("./PokerClient");
// Get host and port from command line arguments or use defaults
const host = process.argv[2] || "localhost";
const port = process.argv[3] ? parseInt(process.argv[3]) : 3000;
// Create and connect client
const client = new PokerClient_1.PokerClient(host, port);
client.connect();
// Handle shutdown gracefully
process.on("SIGINT", () => {
    console.log("\nDisconnecting from server...");
    client.disconnect();
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("\nDisconnecting from server...");
    client.disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map