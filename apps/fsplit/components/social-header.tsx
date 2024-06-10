"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { useAddFriendModal } from "@fondingo/store/fsplit";
import { SearchBar } from "~/components/search-bar";
import { usePanel } from "@fondingo/ui/use-panel";
import { Button } from "@fondingo/ui/button";

import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { Loader } from "@fondingo/ui/lucide";

export function SocialHeader() {
  const pathname = usePathname();
  const { topDivRef } = usePanel();
  const { onOpen } = useAddFriendModal();
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div
      ref={topDivRef}
      className="mb-4 flex items-center justify-between gap-x-4 px-4 pt-4"
    >
      <SearchBar />
      {pathname.startsWith("/friends") && (
        <Button
          variant="ghost"
          onClick={onOpen}
          className={cn(
            "text-cta hover:text-cta text-base font-semibold md:text-lg",
            hfont.className,
          )}
        >
          Add friend
        </Button>
      )}
      {pathname.startsWith("/groups") && (
        <Button
          asChild
          variant="ghost"
          onClick={() => setIsNavigating(true)}
          className={cn(
            "text-cta hover:text-cta w-[8rem] text-base font-semibold md:text-lg",
            hfont.className,
          )}
        >
          <Link href="/create-group">
            {isNavigating ? (
              <Loader className="h-6 w-6 animate-spin" />
            ) : (
              "Create group"
            )}
          </Link>
        </Button>
      )}
    </div>
  );
}
