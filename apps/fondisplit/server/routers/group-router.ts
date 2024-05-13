import { router } from "~/server/trpc";

import {
  addMember,
  createGroup,
  getGroupById,
  getGroups,
} from "../actions/group";

export const groupRouter = router({
  createGroup,
  getGroups,
  getGroupById,
  addMember,
});
