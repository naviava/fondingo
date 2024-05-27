"use client";

import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { IconType } from "react-icons";
import { useMemo } from "react";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  groupId: string;
  title: string;
  description?: string;
  disabled?: boolean;
  currency?: CurrencyCode;
  icon?: IconType;
  smallIcon?: boolean;
  action: () => void;
}

export function AdvancedSettingEntry({
  groupId,
  title,
  description,
  currency,
  disabled,
  icon: Icon,
  smallIcon,
  action,
}: IProps) {
  const CurrencyIcon = useMemo(
    () => (currency ? currencyIconMap[currency].icon : null),
    [currency],
  );

  return (
    <li
      onClick={disabled ? () => {} : action}
      className={cn(
        "select-none px-4 pb-2",
        !disabled && "cursor-pointer hover:bg-neutral-200",
        !disabled && !description && "text-rose-700",
      )}
    >
      <div className="flex items-center gap-x-4">
        <div className="flex h-14 w-14 items-center justify-center">
          {!!CurrencyIcon && <CurrencyIcon className="h-10 w-10" />}
          {!!Icon && (
            <Icon
              className={cn(
                "h-10 w-10",
                disabled && "text-neutral-400",
                smallIcon && "h-6 w-6",
              )}
            />
          )}
        </div>
        <div className="flex-1 font-medium">
          <h4 className={cn("line-clamp-1", disabled && "text-neutral-400")}>
            {title}
          </h4>
        </div>
      </div>
      {!!description && (
        <p
          className={cn(
            "text-muted-foreground ml-[4.5rem] pr-4 text-sm font-medium",
            disabled && "text-neutral-400",
          )}
        >
          {description}
        </p>
      )}
    </li>
  );
}
