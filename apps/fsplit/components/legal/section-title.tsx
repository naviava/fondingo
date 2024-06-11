import { cn } from "@fondingo/ui/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionTitle({ children, className }: IProps) {
  return (
    <h2 className={cn("mb-4 text-3xl font-semibold lg:text-4xl", className)}>
      {children}
    </h2>
  );
}
