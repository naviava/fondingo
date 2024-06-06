"use client";

import { memo, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAddMemberModal } from "@fondingo/store/fsplit";
import { usePanel } from "@fondingo/ui/use-panel";

import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";

import { cn } from "@fondingo/ui/utils";
import { hexToRgb } from "~/utils";

interface IProps {
  userId?: string;
  groupId: string;
  groupColor: string;
  hasDebts: boolean;
  hasExpenses: boolean;
  isGroupManager: boolean;
}

export const GroupActions = memo(_GroupActions);
function _GroupActions({
  userId = "",
  groupId,
  groupColor,
  hasDebts,
  hasExpenses,
}: IProps) {
  const router = useRouter();
  const { topDivRef } = usePanel();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      (searchParams.get("showBalances") && searchParams.get("showTotals")) ||
      (searchParams.get("showActivity") && searchParams.get("showBalances")) ||
      (searchParams.get("showActivity") && searchParams.get("showTotals"))
    ) {
      router.push(`/groups/${groupId}`);
      router.refresh();
    }
  }, [groupId, router, searchParams]);

  const { onOpen } = useAddMemberModal((state) => state);

  const handleAddMember = useCallback(() => {
    onOpen({ groupId, userId });
  }, [userId, groupId, onOpen]);

  const options = useMemo(
    () => [
      { label: "Add members", onClick: handleAddMember },
      {
        label: "Settle up",
        onClick: () => {
          if (!hasExpenses) return;
          if (!hasDebts) return toast({ title: "No debts to settle" });
          router.push(`/groups/${groupId}/settlement`);
        },
      },
      {
        label: "Group Log",
        onClick: () => {
          router.push(`/groups/${groupId}`);
        },
      },
      {
        label: "Balances",
        isActive: searchParams.get("showBalances"),
        onClick: () => {
          router.push(`/groups/${groupId}?showBalances=true`);
          router.refresh();
        },
      },
      {
        label: "Totals",
        isActive: searchParams.get("showTotals"),
        onClick: () => {
          router.push(`/groups/${groupId}?showTotals=true`);
          router.refresh();
        },
      },
      {
        label: "Activity",
        isActive: searchParams.get("showActivity"),
        onClick: () => {
          router.push(`/groups/${groupId}?showActivity=true`);
          router.refresh();
        },
      },
    ],
    [handleAddMember, groupId, router, hasExpenses, hasDebts, searchParams],
  );

  return (
    <div ref={topDivRef}>
      <ScrollArea hideVerticalScrollbar>
        <div className="my-6 flex gap-x-4 px-4">
          {options.map((option) => {
            if (
              option.label === "Settle up" &&
              (searchParams.get("showBalances") ||
                searchParams.get("showTotals") ||
                searchParams.get("showActivity"))
            )
              return null;
            if (
              option.label === "Group Log" &&
              !searchParams.get("showBalances") &&
              !searchParams.get("showTotals") &&
              !searchParams.get("showActivity")
            )
              return null;
            return (
              <Button
                key={option.label}
                ref={(ref) => {
                  if (option.isActive && !!ref)
                    ref.style.setProperty("--tw-shadow-color", groupColor);
                }}
                type="button"
                size="sm"
                variant="outline"
                onClick={option.onClick}
                className={cn(
                  "min-w-[7rem] font-bold shadow-sm shadow-neutral-600",
                  option.isActive && "shadow-md",
                )}
                style={{
                  backgroundColor:
                    option.label === "Settle up"
                      ? hexToRgb(groupColor, 0.3)
                      : "",
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
