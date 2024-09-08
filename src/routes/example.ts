import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Define the expected body type
interface EmailRequestBody {
  email?: string; // Optional email field
}

const exampleRoutes = async (fastify: FastifyInstance) => {
  fastify.post(
    "/example",
    async (
      request: FastifyRequest<{ Body: EmailRequestBody }>,
      reply: FastifyReply
    ) => {
      const { email } = request.body;

      // Check if email is provided
      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // Return the email in the response
      return { status: "successfully received email :", email };
    }
  );
};

export default exampleRoutes;
