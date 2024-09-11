import fastify from "fastify";
import cors from "@fastify/cors";
import emailRoutes from "./routes/email";

const server = fastify({ logger: true, maxParamLength: 500 });

// Register the CORS plugin with options
server.register(cors, {
  origin: (
    origin: string | undefined,
    cb: (err: Error | null, allow: boolean) => void
  ) => {
    const allowedOrigins = [
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ];

    if (allowedOrigins.includes(origin)) {
      cb(null, true); // Allow the request
    } else {
      cb(new Error("Not allowed by CORS"), false); // Reject the request
    }
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
});

// Register routes
server.register(emailRoutes);

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 3000 });

    // Obtain the address and port from the server
    const address = server.server.address();
    if (address && typeof address === "object") {
      const { address: host, port } = address;
      const hostName = host === "::" ? "localhost" : host;
      const url = `http://${hostName}:${port}`;
      const rocketIcon = "🚀"; // Rocket icon
      server.log.info(`Server is running at ${url} ${rocketIcon}`);
      console.info(`Server is running at ${url} ${rocketIcon}`);
    } else {
      console.error("Server address is not available.");
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
