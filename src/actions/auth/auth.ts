import { eq } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { singInSchema, singUpSchema } from "./schema/authSchema";
import { z } from "zod";
import { userTable } from "../../drizzle/schema";
import {
  comparePasswords,
  generateSalt,
  passwordHasher,
} from "./core/passwordHasher";
import { createUserSession } from "./core/session";
import { Response, Request } from "express";
import { COOKIES_SESSION_KEY } from "../../config/env";
import { redisClient } from "../../redis/redis";

export async function singUp(
  uData: z.infer<typeof singUpSchema>,
  res: Response
) {
  console.log("Received sign-up request:", uData);
  const { success, data } = singUpSchema.safeParse(uData);

  if (!success)
    return res
      .status(400)
      .json({ message: "Unable to create a new acount.", success: false });
  //implement logic

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.email, data.email),
  });

  if (existingUser != null) {
    return res
      .status(401)
      .json({ message: "Email is already exist", success: false });
  }

  try {
    const salt = generateSalt();
    const hash = await passwordHasher(data.password, salt);
    const [user] = await db
      .insert(userTable)
      .values({
        name: data.name,
        email: data.email,
        password: hash,
        salt,
      })
      .returning({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      });

    if (user == null)
      return res
        .status(400)
        .json({ message: "Unable to create new user.", success: false });

    await createUserSession(user, res);
    return res.status(201).json({ data: user, success: true });
  } catch (error) {
    console.error("Unable to create user.", error);
    return res
      .status(500)
      .json({ message: "Unable to create new user.", success: false });
  }
}

export async function signIn(
  uData: z.infer<typeof singInSchema>,
  res: Response
) {
  const { success, data } = singInSchema.safeParse(uData);

  try {
    if (!success) {
      return res
        .status(401)
        .json({ message: "Unable to Log-in.", success: false });
    }

    const user = await db.query.userTable.findFirst({
      columns: {
        name: true,
        password: true,
        salt: true,
        id: true,
        email: true,
      },
      where: eq(userTable.email, data.email),
    });

    if (user == null || user.password == null || user.salt == null) {
      return res
        .status(401)
        .json({
          message: "User is not found, invalid credentials.",
          success: false,
        });
    }

    const isCorrectPassword = await comparePasswords({
      hashedPassword: user.password,
      password: data.password,
      salt: user.salt,
    });

    if (!isCorrectPassword) {
      return res
        .status(401)
        .json({ message: "Invalid Password.", success: false });
    }

    await createUserSession(user, res);
    res.status(201).json({ data: user, success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal server error.", success: false });
  }
}

export async function signOut(req: Request, res: Response) {
  const sessionId = req.cookies[COOKIES_SESSION_KEY];
  if (!sessionId) {
    return res
      .status(200)
      .json({ message: "No active session to log out.", success: false });
  }

  try {
    const sessionExist = await redisClient.exists(`session:${sessionId}`);
    if (!sessionExist) {
      return res
        .status(200)
        .json({ message: "Session already expired.", success: false });
    }
    await redisClient.del(`session:${sessionId}`);

    res.clearCookie(COOKIES_SESSION_KEY, {
      httpOnly: true,
      sameSite: "lax",
    });

    return res
      .status(200)
      .json({ message: "Successfully signed out.", success: true });
  } catch (error) {
    console.error("Logout failed:", error);
    return res
      .status(500)
      .json({ message: "Failed to sign out.", success: false });
  }
}
