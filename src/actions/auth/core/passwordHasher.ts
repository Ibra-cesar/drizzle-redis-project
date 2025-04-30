import crypto from "crypto";

type Compare = {
  password: string;
  salt: string;
  hashedPassword: string;
};

export function passwordHasher(
  password: string,
  salt: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject(error);

      resolve(hash.toString("hex").normalize());
    });
  });
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize();
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: Compare) {
  const inputPassword = await passwordHasher(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(inputPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  );
}
