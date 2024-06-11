import { cn } from "@fondingo/ui/utils";
import { archivo } from "~/utils";

interface IProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: IProps) {
  return (
    <article
      className={cn(
        "mx-auto mt-10 flex max-w-[980px] flex-col gap-y-10 px-4 pb-24 md:mt-14 md:px-10 lg:mt-[4.5rem] lg:gap-y-12",
        archivo.className,
      )}
    >
      {children}
    </article>
  );
}
