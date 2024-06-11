import { cn } from "@fondingo/ui/utils";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function ListItem({ children, className }: IProps) {
  return (
    <li className={cn("list-none pl-4 md:list-disc md:pl-10", className)}>
      {children}
    </li>
  );
}
