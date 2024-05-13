"use client";

import { Button } from "@fondingo/ui/button";
import { ScrollArea, ScrollBar } from "@fondingo/ui/scroll-area";
import { useMemo } from "react";

interface IProps {}

export function GroupActions({}: IProps) {
  const options = useMemo(
    () => [
      { label: "Add members" },
      { label: "Settle up" },
      { label: "Balances" },
      { label: "Totals" },
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
