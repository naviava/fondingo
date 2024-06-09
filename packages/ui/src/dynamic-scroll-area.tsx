"use client";

import { ScrollArea } from "./shadcn/scroll-area";
import { usePanel } from "./hooks/use-panel";
import { useMemo } from "react";

interface IProps {
  children: React.ReactNode;
  className?: string;
  crop?: number;
}

export function DynamicScrollArea({ children, className, crop = 0 }: IProps) {
  const { panelHeight } = usePanel();
  const height = useMemo(() => `${panelHeight - crop}px`, [panelHeight, crop]);

  return (
    <ScrollArea style={{ height }} className={className}>
      {children}
    </ScrollArea>
  );
}
