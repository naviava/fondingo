"use client";

import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { useAddMemberModal } from "@fondingo/store/fondisplit";

import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { toast } from "@fondingo/ui/use-toast";
import { Button } from "@fondingo/ui/button";
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
  const topDivRef = useRef<HTMLDivElement>(null);

  const { onOpen } = useAddMemberModal();
  const { setTopRef } = usePanelHeight((state) => state);

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
          router.push(`/groups/${groupId}/settlement`);
        },
      },
      { label: "Balances", onClick: () => {} },
      { label: "Totals", onClick: () => {} },
    ],
    [handleAddMember, groupId, router, hasExpenses, hasDebts],
  );

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.top);
      console.log(topDiv?.top);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  return (
    <div ref={topDivRef}>
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
    </div>
  );
}
