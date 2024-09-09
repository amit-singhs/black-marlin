"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const email_1 = __importDefault(require("./routes/email"));
const server = (0, fastify_1.default)({ logger: true, maxParamLength: 500 });
// Register routes
server.register(email_1.default);
// Start the server
const start = async () => {
    try {
        await server.listen({ port: 3000 });
        console.log(`Server is running at http://localhost:3000`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
