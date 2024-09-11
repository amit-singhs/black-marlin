"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const email_1 = __importDefault(require("./routes/email"));
const server = (0, fastify_1.default)({ logger: true, maxParamLength: 500 });
// Register the CORS plugin with options
server.register(cors_1.default, {
    origin: (origin, cb) => {
        const allowedOrigins = [
            "http://localhost:3000",
            process.env.FRONTEND_URL,
        ];
        if (allowedOrigins.includes(origin)) {
            cb(null, true); // Allow the request
        }
        else {
            cb(new Error("Not allowed by CORS"), false); // Reject the request
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
});
// Register routes
server.register(email_1.default);
// Start the server
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.listen({ port: 3000 });
        // Obtain the address and port from the server
        const address = server.server.address();
        if (address && typeof address === "object") {
            const { address: host, port } = address;
            const hostName = host === "::" ? "localhost" : host;
            const url = `http://${hostName}:${port}`;
            const rocketIcon = "🚀"; // Rocket icon
            server.log.info(`Server is running at ${url} ${rocketIcon}`);
            console.info(`Server is running at ${url} ${rocketIcon}`);
        }
        else {
            console.error("Server address is not available.");
        }
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
});
start();
