"use client";

import { ScrollArea } from "./shadcn/scroll-area";
import { useMemo } from "react";
import { usePanel } from "./hooks/use-panel";

interface IProps {
  children: React.ReactNode;
  className?: string;
  crop?: number;
}

export function DynamicScrollArea({ children, className, crop = 32 }: IProps) {
  const { panelHeight } = usePanel();
  const height = useMemo(() => `${panelHeight - crop}px`, [panelHeight, crop]);

  return (
    <ScrollArea style={{ height }} className={className}>
      {children}
    </ScrollArea>
  );
}
