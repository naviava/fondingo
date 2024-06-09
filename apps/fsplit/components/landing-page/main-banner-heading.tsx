import { FlipWords } from "@fondingo/ui/flip-words";
import { cn } from "@fondingo/ui/utils";

const WORDS = ["Effortless", "Simple", "Secure", "Reliable", "Convenient"];

interface IProps {
  className?: string;
}

export function MainBannerHeading({ className }: IProps) {
  return (
    <h1
      className={cn(
        "lg:leading-tighter mx-auto text-center text-3xl font-bold tracking-tighter sm:text-4xl md:max-w-[70%] md:text-left md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]",
        className,
      )}
    >
      <FlipWords words={WORDS} className="text-cta" />
      <br />
      <div className="pl-1">
        Group
        <br />
        Expense
        <br />
        Management
      </div>
    </h1>
  );
}
