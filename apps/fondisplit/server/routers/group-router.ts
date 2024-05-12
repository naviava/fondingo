import { router } from "~/server/trpc";

import { createGroup } from "../actions/group";

export const groupRouter = router({
  createGroup,
});
