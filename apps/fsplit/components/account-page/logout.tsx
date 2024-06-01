"use client";

import { Button } from "@fondingo/ui/button";
import { cn } from "@fondingo/ui/utils";
import { signOut } from "next-auth/react";
import { hfont } from "~/utils";

export function Logout() {
  return (
    <div className="my-6">
      <Button
        size="lg"
        variant="ctaGhost"
        onClick={() => signOut({ callbackUrl: "/" })}
        className={cn(
          "w-full rounded-none py-8 hover:bg-neutral-200",
          hfont.className,
        )}
      >
        Log out
      </Button>
    </div>
  );
}
