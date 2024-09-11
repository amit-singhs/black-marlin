import fastify from "fastify";
import cors from "@fastify/cors";
import emailRoutes from "./routes/email"; // Adjust the path as necessary

const server = fastify({ logger: true, maxParamLength: 500 });

// CORS setup
server.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ];

    if (allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

// Register routes
server.register(emailRoutes);

// Export the Fastify server as a Vercel function
export default async (req: { method: any; url: any; headers: any; body: any; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
  await server.ready();
  server.inject({
    method: req.method,
    url: req.url,
    headers: req.headers,
    payload: req.body,
  }, (err, response) => {
    if (response) {
      res.status(response.statusCode).send(response.payload);
    }
  });
};