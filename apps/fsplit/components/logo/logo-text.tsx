import { cn } from "@fondingo/ui/utils";
import { logoFont } from "~/utils";

interface IProps {
  className?: string;
}

export function LogoText({ className }: IProps) {
  return (
    <h1
      className={cn(
        "ml-2 font-bold text-neutral-600",
        logoFont.className,
        className,
      )}
    >
      <span className="text-cta">FS</span>plit
    </h1>
  );
}
