import bcrypt from "bcryptjs";

export async function verifyPassword(
  plainTextPassword: string,
  passwordHash: string,
) {
  return bcrypt.compare(plainTextPassword, passwordHash);
}
