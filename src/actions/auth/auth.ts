import { eq } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { singUpSchema } from "./schema/authSchema";
import { z } from "zod";
import { userTable } from "../../drizzle/schema";
import { generateSalt, passwordHasher } from "./core/passwordHasher";
import { createUserSession } from "./core/session";
import { Response } from "express";

export async function singUp(uData: z.infer<typeof singUpSchema>, res: Response) {
  const { success, data } = singUpSchema.safeParse(uData);

  if (!success) return "Unable to create a new acount.";
  //implement logic

  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.email, data.email),
  });

  if (existingUser != null) return "Email is already exist";

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

    if (user == null) return "Unable to create user";
    await createUserSession(user, res)
  } catch (error) {
    console.error("Unable to create user.", error);
  }
}
