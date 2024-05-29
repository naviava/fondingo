import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@fondingo/api/fsplit";

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
}

export { handler as GET, handler as POST };
