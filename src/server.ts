import fastify from 'fastify';
import emailRoutes from './routes/email';

const server = fastify({ logger: true, maxParamLength: 500 });

// Register routes
server.register(emailRoutes);

// Start the server
const start = async () => {
  try {
    // Bind to a specific port
    await server.listen({ port: 3000 });

    // Obtain the address and port from the server
    const address = server.server.address();
    if (address && typeof address === 'object') {
      const { address: host, port } = address;
      // Handle both IPv4 and IPv6 cases
      const hostName = host === '::' ? 'localhost' : host;
      const url = `http://${hostName}:${port}`;
      const rocketIcon = '🚀'; // Rocket icon
      server.log.info(`Server is running at ${url} ${rocketIcon}`);
      console.log(`Server is running at ${url} ${rocketIcon}`);
    } else {
      // Handle cases where address might not be an object
      console.log('Server address is not available.');
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
