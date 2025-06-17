import { z } from "zod";
import crypto from "crypto";
import { redisClient } from "../../../redis/redis";
import { Request, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../../config/env";
import { db } from "../../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../../drizzle/schema";

const SESSION_EXPIRATION_SECOND = 60 * 60 * 24 * 7;
const COOKIE_SESSION_KEY = COOKIES_SESSION_KEY;

export const authSessionSchema = z.object({
  id: z.string(),
});

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});
type UserProfile = z.infer<typeof userProfileSchema>;

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
    secure: false,
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
    const rawUser = await redisClient.get(`session:${sessionId}`);

    if (!rawUser) return null;

    const { success, data: user } = authSessionSchema.safeParse(rawUser);
    return success ? user : null;
  } catch (error) {
    console.error("Session retrieval failed:", error);
    return null;
  }
}

export async function getCachedProfile(
  userId: string
): Promise<UserProfile | null> {
  const cachedProfile = await redisClient.get(`user_profile:${userId}`);
  if (cachedProfile) {
    try {
      const { success, data: userProfile } =
        userProfileSchema.safeParse(cachedProfile);
      return success ? userProfile : null;
    } catch (error) {
      console.error("Failed to Parsed Profile", error);
      await redisClient.del(`user_profile:${userId}`);
    }
  }

  const user = await db.query.userTable.findFirst({
    columns: {
      id: true,
      email: true,
      name: true,
    },
    where: eq(userTable.id, userId),
  });
  if (!user) {
    return null;
  }
  await redisClient.set(
    `user_profile:${userId}`,
    JSON.stringify(userProfileSchema.parse(user)),
    {
      ex: SESSION_EXPIRATION_SECOND
    }
  );

  return user;
}
