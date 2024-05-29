import { useCallback } from "react";
import { trpc } from "~/lib/trpc/client";

export function useUtils() {
  const utils = trpc.useUtils();

  const invalidateGroupQueries = useCallback(() => {
    utils.group.getDebtsByMemberId.invalidate();
    utils.group.getGroupById.invalidate();
    utils.group.getMembers.invalidate();
    utils.group.getGroups.invalidate();
    utils.group.getDebts.invalidate();
  }, [
    utils.group.getDebts,
    utils.group.getDebtsByMemberId,
    utils.group.getGroupById,
    utils.group.getGroups,
    utils.group.getMembers,
  ]);

  const invalidateUserQueries = useCallback(() => {
    utils.user.getDebtWithFriend.invalidate();
    utils.user.getAuthProfile.invalidate();
    utils.user.findFriends.invalidate();
    utils.user.getFriends.invalidate();
    utils.user.findUsers.invalidate();
  }, [
    utils.user.getAuthProfile,
    utils.user.getDebtWithFriend,
    utils.user.getFriends,
    utils.user.findFriends,
    utils.user.findUsers,
  ]);

  const invalidateExpenseQueries = useCallback(() => {
    utils.expense.getSettlementById.invalidate();
    utils.expense.getExpenseById.invalidate();
    utils.expense.getSettlements.invalidate();
  }, [
    utils.expense.getExpenseById,
    utils.expense.getSettlementById,
    utils.expense.getSettlements,
  ]);

  const invalidateAll = useCallback(() => {
    invalidateExpenseQueries();
    invalidateGroupQueries();
    invalidateUserQueries();
  }, [invalidateExpenseQueries, invalidateGroupQueries, invalidateUserQueries]);

  return {
    invalidateExpenseQueries,
    invalidateGroupQueries,
    invalidateUserQueries,
    invalidateAll,
  };
}
