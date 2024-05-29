import { Loader } from "@fondingo/ui/lucide";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  className?: string;
}

export function LoadingState({ className }: IProps) {
  return (
    <div className={cn("flex h-[10rem] flex-grow items-center", className)}>
      <Loader className="mx-auto animate-spin" />
    </div>
  );
}
