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
  removeMemberFromGroup,
} from "../actions/group";

export const groupRouter = router({
  createGroup,
  editGroup,
  getGroups,
  getGroupById,
  addMember,
  addMultipleMembers,
  getMembers,
  removeMemberFromGroup,
  addSettlement,
  getDebts,
  getDebtsByMemberId,
});
