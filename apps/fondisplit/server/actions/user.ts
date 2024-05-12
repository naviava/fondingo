"use server";

import splitdb from "@fondingo/db-split";
import { getServerSession } from "next-auth";
import { publicProcedure } from "~/server/trpc";

/**
 * This function is a public procedure that queries for an authenticated user's profile.
 * It first retrieves the server session and checks if a user with an email exists in the session.
 * If not, it returns null.
 * If a user exists, it queries the database for a user with the matching email.
 * If no user is found in the database, it returns null.
 * If a user is found, it removes the hashed password from the user object and returns the user object.
 *
 * @returns {Promise<object|null>} A Promise that resolves to the user object without the hashed password, or null if no user is found.
 */
export const getAuthProfile = publicProcedure.query(async () => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const user = await splitdb.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;
  const { hashedPassword, ...userWithoutPassword } = user;

  return userWithoutPassword;
});
