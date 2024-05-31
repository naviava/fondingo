"use client";

import { AuthClient } from "~/components/auth-client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";
import { useAuthForm } from "@fondingo/store/use-auth-form";

export default function SignInPage() {
  const { formType } = useAuthForm();

  return (
    <div
      className={cn(
        "relative flex h-full flex-col items-center justify-center px-4",
        formType === "register" && "py-4",
      )}
    >
      {formType === "signin" && (
        <h1 className={cn("mb-10 text-2xl font-bold", hfont.className)}>
          Welcome to FSplit
        </h1>
      )}
      <AuthClient />
    </div>
  );
}
