import { cn } from "@fondingo/ui/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function MainTitle({ children, className }: IProps) {
  return (
    <h1 className={cn("text-4xl font-semibold lg:text-5xl", className)}>
      {children}
    </h1>
  );
}
