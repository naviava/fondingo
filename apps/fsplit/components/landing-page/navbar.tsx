"use client";

import Link from "next/link";

import { ArrowRight } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";
import { Logo } from "~/components/logo";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function LandingPageNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isLoggedIn = useMemo(
    () => !!session && !!session.user && !!session.user.email,
    [session],
  );

  return (
    <div className={cn("w-full", pathname === "/contact" && "bg-neutral-200")}>
      <header
        className={cn(
          "mx-auto flex h-14 max-w-screen-xl items-center px-4 pt-6 lg:px-6",
          pathname === "/contact" && "bg-neutral-200",
        )}
      >
        <Link
          href="/"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <Logo className={cn(pathname === "/contact" && "z-[1]")} />
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
              className="flex items-center bg-transparent text-xs font-medium underline-offset-4 hover:underline md:text-sm lg:text-base xl:text-lg"
              prefetch={false}
            >
              {isLoggedIn ? "Open app" : "Get started for free"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>
    </div>
  );
}
