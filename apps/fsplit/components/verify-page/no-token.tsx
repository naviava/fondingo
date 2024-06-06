import Image from "next/image";

import { ActionButtons } from "./action-buttons";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

interface IProps {
  email: string;
  isExpired?: boolean;
}

export function NoToken({ email, isExpired }: IProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-6 pb-24">
      <h1
        className={cn(
          "px-4 text-3xl font-medium tracking-wide md:text-4xl",
          hfont.className,
        )}
      >
        Verify your email
      </h1>
      <p
        className={cn(
          "text-balance px-4 text-center text-sm font-medium tracking-wide md:text-base",
          hfont.className,
        )}
      >
        You will need to verify your email to complete registration
      </p>
      <Image
        src="mail-sent.svg"
        alt="No groups yet"
        height={500}
        width={500}
        className="object-cover"
      />
      <p className="text-balance px-2 text-center text-sm tracking-wide text-neutral-500 md:text-base">
        {isExpired ? (
          <span>
            That token has expired. Please click on the "Resend Email" button
            below to generate a new confirmation token for your account.
          </span>
        ) : (
          <span>
            An email has been sent to <span className="font-bold">{email}</span>{" "}
            with a link to verify your account. If you have not received the
            email after a few minutes, please check your spam folder.
          </span>
        )}
      </p>
      <ActionButtons />
    </div>
  );
}
