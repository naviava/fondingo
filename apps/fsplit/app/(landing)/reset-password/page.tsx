import { redirect } from "next/navigation";
import Image from "next/image";

import { serverClient } from "~/lib/trpc/server-client";
import { archivo } from "~/utils";

import { PasswordResetForm } from "~/components/password-reset-form";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  searchParams?: {
    token?: string;
  };
}

export default async function PasswordResetPage({ searchParams }: IProps) {
  if (!searchParams?.token) return redirect("/");
  const token = await serverClient.user.getPasswordResetToken(
    searchParams.token,
  );
  if (!token) return redirect("/");
  return (
    <div
      className={cn(
        "flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 md:min-h-[calc(100vh-440px)] lg:min-h-[calc(100vh-448px)]",
        archivo.className,
      )}
    >
      {Date.now() > new Date(token.expires).getTime() ? (
        <div>
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Token expired
          </h1>
          <div className="relative mx-auto aspect-square w-[300px] md:w-[400px] lg:w-[500px]">
            <Image
              fill
              src="/images/invalid-token.svg"
              alt="Invalid token"
              className="bg-transparent object-cover"
            />
          </div>
          <p className="text-balance text-center font-medium leading-[2em] tracking-wide text-neutral-500 lg:text-lg">
            The password reset token has expired. Please request a new one.
          </p>
        </div>
      ) : (
        <PasswordResetForm token={token} />
      )}
    </div>
  );
}
