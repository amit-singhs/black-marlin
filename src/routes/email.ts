import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import supabase from "../supabaseClient";
import apiKeyMiddleware from "../middlewares/apiKeyAuthMiddleware";

// Define the expected body type
interface EmailRequestBody {
  email?: string; 
}

const emailRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", apiKeyMiddleware); // Register the middleware

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

      // Insert the email and a hardcoded token into the Supabase table
      const { data, error } = await supabase
        .from("email_verification") 
        .insert([
          { email: email, token: "abcdABCDXYZ1234567890" }, // Hardcoded token
        ])
        .select(); 

      // Handle any errors from Supabase
      if (error) {
        return reply
          .status(500)
          .send({
            error: "Error inserting email into Supabase",
            details: error.message,
          });
      }

      // Return the inserted data in the response
      return { status: "success", data };
    }
  );
};

export default emailRoutes;
