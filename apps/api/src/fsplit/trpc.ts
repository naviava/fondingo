import { getServerSession } from "next-auth";
import { TRPCError, initTRPC } from "@trpc/server";
import splitdb from "@fondingo/db-split";

const t = initTRPC.create();
export const middleware = t.middleware;

// Logged in users only middleware.
const isAuthenticated = middleware(async (opts) => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized action",
    });
  const user = await splitdb.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.disabled)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized action",
    });
  return opts.next({
    ctx: {
      splitdb,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        disabled: user.disabled,
      },
    },
  });
});

const isAdmin = middleware(async (opts) => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized action",
    });
  const user = await splitdb.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || user.disabled || user.role !== "ADMIN")
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized action",
    });
  return opts.next({
    ctx: {
      splitdb,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        disabled: user.disabled,
      },
    },
  });
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const adminProcedure = t.procedure.use(isAdmin);
export const privateProcedure = t.procedure.use(isAuthenticated);
