import { NextFunction, Request, Response } from "express";
import { db } from "../../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../../drizzle/schema";
import { COOKIES_SESSION_KEY } from "../../../config/env";
import { redisClient } from "../../../redis/redis";
import { AuthMiddleware } from "../../../config/types";

export async function getUser(req: Request, res: Response) {
  try {
    const users = await db.query.userTable.findMany();
    res.status(200).json({ succes: true, data: users });
  } catch (error) {
    res.status(404).json({ message: "No available user found.", error });
  }
}

export async function getUserById(
  req: AuthMiddleware,
  res: Response,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "User Id is Missing.", success: false });
      return;
    }
    const user = await db.query.userTable.findFirst({
      columns: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      where: eq(userTable.id, userId),
    });

    if (!user) {
      res.status(401).json({ message: "User Not Found." });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error.", error });
    return;
  }
}

export async function deleteUser(
  req: AuthMiddleware,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: "User Id is Missing", success: false });
    return;
  }

  const sessionId = req.cookies[COOKIES_SESSION_KEY];
  if (!sessionId) {
    res.status(200).json({ message: "No active session to log out." });
    return;
  }

  try {
    await redisClient.del(`session:${sessionId}`);

    res.clearCookie(COOKIES_SESSION_KEY, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });

    const deleteUser = await db
      .delete(userTable)
      .where(eq(userTable.id, userId));

    res.status(200).json({
      message: "User Acount Deleted",
      data: deleteUser,
      success: true,
    });
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete acount ", error, success: false });
    return;
  }
}
