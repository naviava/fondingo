import Link from "next/link";

import { ArrowRight } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Logo } from "~/components/logo";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

export function LandingPageNavbar() {
  return (
    <header className="mx-auto flex h-14 max-w-screen-xl items-center px-4 pt-6 lg:px-6">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <Logo />
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Button
          asChild
          size="sm"
          variant="ctaGhost"
          className={cn(
            "rounded-full bg-[#F5F5F5] px-1.5 font-semibold",
            hfont.className,
          )}
        >
          <Link
            href="/signin"
            className="flex items-center text-xs font-medium underline-offset-4 hover:underline md:text-sm"
            prefetch={false}
          >
            Get started for free
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </nav>
    </header>
  );
}
