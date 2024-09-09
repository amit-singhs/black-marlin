import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import supabase from "../supabaseClient";
import apiKeyMiddleware from "../middlewares/apiKeyAuthMiddleware";
import { generateToken, verifyToken } from "../utils/jwtUtils";
import { JwtPayload } from "jsonwebtoken";
import { sendEmail } from "../utils/emailUtils";

interface EmailRequestBody {
  email?: string;
}

interface SendVerificationRequestBody {
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

      // Check if the email exists in the database
      const { data: existingData, error: fetchError } = await supabase
        .from("email_verification")
        .select("*")
        .eq("email", email)
        .single();

      console.log(
        "Data related to query triggered for checking if email exists ***************** : ",
        existingData
      );
      console.log(
        "ERROR OBJECT related to query triggered for checking if email exists XXXXXXXXXXXXXXXXXXXXXX : ",
        fetchError
      );

      if (fetchError && fetchError.code !== "PGRST116") {
        // 'PGRST116' means no rows found
        return reply
          .status(500)
          .send({
            error: "Error fetching email data",
            details: fetchError.message,
          });
      }

      if (fetchError && fetchError.code === "PGRST116") {
        return reply
          .status(404)
          .send({ error: "Email not registrered in the app." });
      }

      if (existingData) {
        // Check if email is verified
        if (!existingData.verified) {
          return reply.status(403).send({
            error:
              "The email is not verified, please verify by clicking on the verification link sent to your email.",
          });
        }

        // Check if the token is expired
        try {
          const decodedToken = verifyToken(existingData.token) as JwtPayload;

          if (decodedToken.exp === undefined) {
            return reply
              .status(401)
              .send({ error: "Token does not have an expiration time" });
          }

          if (
            decodedToken.exp !== undefined &&
            decodedToken.exp * 1000 < Date.now()
          ) {
            return reply
              .status(401)
              .send({
                error: "Email was sent alreay, but the JWT token has expired",
              });
          }
          return reply.send({ status: "success", data: existingData });
        } catch (error) {
          return reply.status(401).send({ error: "Invalid token" });
        }
      }

      // Generate a new token and insert it <----Why do we insert a new token from this route ?
      /*const token = generateToken({ email }, "1h");
      const { data, error } = await supabase
        .from("email_verification")
        .insert([{ email, token }])
        .select();

      if (error) {
        return reply.status(500).send({
          error: "Error inserting email into Supabase",
          details: error.message,
        });
      }

      return { status: "success", data };*/
    }
  );

  fastify.post(
    "/send-verification",
    async (
      request: FastifyRequest<{ Body: SendVerificationRequestBody }>,
      reply: FastifyReply
    ) => {
      const { email } = request.body;

      if (!email) {
        return reply.status(400).send({ error: "Email is required" });
      }

      // Generate a token
      const token = generateToken({ email }, "1h");

      // Insert the email and token in Supabase
      const { error: supabaseError } = await supabase
        .from("email_verification")
        .insert([{ email, token }])
        .select();

      if (supabaseError) {
        return reply.status(500).send({
          error: "Error updating or inserting email into Supabase",
          details: supabaseError.message,
        });
      }

      // Create the verification link
      const verificationLink = `http://localhost:3000/verify-email/${email}/${token}`;
      const subject = "Email Verification";
      const text = `Please verify your email by clicking on the following link: ${verificationLink}`;

      try {
        // Send the verification email
        await sendEmail(email, subject, text);
        return reply.send({
          status: "success",
          message: "Verification email sent",
        });
      } catch (mailError) {
        return reply.status(500).send({
          error: "Error sending verification email",
          details: mailError,
        });
      }
    }
  );
  
  fastify.get(
    "/verify-email/:email/:token",
    async (
      request: FastifyRequest<{ Params: { email: string; token: string } }>,
      reply: FastifyReply
    ) => {
      const { email, token } = request.params;

      console.log("From the verify-email route, email and token are 5%%%%%%%%%%%%% : ", email, token);

      // Check if email exists
      const { data: existingData, error: fetchError } = await supabase
        .from("email_verification")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError || !existingData) {
        return reply.status(404).send({ error: "Email not found" });
      }

      // Check if token matches
      if (existingData.token !== token) {
        return reply.status(400).send({ error: "Faulty token" });
      }

      // Check token expiration
      try {
        const decodedToken = verifyToken(token) as JwtPayload;

        if (decodedToken.exp === undefined) {
          return reply
            .status(400)
            .send({ error: "Token does not have an expiration time" });
        }

        if (decodedToken.exp * 1000 < Date.now()) {
          return reply
            .status(400)
            .send({
              error: "Token is expired, please resend verification link",
            });
        }

        // Token is still valid, update 'verified' flag
        const { data, error: updateError } = await supabase
          .from("email_verification")
          .update({verified: true })
          .eq("email", email)
          .select();

        if (updateError) {
          return reply
            .status(500)
            .send({ error: "Failed to update verification status" });
        }

        return reply.send({ status: "success", data: existingData });
      } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
      }
    }
  );
};

export default emailRoutes;
