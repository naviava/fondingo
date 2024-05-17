import { router } from "~/server/trpc";

import {
  addMember,
  createGroup,
  getGroupById,
  getGroups,
  getMembers,
} from "../actions/group";

export const groupRouter = router({
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  getMembers,
});
