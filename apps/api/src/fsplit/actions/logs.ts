import { privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";

export const userLogs = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  try {
    const logs = await splitdb.log.findMany({
      where: {
        type: "USER",
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    return logs;
  } catch (err) {
    console.error(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get logs",
    });
  }
});
