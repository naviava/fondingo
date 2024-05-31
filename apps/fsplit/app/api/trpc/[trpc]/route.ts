import { fetchRequestHandler } from "@fondingo/api/fsplit";
import { appRouter } from "@fondingo/api/fsplit";
import { createContext } from "../../../../../api/src/fsplit/trpc";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
}

export { handler as GET, handler as POST };
