"use client";

import { Button } from "@fondingo/ui/button";
import { signOut } from "next-auth/react";

export default function AccountPage() {
  return (
    <div className="flex h-full items-center justify-center pb-24">
      <Button onClick={() => signOut()}>Sign out</Button>
    </div>
  );
}
