"use client";

import { TextGenerateEffect } from "@fondingo/ui/text-generate-effect";
import { useIsMounted } from "~/hooks/use-is-mounted";

import { archivo, quoteFont } from "~/utils";
import { cn } from "@fondingo/ui/utils";

export function Quote() {
  const isMounted = useIsMounted();
  if (!isMounted) return null;

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
              <TextGenerateEffect
                words={`Coming together is a beginning; keeping together is progress;
              working together is success.`}
              />
            </p>
          </blockquote>
          <p
            className={cn(
              "mt-8 text-right text-neutral-500 md:text-lg lg:text-xl",
              archivo.className,
            )}
          >
            - Henry Ford
          </p>
        </div>
      </div>
    </div>
  );
}
