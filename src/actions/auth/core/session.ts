import { z } from "zod";
import crypto from 'crypto'
import { redisClient } from "../../../redis/redis";
import { Request, Response } from "express";
import { COOKIES_SESSION_KEY } from "../../../config/env";
import { RequestWithCookies } from "../../../config/types/express";

const SESSION_EXPIRATION_SECOND = 60 * 60 * 24 * 7
const COOKIE_SESSION_KEY = COOKIES_SESSION_KEY

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

export function getUserInfo(req: Request){
   const sessionId = req.cookies[COOKIE_SESSION_KEY]

   if(sessionId === null) return null
   
   return getUserSessionId(sessionId)
}

async function getUserSessionId(sessionId: string){
   const rawUser = await redisClient.get(`session:${sessionId}`)

   const {success, data: user} = authSessionSchema.safeParse(rawUser)

   return success ? user : null
}

export async function removeUserSession(req :RequestWithCookies, res:Response) {
   const sessionId = req.cookies[COOKIE_SESSION_KEY];
   if (sessionId === null) return null;

   await redisClient.del(`session:${sessionId}`)
   res.clearCookie(COOKIE_SESSION_KEY)
}