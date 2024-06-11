import { cn } from "@fondingo/ui/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function Paragraph({ children, className }: IProps) {
  return <p className={cn("", className)}>{children}</p>;
}
