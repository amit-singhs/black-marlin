"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exampleRoutes = async (fastify) => {
    fastify.post("/example", async (request, reply) => {
        const { email } = request.body;
        // Check if email is provided
        if (!email) {
            return reply.status(400).send({ error: "Email is required" });
        }
        // Return the email in the response
        return { status: "successfully received email :", email };
    });
};
exports.default = exampleRoutes;
