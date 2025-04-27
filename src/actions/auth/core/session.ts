import { z } from "zod";
import crypto from 'crypto'
import { redisClient } from "../../../redis/redis";
import { Response } from "express";

const SESSION_EXPIRATION_SECOND = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = "custom-todo-backend-session-id"

export const authSessionSchema = z.object({
    id: z.string()
});

type Session = z.infer<typeof authSessionSchema>

export async function createUserSession(user: Session, res: Response){
 const sessionId = crypto.randomBytes(512).toString("hex").normalize()
 await redisClient.set(`session:${sessionId}`, authSessionSchema.parse(user), {
    ex: SESSION_EXPIRATION_SECOND
 })
 res.cookie(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_EXPIRATION_SECOND * 1000)
 })
}

