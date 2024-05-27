"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { useAddMemberModal } from "@fondingo/store/fondisplit";

import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
import { hexToRgb } from "~/lib/utils";
import { cn } from "@fondingo/ui/utils";

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
  isGroupManager = false,
}: IProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topDivRef = useRef<HTMLDivElement>(null);

  const { onOpen } = useAddMemberModal((state) => state);
  const { setTopRef } = usePanelHeight((state) => state);

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
    ],
    [handleAddMember, groupId, router, hasExpenses, hasDebts, searchParams],
  );

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  return (
    <div ref={topDivRef}>
      <ScrollArea hideVerticalScrollbar>
        <div className="my-8 flex gap-x-4 px-4">
          {options.map((option) => {
            if (
              option.label === "Settle up" &&
              (!!searchParams.get("showBalances") ||
                !!searchParams.get("showTotals"))
            )
              return null;
            if (
              option.label === "Group Log" &&
              !searchParams.get("showBalances") &&
              !searchParams.get("showTotals")
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
