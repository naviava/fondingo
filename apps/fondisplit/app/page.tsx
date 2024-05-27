"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@fondingo/ui/button";
import Link from "next/link";
import { calculateDebts } from "~/server/actions/group";

export default function Page() {
  const router = useRouter();
  const session = useSession();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-4">
      Landing Page
      <Button asChild variant="outline">
        <Link href="/groups">Groups page</Link>
      </Button>
      <Button
        variant="outline"
        onClick={async () => await calculateDebts("clwnnyvac004d13by7mwsbje9")}
      >
        Calculate Debts
      </Button>
      {!session.data?.user ? (
        <Button type="button" onClick={() => router.push("/api/auth/signin")}>
          Sign In
        </Button>
      ) : (
        <Button type="button" onClick={() => signOut()}>
          Sign out
        </Button>
      )}
    </div>
  );
}
