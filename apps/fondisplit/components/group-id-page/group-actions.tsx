"use client";

import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { Button } from "@fondingo/ui/button";
import { useCallback, useMemo } from "react";

interface IProps {
  groupId: string;
  currentUserRole: string | undefined;
}

export function GroupActions({ groupId, currentUserRole }: IProps) {
  const { onOpen } = useAddMemberModal();

  const handleAddMember = useCallback(() => {}, []);

  const options = useMemo(
    () => [
      { label: "Add members", onClick: handleAddMember },
      { label: "Settle up", onClick: () => {} },
      { label: "Balances", onClick: () => {} },
      { label: "Totals", onClick: () => {} },
    ],
    [],
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
            onClick={() => option.onClick}
            className="min-w-[7rem] font-bold shadow-sm shadow-neutral-600"
          >
            {option.label}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
