import { cn } from "@fondingo/ui/utils";
import { logoFont } from "~/utils";

interface IProps {
  className?: string;
  dark?: boolean;
}

export function LogoText({ className, dark }: IProps) {
  return (
    <h1
      className={cn(
        "ml-2 font-bold text-neutral-600",
        logoFont.className,
        dark && "text-neutral-400",
        className,
      )}
    >
      <span className={cn("text-cta", dark && "text-white")}>FS</span>plit
    </h1>
  );
}
