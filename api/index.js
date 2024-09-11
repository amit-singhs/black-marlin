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
const email_1 = __importDefault(require("./routes/email")); // Adjust the path as necessary
const server = (0, fastify_1.default)({ logger: true, maxParamLength: 500 });
// CORS setup
server.register(cors_1.default, {
    origin: (origin, cb) => {
        const allowedOrigins = [
            "http://localhost:3000",
            process.env.FRONTEND_URL,
        ];
        if (allowedOrigins.includes(origin)) {
            cb(null, true);
        }
        else {
            cb(new Error("Not allowed by CORS"), false);
        }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
});
// Register routes
server.register(email_1.default);
// Export the Fastify server as a Vercel function
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield server.ready();
    server.inject({
        method: req.method,
        url: req.url,
        headers: req.headers,
        payload: req.body,
    }, (err, response) => {
        if (response) {
            res.status(response.statusCode).send(response.payload);
        }
    });
});
