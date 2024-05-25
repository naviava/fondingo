import { router } from "~/server/trpc";

import {
  addMember,
  addMultipleMembers,
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
  addMultipleMembers,
  getMembers,
  addSettlement,
  getDebts,
  getDebtsByMemberId,
});
