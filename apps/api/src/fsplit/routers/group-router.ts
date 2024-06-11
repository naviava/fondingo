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
  isGroupManager,
  removeMemberFromGroup,
} from "../actions/group";

export const groupRouter = router({
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
  isGroupManager,
  removeMemberFromGroup,
});
