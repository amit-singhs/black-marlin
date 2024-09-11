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
const supabaseClient_1 = __importDefault(require("../supabaseClient"));
const apiKeyAuthMiddleware_1 = __importDefault(require("../middlewares/apiKeyAuthMiddleware"));
const jwtUtils_1 = require("../utils/jwtUtils");
const jsonwebtoken_1 = require("jsonwebtoken");
const emailUtils_1 = require("../utils/emailUtils");
const emailRoutes = (fastify) => __awaiter(void 0, void 0, void 0, function* () {
    fastify.addHook("preHandler", apiKeyAuthMiddleware_1.default);
    fastify.post("/email", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = request.body;
        if (!email) {
            return reply.status(400).send({ error: "Email is required" });
        }
        // Check if the email exists in the database
        const { data: existingData, error: fetchError } = yield supabaseClient_1.default
            .from("email_verification")
            .select("*")
            .eq("email", email)
            .single();
        if (fetchError && fetchError.code !== "PGRST116") {
            // 'PGRST116' means no rows found
            return reply.status(500).send({
                error: "Error fetching email data",
                details: fetchError.message,
            });
        }
        if (fetchError && fetchError.code === "PGRST116") {
            return reply
                .status(404)
                .send({ error: "Email not registrered in the app." });
        }
        if (existingData) {
            // Check if email is verified
            if (!existingData.verified) {
                return reply.status(403).send({
                    error: "The email is not verified, please verify by clicking on the verification link sent to your email.",
                });
            }
            // Check if the token is expired
            try {
                // Await the promise returned by verifyToken
                const decodedToken = yield (0, jwtUtils_1.verifyToken)(existingData.token);
                // Check if token has an expiration time
                if (decodedToken.exp === undefined) {
                    return reply
                        .status(401)
                        .send({ error: "Token does not have an expiration time" });
                }
                // Check if the token has expired
                if (decodedToken.exp * 1000 < Date.now()) {
                    return reply.status(401).send({
                        error: "Email was sent already, but the JWT token has expired",
                    });
                }
                // If everything is okay, send success response
                return reply.send({ status: "success", data: existingData });
            }
            catch (error) {
                // Handle different types of JWT errors
                if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                    return reply.status(401).send({ error: "Token has expired" });
                }
                else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                    return reply.status(401).send({ error: "Invalid token" });
                }
                else {
                    console.error("Unexpected error: ", error);
                    return reply.status(500).send({ error: "Internal Server Error" });
                }
            }
        }
    }));
    fastify.post("/send-verification", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = request.body;
        if (!email) {
            return reply.status(400).send({ error: "Email is required" });
        }
        // Generate a token
        const token = (0, jwtUtils_1.generateToken)({ email }, "1h");
        // Insert the email and token in Supabase
        const { error: supabaseError } = yield supabaseClient_1.default
            .from("email_verification")
            .insert([{ email, token }])
            .select();
        if (supabaseError) {
            return reply.status(500).send({
                error: "Error updating or inserting email into Supabase",
                details: supabaseError.message,
            });
        }
        // Create the verification link
        const verificationLink = `http://localhost:3000/verify-email/${email}/${token}`;
        const subject = "Email Verification";
        const text = `Please verify your email by clicking on the following link: ${verificationLink}`;
        try {
            // Send the verification email
            yield (0, emailUtils_1.sendEmail)(email, subject, text);
            return reply.send({
                status: "success",
                message: "Verification email sent",
            });
        }
        catch (mailError) {
            return reply.status(500).send({
                error: "Error sending verification email",
                details: mailError,
            });
        }
    }));
    fastify.get("/verify-email/:email/:token", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, token } = request.params;
        // Check if email exists
        const { data: existingData, error: fetchError } = yield supabaseClient_1.default
            .from("email_verification")
            .select("*")
            .eq("email", email)
            .single();
        if (fetchError || !existingData) {
            return reply.status(404).send({ error: "Email not found" });
        }
        // Check if token matches
        if (existingData.token !== token) {
            return reply.status(400).send({ error: "Faulty token" });
        }
        // Check token expiration
        try {
            const decodedToken = (0, jwtUtils_1.verifyToken)(token);
            if (decodedToken.exp === undefined) {
                return reply
                    .status(400)
                    .send({ error: "Token does not have an expiration time" });
            }
            if (decodedToken.exp * 1000 < Date.now()) {
                return reply.status(400).send({
                    error: "Token is expired, please resend verification link",
                });
            }
            // Token is still valid, update 'verified' flag
            const { error: updateError } = yield supabaseClient_1.default
                .from("email_verification")
                .update({ verified: true })
                .eq("email", email)
                .select();
            if (updateError) {
                return reply
                    .status(500)
                    .send({ error: "Failed to update verification status" });
            }
            return reply.send({ status: "success", data: existingData });
        }
        catch (error) {
            return reply.status(401).send({ error: "Invalid token" });
        }
    }));
    fastify.post("/update-token", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = request.body;
        if (!email) {
            return reply.status(400).send({ error: "Email is required" });
        }
        // Fetch the row from the database for the given email
        const { data: existingData, error: fetchError } = yield supabaseClient_1.default
            .from("email_verification")
            .select("*")
            .eq("email", email)
            .single(); // Fetch a single row
        if (!existingData ||
            (fetchError === null || fetchError === void 0 ? void 0 : fetchError.details) ===
                "JSON object requested, multiple (or no) rows returned") {
            // This error indicates , the email doesn't exist in the database
            return reply
                .status(404)
                .send({ error: "Email not registered in the app" });
        }
        if (fetchError) {
            return reply.status(500).send({
                error: "Error fetching email data",
                details: fetchError.message,
            });
        }
        // Check if the email is verified
        if (!existingData.verified) {
            return reply.status(403).send({
                error: "The email is registered on the app, but is not verified yet",
            });
        }
        // Generate a new token
        const token = (0, jwtUtils_1.generateToken)({ email }, "1h");
        // Update the token in the database
        const { error: updateError } = yield supabaseClient_1.default
            .from("email_verification")
            .update({ token })
            .eq("email", email);
        if (updateError) {
            return reply.status(500).send({
                error: "Error updating token",
                details: updateError.message,
            });
        }
        return reply.send({ status: "success", data: { email, token } });
    }));
});
exports.default = emailRoutes;
