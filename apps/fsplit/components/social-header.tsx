"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAddFriendModal } from "@fondingo/store/fsplit";
import { SearchBar } from "~/components/search-bar";
import { Button } from "@fondingo/ui/button";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

export function SocialHeader() {
  const pathname = usePathname();
  const { onOpen } = useAddFriendModal();

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
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
            className={cn(
              "text-cta hover:text-cta text-base font-semibold md:text-lg",
              hfont.className,
            )}
          >
            <Link href="/create-group">Create group</Link>
          </Button>
        )}
      </div>
    </>
  );
}
