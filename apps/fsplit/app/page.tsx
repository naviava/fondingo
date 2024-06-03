"use client";

import Link from "next/link";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@fondingo/ui/button";

export default function Page() {
  const session = useSession();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-4">
      Landing Page
      <Button asChild variant="outline">
        <Link href="/groups">Groups page</Link>
      </Button>
      {!session.data?.user ? (
        <Button asChild type="button">
          <Link href="/signin">Sign In</Link>
        </Button>
      ) : (
        <button type="button" onClick={() => signOut()} className="special">
          <span className="block">Sign out</span>
        </button>
        // <Button type="button" onClick={() => signOut()}>
        //   Sign out
        // </Button>
      )}
    </div>
  );
}
