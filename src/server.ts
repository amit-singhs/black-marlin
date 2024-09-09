import fastify from 'fastify';
import emailRoutes from './routes/email';

const server = fastify({ logger: true ,maxParamLength: 500});

// Register routes
server.register(emailRoutes);

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3000 });
    console.log(`Server is running at http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();