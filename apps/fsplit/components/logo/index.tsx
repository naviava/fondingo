import { LogoImage } from "./logo-image";
import { LogoText } from "./logo-text";

import { cn } from "@fondingo/ui/utils";

interface IProps {
  variant?: "wide" | "tall";
  dark?: boolean;
  className?: string;
}

export function Logo({ variant = "wide", dark, className }: IProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variant === "tall" && "flex-col",
        className,
      )}
    >
      <LogoImage className="w-8 md:w-10" />
      <LogoText dark={dark} className="text-4xl md:text-5xl" />
    </div>
  );
}
