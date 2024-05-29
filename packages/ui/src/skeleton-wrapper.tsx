import { cn } from "./lib/utils";
import { Skeleton } from "./shadcn/skeleton";

interface IProps {
  children: React.ReactNode;
  isLoading: boolean;
  fitWidth?: boolean;
  className?: string;
}

export function SkeletonWrapper({
  children,
  isLoading,
  className,
  fitWidth = false,
}: IProps) {
  if (!isLoading) return <>{children}</>;
  return (
    <Skeleton
      className={cn(
        "m-2 overflow-y-hidden rounded-lg bg-neutral-300",
        !fitWidth && "w-full",
        className,
      )}
    >
      <div className="opacity-0">{children}</div>
    </Skeleton>
  );
}
