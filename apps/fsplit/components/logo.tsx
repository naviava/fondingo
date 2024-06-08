import Image from "next/image";
import { cn } from "@fondingo/ui/utils";

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
      <Image
        src="/images/logo.png"
        alt="FSplit Logo"
        width={size}
        height={size}
        className="object-cover"
      />
      <h1 className="ml-2 text-2xl font-bold">FSplit</h1>
    </div>
  );
}
