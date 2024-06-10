"use client";

import Link from "next/link";

import { useAuthForm } from "@fondingo/store/use-auth-form";
import { cn } from "@fondingo/ui/utils";

import { AuthClient } from "~/components/auth-client";
import { Logo } from "~/components/logo";

export default function SignInPage() {
  const { formType } = useAuthForm();

  return (
    <div
      className={cn(
        "relative z-[2] flex h-full flex-col items-center justify-center px-4",
        formType === "register" && "py-4",
      )}
    >
      <Link href="/">
        <h1
          className={cn("mb-10", formType === "register" && "hidden md:block")}
        >
          <Logo className="tracking-wide" />
        </h1>
      </Link>
      <AuthClient />
    </div>
  );
}
