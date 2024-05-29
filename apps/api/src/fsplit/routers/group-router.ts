import { router } from "../trpc";

import {
  addMember,
  addMultipleMembers,
  calculateGroupDebts,
  createGroup,
  deleteGroupById,
  editGroup,
  getDebts,
  getDebtsByMemberId,
  getGroupById,
  getGroups,
  getGroupTotals,
  getMembers,
  removeMemberFromGroup,
} from "../actions/group";

export const groupRouter = router({
  createGroup,
  editGroup,
  deleteGroupById,
  getGroups,
  getGroupById,
  addMember,
  addMultipleMembers,
  getMembers,
  removeMemberFromGroup,
  getDebts,
  getDebtsByMemberId,
  getGroupTotals,
  calculateGroupDebts,
});
