import { NextFunction, Request, Response } from "express";
import { db } from "../../../drizzle/db";
import { eq } from "drizzle-orm";
import { userTable } from "../../../drizzle/schema";
import { COOKIES_SESSION_KEY } from "../../../config/env";
import { redisClient } from "../../../redis/redis";
import { AuthMiddleware } from "../../../config/types";
import { getUserSessionId } from "../core/session";

export async function getUser(req: Request, res: Response) {
  try {
    const users = await db.query.userTable.findMany();
    res.status(200).json({ succes: true, data: users });
  } catch (error) {
    res.status(404).json({ message: "No available user found.", error, success:false });
  }
}

export async function getUserById(
  req: AuthMiddleware,
  res: Response
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
      },
      where: eq(userTable.id, userId),
    });

    if (!user) {
      res.status(401).json({ message: "User Not Found.", success:false });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error.", error, success:false });
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
    res.status(200).json({ message: "No active session to log out.",success:false });
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

export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const sessionId = req.cookies[COOKIES_SESSION_KEY];

    if (!sessionId) {
      res.status(401).json({ message: "Unauthorized", success: false });
      return;
    }

    const session = await getUserSessionId(sessionId);
    if (!session) {
      res.status(401).json({ message: "Session expired", success: false });
      return;
    }

    const user = await db.query.userTable.findFirst({
      columns: {
        id: true,
        email: true,
        name: true,
      },
      where: eq(userTable.id, session.id),
    });
    if (!user) {
      res.status(404).json({ message: "User not found", success: false });
      return;
    }
    res.status(200).json({
      data: { id: user.id, name: user.name, email: user.email },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error", success: false });
    return;
  }
}
