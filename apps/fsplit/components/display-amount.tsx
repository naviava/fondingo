"use client";

import { memo, useMemo } from "react";

import { currencyIconMap } from "@fondingo/ui/constants";
import { TCurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  amount: number;
  currency: TCurrencyCode;
  className?: string;
  showNegative?: boolean;
  variant?: "default" | "xs" | "sm" | "lg" | "xl";
}

export const DisplayAmount = memo(_DisplayAmount);
function _DisplayAmount({
  amount,
  currency,
  className,
  showNegative = false,
  variant = "default",
}: IProps) {
  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const displayAmount = useMemo(() => {
    if (showNegative) return amount;
    return amount < 0 ? -amount : amount;
  }, [amount, showNegative]);

  return (
    <div className={cn("flex items-center", className)}>
      <CurrencyIcon
        className={cn(
          "h-4 w-4",
          variant === "xs" && "h-3 w-3 md:h-3.5 md:w-3.5",
          variant === "sm" && "h-3.5 w-3.5",
          variant === "lg" && "h-5 w-5",
          variant === "xl" && "h-7 w-7",
        )}
      />
      <span
        className={cn(
          variant === "xs" && "text-xs md:text-sm",
          variant === "sm" && "text-sm",
          variant === "lg" && "text-2xl",
          variant === "xl" && "text-4xl",
        )}
      >
        {(displayAmount / 100).toLocaleString()}
      </span>
    </div>
  );
}
