import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import supabase from '../supabaseClient';

// Define the expected body type
interface EmailRequestBody {
  email?: string; // Optional email field
}

const exampleRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/example', async (request: FastifyRequest<{ Body: EmailRequestBody }>, reply: FastifyReply) => {
    const { email } = request.body;

    // Check if email is provided
    if (!email) {
      return reply.status(400).send({ error: 'Email is required' });
    }

    // Insert the email and a hardcoded token into the Supabase table
    const { data, error } = await supabase
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

export default exampleRoutes;