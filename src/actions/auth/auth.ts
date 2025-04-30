import { eq } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { singInSchema, singUpSchema } from "./schema/authSchema";
import { z } from "zod";
import { userTable } from "../../drizzle/schema";
import { comparePasswords, generateSalt, passwordHasher } from "./core/passwordHasher";
import { createUserSession, removeUserSession } from "./core/session";
import { Response } from "express";
import { RequestWithCookies } from "../../config/types/express";

export async function singUp(
  uData: z.infer<typeof singUpSchema>,
  res: Response
) {
  const { success, data } = singUpSchema.safeParse(uData);

  if (!success) throw new Error("Unable to create a new acount.");
  //implement logic

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.email, data.email),
  });

  if (existingUser != null) throw new Error("Email is already exist");

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
      .returning({ id: userTable.id });

    if (user == null) throw new Error("Unable to create user");
    await createUserSession(user, res);
    return user;
  } catch (error) {
    console.error("Unable to create user.", error);
    throw new Error("Unable to create user.");
  }
}

export async function signIn(
  uData: z.infer<typeof singInSchema>,
  res: Response
) {
  const { success, data } = singInSchema.safeParse(uData);

  if (!success) throw new Error("Unable to Log-in.");

  const user = await db.query.userTable.findFirst({
    columns: { password: true, salt: true, id: true, email: true },
    where: eq(userTable.email, data.email),
  });

  if (user == null || user.password == null || user.salt == null)
    throw new Error("User is not found, invalid credentials.");

  const isCorrectPassword = await comparePasswords({
    hashedPassword: user.password,
    password: data.password,
    salt: user.salt,
  });

  if (!isCorrectPassword) throw new Error("Invalid Password.");

  await createUserSession(user, res)
}

export async function signOut(req: RequestWithCookies, res: Response) {
  await removeUserSession(req, res)
}
