"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAddFriendModal } from "@fondingo/store/fondisplit";
import { SearchBar } from "~/components/search-bar";
import { Button } from "@fondingo/ui/button";

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
            className="text-cta hover:text-cta text-base font-semibold md:text-lg"
          >
            Add friend
          </Button>
        )}
        {pathname.startsWith("/groups") && (
          <Button
            asChild
            variant="ghost"
            className="text-cta hover:text-cta text-base font-semibold md:text-lg"
          >
            <Link href="/create-group">Create group</Link>
          </Button>
        )}
      </div>
    </>
  );
}
