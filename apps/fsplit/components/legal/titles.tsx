import { cn } from "@fondingo/ui/utils";

interface IMainTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface ISubHeadingProps {
  children: React.ReactNode;
  className?: string;
}

interface ISectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function MainTitle({ children, className }: IMainTitleProps) {
  return (
    <h1 className={cn("text-4xl font-semibold lg:text-5xl", className)}>
      {children}
    </h1>
  );
}

export function SectionTitle({ children, className }: ISectionTitleProps) {
  return (
    <h2 className={cn("mb-4 text-3xl font-semibold lg:text-4xl", className)}>
      {children}
    </h2>
  );
}

export function SubHeading({ children, className }: ISubHeadingProps) {
  return (
    <h3 className={cn("mb-3 mt-6 text-xl font-medium lg:text-2xl", className)}>
      {children}
    </h3>
  );
}
