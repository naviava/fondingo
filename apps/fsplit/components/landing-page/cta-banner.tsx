import Link from "next/link";

import { LogoImage } from "~/components/logo/logo-image";
import { HeaderAnimation } from "./header-animation";
import { ArrowRight } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

import { archivo, hfont } from "~/utils";
import { cn } from "@fondingo/ui/utils";

export function CTABanner() {
  return (
    <div
      className={cn(
        "mt-40 flex h-[40rem] flex-col items-center justify-center gap-y-14 bg-neutral-200 px-4 text-center lg:gap-y-12",
        archivo.className,
      )}
    >
      <LogoImage className="w-20 lg:w-24" />
      <HeaderAnimation />
      <p className="text-balance text-lg leading-[2em] text-neutral-600 md:text-xl lg:text-2xl">
        Start using <span className="text-cta font-medium">FS</span>plit and
        experience hassle-free group expense management.
      </p>
      <Button
        asChild
        size="lg"
        variant="cta"
        className={cn("rounded-full lg:text-base", hfont.className)}
      >
        <Link href="/signin">
          Get started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
