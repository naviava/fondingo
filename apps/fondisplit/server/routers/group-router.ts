import { router } from "~/server/trpc";

import {
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
  addSettlement,
  getDebts,
  getDebtsByMemberId,
});
