import { router } from "~/server/trpc";

import {
  addExpense,
  addMember,
  addSettlement,
  createGroup,
  editGroup,
  getDebts,
  getDebtsByMemberId,
  getGroupById,
  getGroups,
  getMembers,
} from "../actions/group";

export const groupRouter = router({
  createGroup,
  editGroup,
  getGroups,
  getGroupById,
  addMember,
  getMembers,
  addExpense,
  addSettlement,
  getDebts,
  getDebtsByMemberId,
});
