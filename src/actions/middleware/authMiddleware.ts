import { NextFunction, Request, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../config/env";
import { redisClient } from "../../redis/redis";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = req.cookies[COOKIES_SESSION_KEY];

  if (!sessionId) {
    return res
      .status(401)
      .json({ message: "No active session found. || Unauthorized" });
  }

  try {
    const session = await redisClient.get(`session:${sessionId}`);
    if (!session) {
      return res
        .status(401)
        .json({ message: "Session is expired or invalid." });
    }

    // Session is valid, continue to next middleware
    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
}
