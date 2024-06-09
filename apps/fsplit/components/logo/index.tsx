import { LogoImage } from "./logo-image";
import { LogoText } from "./logo-text";

import { cn } from "@fondingo/ui/utils";

interface IProps {
  variant?: "wide" | "tall";
  size?: number;
}

export function Logo({ variant = "wide" }: IProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variant === "tall" && "flex-col",
      )}
    >
      <LogoImage className="w-8 md:w-10" />
      <LogoText className="text-4xl md:text-5xl" />
    </div>
  );
}
