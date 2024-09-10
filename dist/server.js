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
        // Bind to a specific port
        await server.listen({ port: 3000 });
        // Obtain the address and port from the server
        const address = server.server.address();
        if (address && typeof address === 'object') {
            const { address: host, port } = address;
            // Handle both IPv4 and IPv6 cases
            const hostName = host === '::' ? 'localhost' : host;
            const url = `http://${hostName}:${port}`;
            const rocketIcon = '🚀'; // Rocket icon
            server.log.info(`Server is running at ${url} ${rocketIcon}`);
            console.log(`Server is running at ${url} ${rocketIcon}`);
        }
        else {
            // Handle cases where address might not be an object
            console.log('Server address is not available.');
        }
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
