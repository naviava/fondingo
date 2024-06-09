import { cn } from "@fondingo/ui/utils";
import Image from "next/image";
import { archivo } from "~/utils";
import { FlipWords } from "@fondingo/ui/flip-words";

const WORDS = ["Effortless", "Simple", "Secure", "Reliable", "Convenient"];

interface IProps {}

export function MainBanner({}: IProps) {
  return (
    <div className="flex flex-col items-center md:flex-row">
      <div className="relative aspect-square w-full flex-1">
        <Image
          fill
          src="/images/wide-phone-banner.png"
          alt="Welcome to FSplit"
          className="object-cover"
        />
      </div>
      <div className="flex-1 space-y-10">
        <h1
          className={cn(
            "lg:leading-tighter mx-auto text-center text-3xl font-bold tracking-tighter sm:text-4xl md:max-w-[70%] md:text-left md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]",
            archivo.className,
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
        <p className="mx-auto max-w-[70%] pl-1 text-center text-gray-500 md:text-left md:text-xl">
          FSplit makes it easy to track expenses, split bills, and get paid back
          by your friends and family.
        </p>
      </div>
    </div>
  );
}
