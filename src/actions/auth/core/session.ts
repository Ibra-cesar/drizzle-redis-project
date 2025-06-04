import { z } from "zod";
import crypto from "crypto";
import { redisClient } from "../../../redis/redis";
import { Request, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../../config/env";

const SESSION_EXPIRATION_SECOND = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = COOKIES_SESSION_KEY;

export const authSessionSchema = z.object({
  id: z.string(),
});

type Session = z.infer<typeof authSessionSchema>;

export async function createUserSession(user: Session, res: Response) {
  const sessionId = crypto.randomBytes(512).toString("hex").normalize();
  await redisClient.set(
    `session:${sessionId}`,
    JSON.stringify(authSessionSchema.parse(user)),
    {
      ex: SESSION_EXPIRATION_SECOND,
    }
  );

  res.cookie(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_EXPIRATION_SECOND * 1000),
  });
}

export function getUserInfo(req: Request) {
  const sessionId = req.cookies[COOKIE_SESSION_KEY] as string;

  if (!sessionId) return null;

  return getUserSessionId(sessionId);
}

export async function getUserSessionId(sessionId: string) {
  try {
    const rawUser = await Promise.race([
      redisClient.get(`session:${sessionId}`),
      new Promise((_, reject) =>
        setTimeout(() => reject("Redis Timeout"), 2000)
      ),
    ]);

    if (!rawUser) return null;

    const { success, data: user } = authSessionSchema.safeParse(rawUser);
    return success ? user :  null;
  } catch (error) {
    console.error("Session retrieval failed:", error);
    return null;
  }
 
}
