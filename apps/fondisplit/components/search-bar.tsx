"use client";

import { Search } from "@fondingo/ui/lucide";

export function SearchBar() {
  return (
    <div
      role="button"
      className="text-muted-foreground flex w-[250px] cursor-pointer items-center gap-x-2 rounded-full border border-neutral-300 px-3 py-1"
    >
      <Search size={17} />
      <p>Search</p>
    </div>
  );
}
