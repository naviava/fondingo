"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const session = useSession();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-y-4">
      Landing Page
      {!session.data?.user ? (
        <button onClick={() => router.push("/api/auth/signin")}>Sign In</button>
      ) : (
        <button onClick={() => signOut()}>Sign out</button>
      )}
    </div>
  );
}
