"use client";

import { Button } from "@fondingo/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "./lib/utils";

interface IProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "splitCta"
    | "splitGhost"
    | null
    | undefined;
}

export function RefreshButton({ variant = "ghost" }: IProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        setIsRefreshing(true);
        window.location.reload();
      }}
      disabled={isRefreshing}
      className="text-muted-foreground"
    >
      <RefreshCw
        className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")}
      />
      Refresh
    </Button>
  );
}
