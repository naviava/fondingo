import { cn } from "./lib/utils";
import { Skeleton } from "./shadcn/skeleton";

interface IProps {
  children: React.ReactNode;
  isLoading: boolean;
  fitWidth?: boolean;
}

export function SkeletonWrapper({
  children,
  isLoading,
  fitWidth = false,
}: IProps) {
  if (!isLoading) return <>{children}</>;
  return (
    <Skeleton className={cn(!fitWidth && "w-full")}>
      <div className="opacity-0">{children}</div>
    </Skeleton>
  );
}
