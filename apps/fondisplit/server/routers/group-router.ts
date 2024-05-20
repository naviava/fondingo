import { router } from "~/server/trpc";

import {
  addExpense,
  addMember,
  addSettlement,
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
  addSettlement,
});
