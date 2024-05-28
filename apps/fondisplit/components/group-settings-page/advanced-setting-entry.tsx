"use client";

import { useMemo } from "react";

import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";

import { Loader } from "@fondingo/ui/lucide";
import { IconType } from "react-icons";
import { format } from "@fondingo/utils/date-fns";

interface IProps {
  title: string;
  isCalc?: boolean;
  currentTime?: Date;
  disabled?: boolean;
  smallIcon?: boolean;
  description?: string;
  timeRemaining?: number;
  currency?: CurrencyCode;
  icon?: IconType;
  action: () => void;
}

export function AdvancedSettingEntry({
  title,
  isCalc,
  currency,
  disabled,
  smallIcon,
  description,
  timeRemaining,
  action,
  icon: Icon,
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
        <div
          className={cn("flex flex-1 items-center justify-between font-medium")}
        >
          <div className="flex items-center">
            <h4
              className={cn(
                "line-clamp-1",
                disabled && "text-neutral-400",
                !!timeRemaining && "text-sm",
              )}
            >
              {!timeRemaining
                ? title
                : `Calculate debts again in ${Math.floor(timeRemaining / 60)}:${timeRemaining % 60 < 10 ? `0${timeRemaining % 60}` : timeRemaining % 60}`}
            </h4>
            {isCalc && <Loader className="ml-2 h-5 w-5 animate-spin" />}
          </div>
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
