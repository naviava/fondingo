"use client";

import { useState } from "react";
import { cn } from "./lib/utils";

import { Button } from "@fondingo/ui/button";
import { RefreshCw } from "lucide-react";

interface IProps {
  size?: "default" | "icon" | "sm" | "lg";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "cta"
    | "ctaGhost";
}

export function RefreshButton({ size = "sm", variant = "ghost" }: IProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <Button
      type="button"
      size={size}
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
