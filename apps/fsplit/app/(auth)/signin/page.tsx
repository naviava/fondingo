import { AuthClient } from "~/components/auth-client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

export default function SignInPage() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <h1 className={cn("mb-10 text-2xl font-bold", hfont.className)}>
        Welcome to FSplit
      </h1>
      <AuthClient />
    </div>
  );
}
