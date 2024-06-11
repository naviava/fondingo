import { cn } from "@fondingo/ui/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function SubHeading({ children, className }: IProps) {
  return (
    <h3 className={cn("mb-3 mt-6 text-xl font-medium lg:text-2xl", className)}>
      {children}
    </h3>
  );
}
