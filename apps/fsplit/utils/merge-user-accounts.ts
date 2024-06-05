"use server";

import { getServerSession } from "next-auth";
import splitdb from "@fondingo/db-split";
import { authOptions } from "~/lib/auth";

export async function mergeUserAccounts() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const existingUser = await splitdb.user.findUnique({
    where: {
      email: session.user.email,
      isMerged: false,
    },
  });
  if (!existingUser) return true;

  return splitdb.$transaction(async (db) => {
    await db.groupMember.updateMany({
      where: {
        email: existingUser.email,
        userId: null,
      },
      data: { userId: existingUser.id },
    });

    const tempFriends = await db.tempFriend.findMany({
      where: {
        email: existingUser.email,
      },
    });

    if (!!tempFriends.length) {
      await db.friend.createMany({
        data: tempFriends.map((tempFriend) => ({
          user1Id: tempFriend.userId,
          user2Id: existingUser.id,
        })),
      });

      await db.tempFriend.deleteMany({
        where: { email: existingUser.email },
      });
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: { isMerged: true },
    });
    await db.log.create({
      data: {
        type: "USER",
        userId: existingUser.id,
        message: `${existingUser.name} joined FSplit.`,
      },
    });
  });
}
