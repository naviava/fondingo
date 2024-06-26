"use client";

import { usePanel } from "@fondingo/ui/use-panel";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

interface IProps {
  title: string;
  className?: string;
}

export function SimpleTitleTopRef({ title, className }: IProps) {
  const { topDivRef } = usePanel();

  return (
    <div ref={topDivRef}>
      <h1
        className={cn(
          "mb-4 pt-4 text-center text-xl font-semibold",
          hfont.className,
          className,
        )}
      >
        {title}
      </h1>
    </div>
  );
}
