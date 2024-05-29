import { createCallerFactory } from "@fondingo/api/fsplit";
import { appRouter } from "@fondingo/api/fsplit";
import { httpBatchLink } from "@trpc/client";

const createCaller = createCallerFactory(appRouter);

export const serverClient = createCaller({
  links: [
    httpBatchLink({ url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/trpc` }),
  ],
});
