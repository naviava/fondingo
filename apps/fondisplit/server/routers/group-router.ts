import { router } from "~/server/trpc";

import {
  addMember,
  addMultipleMembers,
  createGroup,
  deleteGroupById,
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
  deleteGroupById,
  getGroups,
  getGroupById,
  addMember,
  addMultipleMembers,
  getMembers,
  removeMemberFromGroup,
  getDebts,
  getDebtsByMemberId,
});
