"use client";

import { useState } from "react";

import { Button } from "@fondingo/ui/button";
import { signOut } from "next-auth/react";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { Loader } from "@fondingo/ui/lucide";
import { Logo } from "../logo";

export function Logout() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <div className="my-6">
        <Button
          size="lg"
          variant="ctaGhost"
          disabled={isLoading}
          onClick={() => {
            setIsLoading(true);
            signOut({ callbackUrl: "/" });
          }}
          className={cn(
            "w-full rounded-none py-8 hover:bg-neutral-200",
            hfont.className,
          )}
        >
          {isLoading ? <Loader className="h-6 w-6 animate-spin" /> : "Log out"}
        </Button>
      </div>
      <div className="flex flex-col items-center pb-16">
        <Logo />
        <small className="mx-auto mt-6 text-neutral-400">
          © 2024 Fondingo. All rights reserved.
        </small>
      </div>
    </>
  );
}
