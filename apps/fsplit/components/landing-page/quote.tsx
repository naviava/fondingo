import { cn } from "@fondingo/ui/utils";
import { archivo, quoteFont } from "~/utils";

export function Quote() {
  return (
    <div className="my-28 md:my-40">
      <div className="flex items-center justify-center px-4">
        <div className="max-w-[40rem]">
          <blockquote
            className={cn(
              "text-[2rem] font-semibold italic text-neutral-700 md:text-[2.5rem] lg:text-[3rem]",
              quoteFont.className,
            )}
          >
            <p className="text-center">
              “Coming together is a beginning; keeping together is progress;
              working together is success. The strength of the team is each
              individual member. The strength of each member is the team.
              Success is not the key to happiness. Happiness is the key to
              success. If you love what you are doing, you will be successful.”
            </p>
          </blockquote>
          <p
            className={cn(
              "mt-8 text-right text-neutral-500 md:text-lg lg:text-xl",
              archivo.className,
            )}
          >
            - Henry Ford and Albert Schweitzer
          </p>
        </div>
      </div>
    </div>
  );
}
