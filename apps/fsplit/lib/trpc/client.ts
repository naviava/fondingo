import type { AppRouter } from "@fondingo/api/fsplit";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<AppRouter>({});
