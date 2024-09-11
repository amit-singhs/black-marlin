import fastify from 'fastify';
import cors from '@fastify/cors';
import emailRoutes from './routes/email';

const server = fastify({ logger: true, maxParamLength: 500 });

// Register the CORS plugin with options
server.register(cors, {
  origin: (
    origin: string | undefined,
    cb: (err: Error | null, allow: boolean) => void
  ) => {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ];

    if (allowedOrigins.includes(origin)) {
      cb(null, true); // Allow the request
    } else {
      cb(new Error('Not allowed by CORS'), false); // Reject the request
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
});

// Register routes
server.register(emailRoutes);

// Export a handler function
export default async function handler(req: any, res: any) {
  await server.ready();
  server.server.emit('request', req, res);
}
