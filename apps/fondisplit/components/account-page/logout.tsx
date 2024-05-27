"use client";

import { Button } from "@fondingo/ui/button";
import { signOut } from "next-auth/react";

export function Logout() {
  return (
    <div className="my-6">
      <Button
        size="lg"
        variant="splitGhost"
        onClick={() => signOut()}
        className="w-full rounded-none py-8 hover:bg-neutral-200"
      >
        Log out
      </Button>
    </div>
  );
}
