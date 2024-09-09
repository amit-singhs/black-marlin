"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = __importDefault(require("../supabaseClient"));
const apiKeyAuthMiddleware_1 = __importDefault(require("../middlewares/apiKeyAuthMiddleware"));
const jwtUtils_1 = require("../utils/jwtUtils"); // Import JWT utilities
const emailRoutes = async (fastify) => {
    fastify.addHook("preHandler", apiKeyAuthMiddleware_1.default);
    fastify.post("/email", async (request, reply) => {
        const { email } = request.body;
        if (!email) {
            return reply.status(400).send({ error: "Email is required" });
        }
        // Generate a JWT token
        const token = (0, jwtUtils_1.generateToken)({ email }, "1h"); // Token expires in 1 hour
        // Insert the email and generated token into the Supabase table
        const { data, error } = await supabaseClient_1.default
            .from("email_verification")
            .insert([{ email: email, token: token }])
            .select();
        if (error) {
            return reply.status(500).send({
                error: "Error inserting email into Supabase",
                details: error.message,
            });
        }
        return { status: "success", data };
    });
};
exports.default = emailRoutes;
