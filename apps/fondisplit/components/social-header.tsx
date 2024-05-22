import Link from "next/link";

import { OverallGrossBalance } from "~/components/overall-gross-balance";
import { SearchBar } from "~/components/search-bar";
import { Button } from "@fondingo/ui/button";

export function SocialHeader() {
  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
        <SearchBar />
        <Button
          asChild
          variant="ghost"
          className="text-cta hover:text-cta text-base font-semibold md:text-lg"
        >
          <Link href="/create-group">Create group</Link>
        </Button>
      </div>
      <OverallGrossBalance />
    </>
  );
}
