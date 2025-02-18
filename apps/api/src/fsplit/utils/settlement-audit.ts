"use server";

import splitdb from "@fondingo/db-split";
import {
  Settlement,
  ChangeType,
  Prisma,
  SettlementAuditLog,
} from "@prisma/client";

/**
 * Creates an audit log entry for a settlement change.
 * Stores the complete state of the settlement.
 * For updates, stores both old and new states to enable efficient debt calculations.
 *
 * @param settlement - The current state of the settlement
 * @param changeType - The type of change (CREATED, UPDATED, DELETED)
 * @param oldSettlement - The previous state for updates, required when changeType is UPDATED
 */
export async function createSettlementAuditLog(
  settlement: Settlement,
  changeType: ChangeType,
  oldSettlement?: Settlement,
) {
  // For updates, we need both old and new states
  if (changeType === "UPDATED" && !oldSettlement) {
    throw new Error("Old settlement state required for updates");
  }

  const oldState: Prisma.JsonObject =
    changeType === "UPDATED"
      ? {
          ...oldSettlement!,
          createdAt: oldSettlement!.createdAt.toISOString(),
          updatedAt: oldSettlement!.updatedAt.toISOString(),
        }
      : {
          ...settlement,
          createdAt: settlement.createdAt.toISOString(),
          updatedAt: settlement.updatedAt.toISOString(),
        };

  const newState: Prisma.JsonObject | undefined =
    changeType === "UPDATED"
      ? {
          ...settlement,
          createdAt: settlement.createdAt.toISOString(),
          updatedAt: settlement.updatedAt.toISOString(),
        }
      : undefined;

  await splitdb.settlementAuditLog.create({
    data: {
      settlementId: settlement.id,
      groupId: settlement.groupId,
      changeType,
      oldState,
      newState,
    },
  });
}

/**
 * Gets all settlement changes since a specific time.
 * Used by the debt calculator to process only new changes
 * instead of recalculating everything.
 *
 * @param groupId - The group to get changes for
 * @param since - The timestamp to get changes since
 */
export async function getSettlementChangesSince(groupId: string, since: Date) {
  return splitdb.settlementAuditLog.findMany({
    where: {
      groupId,
      createdAt: { gt: since },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Processes a settlement change for debt calculation.
 * Returns a map of member IDs to their balance changes.
 * For deletions: Reverses the original settlement
 * For creations: Applies the settlement
 * For updates: Calculates the delta between old and new states
 *
 * @param auditLogRaw - The audit log entry to process
 * @returns Map of member IDs to their balance changes
 */
export async function processSettlementChange(
  auditLogRaw: SettlementAuditLog,
): Promise<Map<string, number>> {
  // Parse the stored JSON states back into the correct shape
  const oldState = {
    ...(auditLogRaw.oldState as Prisma.JsonObject),
    createdAt: new Date(
      (auditLogRaw.oldState as Prisma.JsonObject).createdAt as string,
    ),
    updatedAt: new Date(
      (auditLogRaw.oldState as Prisma.JsonObject).updatedAt as string,
    ),
  } as Settlement;

  let newState: Settlement | undefined;
  if (auditLogRaw.newState) {
    newState = {
      ...(auditLogRaw.newState as Prisma.JsonObject),
      createdAt: new Date(
        (auditLogRaw.newState as Prisma.JsonObject).createdAt as string,
      ),
      updatedAt: new Date(
        (auditLogRaw.newState as Prisma.JsonObject).updatedAt as string,
      ),
    } as Settlement;
  }

  const balanceChanges = new Map<string, number>();

  switch (auditLogRaw.changeType) {
    case "DELETED":
      // For deletions, reverse the settlement
      balanceChanges.set(oldState.fromId, -oldState.amount);
      balanceChanges.set(oldState.toId, oldState.amount);
      break;

    case "CREATED":
      // For new settlements, apply the settlement
      balanceChanges.set(oldState.fromId, oldState.amount);
      balanceChanges.set(oldState.toId, -oldState.amount);
      break;

    case "UPDATED":
      if (!newState) {
        throw new Error("New state required for updates");
      }

      // For updates, calculate the delta between old and new states
      // First reverse the old settlement
      balanceChanges.set(oldState.fromId, -oldState.amount);
      balanceChanges.set(oldState.toId, oldState.amount);

      // Then apply the new settlement
      const currentFromBalance = balanceChanges.get(newState.fromId) ?? 0;
      const currentToBalance = balanceChanges.get(newState.toId) ?? 0;
      balanceChanges.set(newState.fromId, currentFromBalance + newState.amount);
      balanceChanges.set(newState.toId, currentToBalance - newState.amount);
      break;
  }

  return balanceChanges;
}
