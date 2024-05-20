"use client";

import { memo, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Button } from "@fondingo/ui/button";
import { toast } from "@fondingo/ui/use-toast";
import { hexToRgb } from "~/lib/utils";

interface IProps {
  groupId: string;
  groupColor: string;
  hasDebts: boolean;
  hasExpenses: boolean;
  isGroupManager: boolean;
}

export const GroupActions = memo(_GroupActions);
function _GroupActions({
  groupId,
  groupColor,
  hasDebts,
  hasExpenses,
  isGroupManager = false,
}: IProps) {
  const router = useRouter();
  const { onOpen } = useAddMemberModal();

  const handleAddMember = useCallback(() => {
    onOpen(groupId, isGroupManager);
  }, [groupId, isGroupManager, onOpen]);

  const options = useMemo(
    () => [
      { label: "Add members", onClick: handleAddMember },
      {
        label: "Settle up",
        onClick: () => {
          if (!hasExpenses) return;
          if (!hasDebts) return toast({ title: "No debts to settle" });
          router.push(`/groups/${groupId}/settle-up`);
        },
      },
      { label: "Balances", onClick: () => {} },
      { label: "Totals", onClick: () => {} },
    ],
    [handleAddMember, groupId, router, hasExpenses, hasDebts],
  );

  return (
    <ScrollArea hideVerticalScrollbar>
      <div className="my-8 flex gap-x-4 px-4">
        {options.map((option) => (
          <Button
            key={option.label}
            type="button"
            size="sm"
            variant="outline"
            onClick={option.onClick}
            className="min-w-[7rem] font-bold shadow-sm shadow-neutral-600"
            style={{
              backgroundColor:
                option.label === "Settle up" ? hexToRgb(groupColor, 0.3) : "",
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
