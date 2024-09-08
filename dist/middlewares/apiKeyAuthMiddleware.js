"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyMiddleware = void 0;
// Middleware to check for API key
const apiKeyMiddleware = (request, reply, done) => {
    const apiKey = request.headers["x-api-key"]; // Get the API key from the headers
    // Check if the API key is provided and valid
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return reply.status(403).send({ error: "Forbidden: Invalid API Key" });
    }
    done(); // Proceed to the next middleware or route handler
};
exports.apiKeyMiddleware = apiKeyMiddleware;
exports.default = exports.apiKeyMiddleware;
