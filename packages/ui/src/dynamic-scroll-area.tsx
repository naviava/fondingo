"use client";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { ScrollArea } from "./shadcn/scroll-area";
import { useMemo } from "react";

interface IProps {
  children: React.ReactNode;
  className?: string;
  crop?: number;
}

export function DynamicScrollArea({ children, className, crop = 32 }: IProps) {
  const { panelHeight } = usePanelHeight((state) => state);
  const height = useMemo(() => `${panelHeight - crop}px`, [panelHeight, crop]);

  return (
    <ScrollArea style={{ height }} className={className}>
      {children}
    </ScrollArea>
  );
}
