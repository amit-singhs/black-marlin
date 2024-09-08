"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = __importDefault(require("../supabaseClient"));
const exampleRoutes = async (fastify) => {
    fastify.post('/example', async (request, reply) => {
        const { email } = request.body;
        // Check if email is provided
        if (!email) {
            return reply.status(400).send({ error: 'Email is required' });
        }
        // Insert the email and a hardcoded token into the Supabase table
        const { data, error } = await supabaseClient_1.default
            .from('email_verification') // Replace with your actual table name
            .insert([
            { email: email, token: 'abcdABCDXYZ1234567890' }, // Hardcoded token
        ])
            .select(); // This will return the inserted row
        // Handle any errors from Supabase
        if (error) {
            return reply.status(500).send({ error: 'Error inserting email into Supabase', details: error.message });
        }
        // Return the inserted data in the response
        return { status: 'success', data };
    });
};
exports.default = exampleRoutes;
