import { NextFunction, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../config/env";
import { db } from "../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../drizzle/schema";
import { getUserSessionId } from "../auth/core/session";
import { AuthMiddleware } from "../../config/types";

export async function authMiddleware(
  req: AuthMiddleware,
  res: Response,
  next: NextFunction
): Promise<void> {
  const sessionId = req.cookies[COOKIES_SESSION_KEY] as string;

  if (!sessionId) {
    res.status(401).json({ message: "No active session found. Unauthorized." });
    return;
  }

  try {
    // Check if session ID exists in Redis
    const sessionExists = await getUserSessionId(sessionId);

    if (!sessionExists) {
      res.status(401).json({ message: "Session expired or invalid." });
      return;
    }

    // Fetch the user info based on the session ID (you can get this from DB)
    const user = await db.query.userTable.findFirst({
      where: eq(userTable.id, sessionExists.id), // Or whatever field holds session ID
    });

    if (!user) {
      res
        .status(401)
        .json({ message: "User not found or session is invalid." });
      return;
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
