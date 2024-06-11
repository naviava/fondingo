import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function LandingLayoutWrapper({ children, className }: IProps) {
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 md:min-h-[calc(100vh-440px)] lg:min-h-[calc(100vh-448px)]",
        archivo.className,
        className,
      )}
    >
      {children}
    </div>
  );
}
