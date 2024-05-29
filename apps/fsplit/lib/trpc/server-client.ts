import { appRouter } from "~/server";
import { httpBatchLink } from "@trpc/client";
import { createCallerFactory } from "~/server/trpc";

const createCaller = createCallerFactory(appRouter);

export const serverClient = createCaller({
  links: [
    httpBatchLink({ url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/trpc` }),
  ],
});
