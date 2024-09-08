import fastify from 'fastify';
import exampleRoutes from './routes/example';

const server = fastify({ logger: true });

// Register routes
server.register(exampleRoutes);

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