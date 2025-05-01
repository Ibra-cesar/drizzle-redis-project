import { NextFunction, Request, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../config/env";
import { redisClient } from "../../redis/redis";
import { db } from "../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../drizzle/schema";

interface AuthMiddleware extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export async function authMiddleware(
  req: AuthMiddleware,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies[COOKIES_SESSION_KEY];

  if (!sessionId) {
    res.status(401).json({ message: "No active session found. Unauthorized." });
  }

  try {
    // Check if session ID exists in Redis
    const sessionExists = await redisClient.get(`session:${sessionId}`);

    if (!sessionExists) {
      res.status(401).json({ message: "Session expired or invalid." });
    }

    // Fetch the user info based on the session ID (you can get this from DB)
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, sessionId), // Or whatever field holds session ID
      columns: { id: true, email: true, name: true },
    });

    if (!user) {
      res
        .status(401)
        .json({ message: "User not found or session is invalid." });
    }

    // Attach user info to the request object (so that later middleware or handlers can access it)
    req.user = user; // Can use `AuthenticatedRequest` type if needed

    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ message: "Internal server error in authentication." });
  }
}
