import { cn } from "@fondingo/ui/utils";

interface IListWrapperProps {
  children: React.ReactNode;
  className?: string;
}

interface IListItemProps {
  children: React.ReactNode;
  showBullet?: boolean;
  className?: string;
}

export function ListWrapper({ children, className }: IListWrapperProps) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function ListItem({ children, showBullet, className }: IListItemProps) {
  return (
    <li
      className={cn(
        "list-none pl-4 md:list-disc md:pl-10",
        showBullet && "list-disc",
        className,
      )}
    >
      {children}
    </li>
  );
}
