import Image from "next/image";
import { cn } from "@fondingo/ui/utils";
import { logoFont } from "~/utils";

interface IProps {
  variant?: "wide" | "tall";
  size?: number;
}

export function Logo({ variant = "wide", size = 40 }: IProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variant === "tall" && "flex-col",
      )}
    >
      <div className="relative h-8 w-8 md:h-10 md:w-10">
        <Image
          fill
          src="/images/logo.png"
          alt="FSplit Logo"
          className="object-cover"
        />
      </div>
      <h1
        className={cn(
          "ml-2 text-4xl font-bold text-neutral-600 md:text-5xl",
          logoFont.className,
        )}
      >
        <span className="text-cta">FS</span>plit
      </h1>
    </div>
  );
}
