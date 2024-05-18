import { router } from "~/server/trpc";

import {
  addExpense,
  addMember,
  createGroup,
  getDebts,
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
  addExpense,
  getDebts,
});
