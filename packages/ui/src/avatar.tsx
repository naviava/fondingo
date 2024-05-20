"use client";

import { memo } from "react";
import { cn } from "./lib/utils";
import {
  Avatar as AvatarRadix,
  AvatarFallback,
  AvatarImage,
} from "./shadcn/avatar";

interface IProps {
  userName: string | null | undefined;
  userImageUrl: string | null | undefined;
  variant?: "default" | "sm" | "lg";
}

const variantMap = {
  default: "h-10 w-10",
  sm: "h-6 w-6",
  lg: "h-20 w-20",
};

const textSizeMap = {
  default: "text-base",
  sm: "text-sm",
  lg: "text-6xl font-semibold",
};

export const Avatar = memo(_Avatar);
function _Avatar({ userName, userImageUrl, variant = "default" }: IProps) {
  return (
    <AvatarRadix className={variantMap[variant]}>
      <AvatarImage src={userImageUrl || ""} />
      <AvatarFallback className={cn("bg-neutral-300", textSizeMap[variant])}>
        {!userName ? "😊" : userName[0]?.toUpperCase()}
      </AvatarFallback>
    </AvatarRadix>
  );
}
