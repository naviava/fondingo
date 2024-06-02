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
  variant?: "default" | "xs" | "sm" | "lg" | "xl" | "2xl";
}

const variantMap = {
  default: "h-10 w-10",
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
  "2xl": "h-20 w-20",
};

const textSizeMap = {
  default: "text-base",
  xs: "text-xs",
  sm: "text-sm",
  lg: "text-3xl font-semibold",
  xl: "text-4xl font-semibold",
  "2xl": "text-5xl font-semibold",
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
