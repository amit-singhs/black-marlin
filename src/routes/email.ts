import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import supabase from "../supabaseClient";
import apiKeyMiddleware from "../middlewares/apiKeyAuthMiddleware";

import { generateToken } from "../utils/jwtUtils"; // Import JWT utilities

interface EmailRequestBody {
  email?: string;
}

const emailRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", apiKeyMiddleware);

  fastify.post(
    "/email",
    async (
      request: FastifyRequest<{ Body: EmailRequestBody }>,
      reply: FastifyReply
    ) => {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // Generate a JWT token
      const token = generateToken({ email }, "1h"); // Token expires in 1 hour

      // Insert the email and generated token into the Supabase table
      const { data, error } = await supabase
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
    }
  );
};

export default emailRoutes;
